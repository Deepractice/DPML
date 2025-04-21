/**
 * ParserService API单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { parse, parseFile, parseWithRegistry, validateDocument } from '../../../api/ParserService';
import { Parser } from '../../../core/parser/Parser';
import type { DPMLDocument, DPMLNode, TagRegistry } from '../../../types';

// 模拟Parser
vi.mock('../../../core/parser/Parser', () => {
  const Parser = vi.fn();

  Parser.prototype.parse = vi.fn();
  Parser.prototype.parseFile = vi.fn();
  Parser.prototype.validateDocument = vi.fn();

  return { Parser };
});

describe('UT-API-ParserService', () => {
  let mockDocument: DPMLDocument;

  beforeEach(() => {
    // 创建模拟文档对象
    mockDocument = {
      rootNode: {} as DPMLNode,
      nodesById: new Map(),
      getNodeById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      toString: () => ''
    };

    // 重置模拟函数
    vi.clearAllMocks();

    // 设置模拟返回值
    (Parser.prototype.parse as jest.Mock).mockReturnValue(mockDocument);
    (Parser.prototype.parseFile as jest.Mock).mockResolvedValue(mockDocument);
    (Parser.prototype.validateDocument as jest.Mock).mockReturnValue(true);
  });

  test('should parse DPML content', () => {
    const content = '<root id="root1"></root>';
    const options = { validateOnParse: true };

    const document = parse(content, options);

    expect(document).toBe(mockDocument);
    expect(Parser.prototype.parse).toHaveBeenCalledWith(content, options);
  });

  test('should parse DPML file', async () => {
    const filePath = 'test.dpml';
    const options = { encoding: 'utf-8' };

    const document = await parseFile(filePath, options);

    expect(document).toBe(mockDocument);
    expect(Parser.prototype.parseFile).toHaveBeenCalledWith(filePath, options);
  });

  test('should parse with custom registry', () => {
    const content = '<root id="root1"></root>';
    const options = { validateOnParse: true };
    const registry = {} as TagRegistry;

    const document = parseWithRegistry(content, options, registry);

    expect(document).toBe(mockDocument);
    expect(Parser).toHaveBeenCalledWith(registry);
    expect(Parser.prototype.parse).toHaveBeenCalledWith(content, options);
  });

  test('should validate document', () => {
    const document = mockDocument;

    const result = validateDocument(document);

    expect(result).toBe(true);
    expect(Parser.prototype.validateDocument).toHaveBeenCalledWith(document);
  });

  test('should reuse the same parser instance', () => {
    parse('<root></root>');
    parse('<root></root>');

    // 第二次调用parse时应该使用相同的解析器实例
    // 所以parse方法应该被调用两次
    expect(Parser.prototype.parse).toHaveBeenCalledTimes(2);
  });

  test('should create new parser for parseWithRegistry', () => {
    parseWithRegistry('<root></root>');
    parseWithRegistry('<root></root>');

    // 每次调用parseWithRegistry都应该创建新的Parser实例
    expect(Parser).toHaveBeenCalledTimes(2);
  });
});
