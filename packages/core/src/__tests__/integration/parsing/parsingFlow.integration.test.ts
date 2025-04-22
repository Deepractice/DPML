import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { parse, parseAsync } from '../../../core/parsing/parsingService';
import { createBasicDPMLFixture, createComplexDPMLFixture, createInvalidDPMLFixture } from '../../fixtures/parsing/dpmlFixtures';
import { DPMLDocument } from '../../../types/DPMLDocument';
import { parserFactory } from '../../../core/parsing/parserFactory';
import { IXMLParser } from '../../../core/parsing/types';
import { XMLAdapter } from '../../../core/parsing/XMLAdapter';
import { DPMLAdapter } from '../../../core/parsing/DPMLAdapter';

/**
 * 集成测试：解析流程
 * 这些测试验证整个解析流程，从解析服务到最终结果
 * 只模拟底层XML解析器，其他组件使用真实实现
 */
describe('解析流程集成测试', () => {
  // 模拟底层XML解析器
  const mockXMLParser: IXMLParser = {
    parse: vi.fn(),
    parseAsync: vi.fn(),
    configure: vi.fn()
  } as unknown as IXMLParser;

  // 备份原始解析器
  let originalXMLParser: any;

  beforeEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();

    // 替换parserFactory中使用的XML解析器
    // 备份原始解析器以便后续恢复
    // @ts-ignore - 访问内部属性进行测试
    originalXMLParser = parserFactory._xmlParser;
    // @ts-ignore - 修改内部属性进行测试
    parserFactory._xmlParser = mockXMLParser;
  });

  afterEach(() => {
    // 恢复原始解析器
    // @ts-ignore - 修改内部属性进行测试
    parserFactory._xmlParser = originalXMLParser;
  });

  test('IT-Parsing-01: 解析服务应完整处理基本DPML', () => {
    // 准备 - 模拟XML解析器返回
    (mockXMLParser.parse as any).mockReturnValue({
      type: 'element',
      name: 'root',
      attributes: {},
      children: [{
        type: 'element',
        name: 'child',
        attributes: { id: 'child1' },
        children: [],
        text: '内容'
      }]
    });

    // 执行
    const result = parse<DPMLDocument>(createBasicDPMLFixture()) as DPMLDocument;

    // 断言
    expect(result).toBeDefined();
    expect(result.rootNode).toBeDefined();
    expect(result.rootNode.tagName).toBe('root');
    expect(result.rootNode.children).toHaveLength(1);
    expect(result.rootNode.children[0].tagName).toBe('child');
    expect(result.rootNode.children[0].attributes.get('id')).toBe('child1');
    expect(result.rootNode.children[0].content).toBe('内容');

    // 验证XML解析器调用
    expect(mockXMLParser.parse).toHaveBeenCalled();
    expect(mockXMLParser.configure).toHaveBeenCalled();
  });

  test('IT-Parsing-02: 解析服务应处理复杂嵌套DPML', () => {
    // 准备 - 模拟XML解析器返回复杂嵌套结构
    (mockXMLParser.parse as any).mockReturnValue({
      type: 'element',
      name: 'root',
      attributes: {},
      children: [
        {
          type: 'element',
          name: 'header',
          attributes: { id: 'header1' },
          children: [
            {
              type: 'element',
              name: 'title',
              attributes: {},
              children: [],
              text: '测试文档'
            },
            {
              type: 'element',
              name: 'meta',
              attributes: { name: 'author', value: '测试人员' },
              children: [],
              text: ''
            }
          ],
          text: ''
        },
        {
          type: 'element',
          name: 'body',
          attributes: {},
          children: [
            {
              type: 'element',
              name: 'section',
              attributes: { id: 'section1' },
              children: [
                { type: 'element', name: 'p', attributes: {}, children: [], text: '第一段落' },
                { type: 'element', name: 'p', attributes: {}, children: [], text: '第二段落' }
              ],
              text: ''
            }
          ],
          text: ''
        }
      ]
    });

    // 执行
    const result = parse<DPMLDocument>(createComplexDPMLFixture()) as DPMLDocument;

    // 断言
    expect(result.rootNode.tagName).toBe('root');
    expect(result.rootNode.children).toHaveLength(2);

    // 验证header部分
    const header = result.rootNode.children[0];
    expect(header.tagName).toBe('header');
    expect(header.attributes.get('id')).toBe('header1');
    expect(header.children).toHaveLength(2);
    expect(header.children[0].tagName).toBe('title');
    expect(header.children[0].content).toBe('测试文档');

    // 验证节点ID索引
    expect(result.nodesById).toBeDefined();
    expect(result.nodesById!.has('header1')).toBe(true);
    expect(result.nodesById!.has('section1')).toBe(true);

    // 验证父子关系
    expect(header.children[0].parent).toBe(header);
    expect(header.parent).toBe(result.rootNode);
  });

  test('IT-Parsing-03: 解析服务应正确处理解析错误', () => {
    // 准备 - 模拟XML解析器抛出错误
    const parseError = new Error('XML语法错误: 未闭合的标签');
    (mockXMLParser.parse as any).mockImplementation(() => {
      throw parseError;
    });

    // 禁用DPMLAdapter中的预验证，以确保错误能够传到XMLParser
    // 在真实场景下保留预验证，但在测试中临时禁用
    const originalPrevalidate = DPMLAdapter.prototype.prevalidateXML;
    DPMLAdapter.prototype.prevalidateXML = () => {};

    try {
      // 执行 & 断言
      expect(() => {
        parse(createInvalidDPMLFixture(), { throwOnError: true });
      }).toThrow();

      // 验证错误处理
      expect(mockXMLParser.parse).toHaveBeenCalled();
    } finally {
      // 恢复原始方法
      DPMLAdapter.prototype.prevalidateXML = originalPrevalidate;
    }
  });

  test('IT-Parsing-04: 异步解析流程应正确工作', async () => {
    // 准备 - 模拟XML解析器异步返回
    (mockXMLParser.parseAsync as any).mockResolvedValue({
      type: 'element',
      name: 'root',
      attributes: {},
      children: [{
        type: 'element',
        name: 'child',
        attributes: { id: 'child1' },
        children: [],
        text: '异步内容'
      }]
    });

    // 执行
    const result = await parseAsync<DPMLDocument>(createBasicDPMLFixture()) as DPMLDocument;

    // 断言
    expect(result.rootNode.tagName).toBe('root');
    expect(result.rootNode.children).toHaveLength(1);
    expect(result.rootNode.children[0].content).toBe('异步内容');

    // 验证异步调用
    expect(mockXMLParser.parseAsync).toHaveBeenCalled();
    expect(mockXMLParser.configure).toHaveBeenCalled();
  });
});