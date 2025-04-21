/**
 * ParserImpl单元测试
 */
import { readFile } from 'fs/promises';

import { describe, test, expect, vi, beforeEach } from 'vitest';

import { ParserImpl } from '../../../../core/parser/ParserImpl';
import { TagRegistryImpl } from '../../../../core/parser/TagRegistryImpl';
import { Validator } from '../../../../core/parser/Validator';
import { XmlParserAdapter } from '../../../../core/parser/XmlParserAdapter';
import { XmlToNodeConverter } from '../../../../core/parser/XmlToNodeConverter';
import { ContentModel } from '../../../../types';
import type { DPMLNode, TagRegistry } from '../../../../types';
import { ParseError } from '../../../../types/ParseError';

// 模拟fs模块
vi.mock('fs/promises', () => ({
  readFile: vi.fn()
}));

describe('UT-Parser-BasicParse', () => {
  let parser: ParserImpl;
  let tagRegistry: TagRegistry;
  let mockXmlNode: Record<string, unknown>;
  let mockDpmlNode: DPMLNode;

  beforeEach(() => {
    // 创建标签注册表
    tagRegistry = new TagRegistryImpl();

    // 注册测试标签
    tagRegistry.registerAll([
      {
        name: 'root',
        contentModel: ContentModel.CHILDREN_ONLY,
        allowedChildren: ['section', 'paragraph'],
        allowedAttributes: ['id', 'class'],
        requiredAttributes: ['id']
      },
      {
        name: 'section',
        contentModel: ContentModel.CHILDREN_ONLY,
        allowedChildren: ['paragraph', 'list'],
        allowedAttributes: ['id', 'title'],
        requiredAttributes: ['title']
      }
    ]);

    // 创建解析器
    parser = new ParserImpl(tagRegistry);

    // 创建模拟XML节点
    mockXmlNode = {
      name: 'root',
      attributes: { id: 'root1' },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 3, column: 10, offset: 50 }
      }
    };

    // 创建模拟DPML节点
    mockDpmlNode = {
      tagName: 'root',
      id: 'root1',
      attributes: new Map([['id', 'root1']]),
      children: [],
      content: '',
      parent: null,
      sourceLocation: {
        startLine: 1,
        startColumn: 1,
        endLine: 3,
        endColumn: 10,
        getLineSnippet: () => '<root id="root1"></root>'
      },

      setId(id: string): void {
        this.id = id;
      },

      getId(): string | null {
        return this.id;
      },

      hasId(): boolean {
        return this.id !== null;
      },

      getAttributeValue(name: string): string | null {
        return this.attributes.get(name) || null;
      },

      hasAttribute(name: string): boolean {
        return this.attributes.has(name);
      },

      setAttribute(name: string, value: string): void {
        this.attributes.set(name, value);
      },

      appendChild(childNode: DPMLNode): void {
        this.children.push(childNode);
        childNode.parent = this;
      },

      removeChild(childNode: DPMLNode): void {
        const index = this.children.indexOf(childNode);

        if (index !== -1) {
          this.children.splice(index, 1);
          childNode.parent = null;
        }
      },

      hasChildren(): boolean {
        return this.children.length > 0;
      },

      hasContent(): boolean {
        return this.content !== '';
      }
    };

    // 模拟XmlParserAdapter.parse方法
    vi.spyOn(XmlParserAdapter.prototype, 'parse').mockReturnValue(mockXmlNode);

    // 模拟XmlToNodeConverter.convert方法
    vi.spyOn(XmlToNodeConverter.prototype, 'convert').mockReturnValue(mockDpmlNode);

    // 模拟Validator.validateDocument方法
    vi.spyOn(Validator.prototype, 'validateDocument').mockReturnValue({
      valid: true,
      errors: [],
      warnings: []
    });
  });

  test('should parse DPML content', () => {
    const content = '<root id="root1"></root>';
    const document = parser.parse(content);

    expect(document).toBeDefined();
    expect(document.rootNode).toBe(mockDpmlNode);
    expect(document.nodesById.get('root1')).toBe(mockDpmlNode);
  });

  test('should parse DPML content with options', () => {
    const content = '<root id="root1"></root>';
    const options = {
      fileName: 'test.dpml',
      validateOnParse: true,
      throwOnError: true
    };

    const document = parser.parse(content, options);

    expect(document).toBeDefined();
    expect(document.fileName).toBe('test.dpml');
    expect(XmlParserAdapter.prototype.parse).toHaveBeenCalledWith(content);
    expect(XmlToNodeConverter.prototype.convert).toHaveBeenCalledWith(mockXmlNode);
    expect(Validator.prototype.validateDocument).toHaveBeenCalled();
  });

  test('should throw error when validation fails and throwOnError is true', () => {
    // 模拟验证失败
    vi.spyOn(Validator.prototype, 'validateDocument').mockReturnValue({
      valid: false,
      errors: [
        {
          type: 0, // 任意错误类型
          message: '验证失败',
          node: mockDpmlNode,
          location: mockDpmlNode.sourceLocation
        }
      ],
      warnings: []
    });

    const content = '<root id="root1"></root>';
    const options = {
      validateOnParse: true,
      throwOnError: true
    };

    expect(() => parser.parse(content, options)).toThrow(ParseError);
    expect(() => parser.parse(content, options)).toThrow('文档验证失败');
  });

  test('should not throw error when validation fails but throwOnError is false', () => {
    // 模拟验证失败
    vi.spyOn(Validator.prototype, 'validateDocument').mockReturnValue({
      valid: false,
      errors: [
        {
          type: 0, // 任意错误类型
          message: '验证失败',
          node: mockDpmlNode,
          location: mockDpmlNode.sourceLocation
        }
      ],
      warnings: []
    });

    const content = '<root id="root1"></root>';
    const options = {
      validateOnParse: true,
      throwOnError: false
    };

    const document = parser.parse(content, options);

    expect(document).toBeDefined();
  });

  test('should not validate when validateOnParse is false', () => {
    const content = '<root id="root1"></root>';
    const options = {
      validateOnParse: false
    };

    parser.parse(content, options);

    expect(Validator.prototype.validateDocument).not.toHaveBeenCalled();
  });

  test('should handle XML parsing errors', () => {
    // 模拟XML解析错误
    vi.spyOn(XmlParserAdapter.prototype, 'parse').mockImplementation(() => {
      throw new Error('XML解析错误');
    });

    const content = '<root id="root1">';

    expect(() => parser.parse(content)).toThrow(ParseError);
    expect(() => parser.parse(content)).toThrow('解析DPML内容失败');
  });
});

