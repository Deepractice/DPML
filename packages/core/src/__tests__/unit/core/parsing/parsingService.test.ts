import { describe, test, expect, vi, beforeEach } from 'vitest';

import { DPMLAdapter } from '../../../../core/parsing/DPMLAdapter';
import type { ParseResult } from '../../../../core/parsing/errors';
import { XMLParseError, DPMLParseError } from '../../../../core/parsing/errors';
import { parserFactory } from '../../../../core/parsing/parserFactory';
import { parse, parseAsync } from '../../../../core/parsing/parsingService';
import type { DPMLDocument } from '../../../../types/DPMLDocument';
import { createBasicDPMLFixture, createInvalidDPMLFixture } from '../../../fixtures/parsing/dpmlFixtures';

// 模拟依赖模块
vi.mock('../../../../core/parsing/parserFactory');

describe('parsingService', () => {
  // 模拟DPML适配器
  const mockDPMLAdapter = {
    parse: vi.fn(),
    parseAsync: vi.fn()
  };

  beforeEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();

    // 设置工厂方法返回模拟适配器
    (parserFactory.createDPMLAdapter as any).mockReturnValue(mockDPMLAdapter);
  });

  test('UT-ParsingService-01: parse方法应协调适配器解析内容', () => {
    // 准备 - 模拟解析结果
    const mockDocument: DPMLDocument = {
      rootNode: {
        tagName: 'root',
        attributes: new Map(),
        children: [],
        content: '',
        parent: null
      },
      nodesById: new Map(),
      metadata: {}
    };

    mockDPMLAdapter.parse.mockReturnValue(mockDocument);

    // 执行
    const content = createBasicDPMLFixture();
    const options = { throwOnError: true };
    const result = parse<DPMLDocument>(content, options);

    // 断言
    expect(parserFactory.createDPMLAdapter).toHaveBeenCalledWith(options);
    expect(mockDPMLAdapter.parse).toHaveBeenCalledWith(content);
    expect(result).toBe(mockDocument);
  });

  test('UT-ParsingService-02: parse方法应统一处理错误', () => {
    // 准备 - 模拟解析错误
    const parseError = new Error('解析失败');

    mockDPMLAdapter.parse.mockImplementation(() => {
      throw parseError;
    });

    // 执行 & 断言 - 应抛出增强的错误
    expect(() => {
      parse(createInvalidDPMLFixture(), { throwOnError: true });
    }).toThrow();

    // 验证适配器创建和调用
    expect(parserFactory.createDPMLAdapter).toHaveBeenCalled();
    expect(mockDPMLAdapter.parse).toHaveBeenCalled();
  });

  test('UT-ParsingService-03: parse方法应使用默认选项', () => {
    // 准备
    mockDPMLAdapter.parse.mockReturnValue({ rootNode: {}, metadata: {} });

    // 执行
    parse(createBasicDPMLFixture());

    // 断言 - 应使用空对象作为默认选项
    expect(parserFactory.createDPMLAdapter).toHaveBeenCalledWith({});
  });

  test('UT-ParsingService-04: parseAsync方法应支持异步解析', async () => {
    // 准备 - 模拟异步解析结果
    const mockDocument: DPMLDocument = {
      rootNode: {
        tagName: 'root',
        attributes: new Map(),
        children: [],
        content: '',
        parent: null
      },
      nodesById: new Map(),
      metadata: {}
    };

    mockDPMLAdapter.parseAsync.mockResolvedValue(mockDocument);

    // 执行
    const content = createBasicDPMLFixture();
    const options = { throwOnError: true };
    const result = await parseAsync<DPMLDocument>(content, options);

    // 断言
    expect(parserFactory.createDPMLAdapter).toHaveBeenCalledWith(options);
    expect(mockDPMLAdapter.parseAsync).toHaveBeenCalledWith(content);
    expect(result).toBe(mockDocument);
  });

  test('parseAsync方法应处理异步错误', async () => {
    // 准备 - 模拟异步解析错误
    const parseError = new Error('异步解析失败');

    mockDPMLAdapter.parseAsync.mockRejectedValue(parseError);

    // 执行 & 断言 - 应抛出增强的错误
    await expect(
      parseAsync(createInvalidDPMLFixture(), { throwOnError: true })
    ).rejects.toThrow();

    // 验证适配器创建和调用
    expect(parserFactory.createDPMLAdapter).toHaveBeenCalled();
    expect(mockDPMLAdapter.parseAsync).toHaveBeenCalled();
  });

  test('UT-ParsingService-05: handleParsingErrors应正确处理XML错误', () => {
    // 准备 - 模拟 XML 解析错误
    const xmlError = new XMLParseError(
      'XML语法错误: 未闭合的标签',
      undefined,
      { startLine: 1, startColumn: 10, endLine: 1, endColumn: 20, fileName: 'test.dpml' },
      '<root><child>'
    );

    mockDPMLAdapter.parse.mockImplementation(() => {
      throw xmlError;
    });

    // 执行 & 断言 - 应抛出原始 XML 错误
    expect(() => {
      parse(createInvalidDPMLFixture(), { throwOnError: true });
    }).toThrow(XMLParseError);

    // 验证错误包含位置信息
    try {
      parse(createInvalidDPMLFixture(), { throwOnError: true });
    } catch (error) {
      expect(error).toBeInstanceOf(XMLParseError);
      expect((error as XMLParseError).position).toBeDefined();
      expect((error as XMLParseError).source).toBeDefined();
    }
  });

  test('UT-ParsingService-06: handleParsingErrors应正确处理DPML错误', () => {
    // 准备 - 模拟 DPML 解析错误
    const dpmlError = new DPMLParseError(
      '缺少必需的标签: role',
      undefined,
      { startLine: 2, startColumn: 5, endLine: 2, endColumn: 15, fileName: 'test.dpml' }
    );

    mockDPMLAdapter.parse.mockImplementation(() => {
      throw dpmlError;
    });

    // 执行 & 断言 - 应抛出原始 DPML 错误
    expect(() => {
      parse(createInvalidDPMLFixture(), { throwOnError: true });
    }).toThrow(DPMLParseError);

    // 验证错误包含位置信息
    try {
      parse(createInvalidDPMLFixture(), { throwOnError: true });
    } catch (error) {
      expect(error).toBeInstanceOf(DPMLParseError);
      expect((error as DPMLParseError).position).toBeDefined();
      expect((error as DPMLParseError).message).toContain('role');
    }
  });

  test('UT-ParsingService-07: 验证throwOnError选项行为', () => {
    // 准备 - 模拟解析错误
    const parseError = new DPMLParseError('测试错误');

    mockDPMLAdapter.parse.mockImplementation(() => {
      throw parseError;
    });

    // 执行 & 断言 - throwOnError 为 true 时应抛出错误
    expect(() => {
      parse(createInvalidDPMLFixture(), { throwOnError: true });
    }).toThrow(DPMLParseError);

    // 执行 & 断言 - throwOnError 为 false 时应返回错误结果
    const result = parse(createInvalidDPMLFixture(), { throwOnError: false }) as ParseResult<DPMLDocument>;

    // 验证结果结构
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(DPMLParseError);
    expect(result.data).toBeUndefined();
  });
});