describe('UT-Parser-FileIO', () => {
  let parser: ParserImpl;

  beforeEach(() => {
    parser = new ParserImpl();

    // 模拟fs.readFile
    (readFile as jest.Mock).mockResolvedValue('<root id="root1"></root>');

    // 模拟parse方法
    vi.spyOn(ParserImpl.prototype, 'parse').mockReturnValue({
      rootNode: {} as DPMLNode,
      nodesById: new Map(),
      getNodeById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      toString: () => ''
    });
  });

  test('should parse DPML file', async () => {
    const filePath = 'test.dpml';
    const document = await parser.parseFile(filePath);

    expect(document).toBeDefined();
    expect(readFile).toHaveBeenCalledWith(filePath, { encoding: 'utf-8' });
    expect(ParserImpl.prototype.parse).toHaveBeenCalled();
  });

  test('should parse DPML file with options', async () => {
    const filePath = 'test.dpml';
    const options = {
      encoding: 'latin1',
      validateOnParse: true
    };

    const document = await parser.parseFile(filePath, options);

    expect(document).toBeDefined();
    expect(readFile).toHaveBeenCalledWith(filePath, { encoding: 'latin1' });
    expect(ParserImpl.prototype.parse).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        encoding: 'latin1',
        validateOnParse: true,
        fileName: 'test.dpml'
      })
    );
  });

  test('should handle file reading errors', async () => {
    // 模拟文件读取错误
    (readFile as jest.Mock).mockRejectedValue(new Error('文件不存在'));

    const filePath = 'nonexistent.dpml';

    await expect(parser.parseFile(filePath)).rejects.toThrow(ParseError);
    await expect(parser.parseFile(filePath)).rejects.toThrow('解析文件');
  });
});

describe('UT-Parser-ValidateOnParse', () => {
  let parser: ParserImpl;

  beforeEach(() => {
    parser = new ParserImpl();

    // 模拟validateNode和validateDocument方法
    vi.spyOn(Validator.prototype, 'validateNode').mockReturnValue({
      valid: true,
      errors: [],
      warnings: []
    });

    vi.spyOn(Validator.prototype, 'validateDocument').mockReturnValue({
      valid: true,
      errors: [],
      warnings: []
    });
  });

  test('should validate node', () => {
    const node = {} as DPMLNode;
    const result = parser.validateNode(node);

    expect(result).toBe(true);
    expect(Validator.prototype.validateNode).toHaveBeenCalledWith(node);
  });

  test('should validate document', () => {
    const document = {
      rootNode: {} as DPMLNode,
      nodesById: new Map(),
      getNodeById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      toString: () => ''
    };

    const result = parser.validateDocument(document);

    expect(result).toBe(true);
    expect(Validator.prototype.validateDocument).toHaveBeenCalledWith(document);
  });
});
