/**
 * ResultCollectorTransformer单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { ResultCollectorTransformer } from '../../../../core/framework/transformer/ResultCollectorTransformer';
import type { TransformContext } from '../../../../types/TransformContext';

describe('ResultCollectorTransformer', () => {
  // 用于所有测试的模拟上下文
  let mockContext: TransformContext;

  // 每个测试前的设置
  beforeEach(() => {
    mockContext = {
      set: vi.fn(),
      get: vi.fn().mockReturnValue([]),
      has: vi.fn(),
      getDocument: vi.fn(),
      getReferences: vi.fn(),
      isDocumentValid: vi.fn(),
      getAllResults: vi.fn().mockReturnValue({
        transformer1: { data: 'result1', config: { value: 1 } },
        transformer2: { data: 'result2', settings: { theme: 'dark' } },
        transformer3: { data: 'result3', config: { key: 'test' } }
      })
    } as unknown as TransformContext;
  });

  test('UT-RESCOL-01: transform应收集所有转换器结果', () => {
    // 准备
    const transformer = new ResultCollectorTransformer();

    // 执行
    const result = transformer.transform({}, mockContext);

    // 断言
    expect(result).toEqual({
      transformer1: { data: 'result1', config: { value: 1 } },
      transformer2: { data: 'result2', settings: { theme: 'dark' } },
      transformer3: { data: 'result3', config: { key: 'test' } }
    });
    expect(mockContext.getAllResults).toHaveBeenCalled();
  });

  test('UT-RESCOL-02: transform应只收集指定转换器结果', () => {
    // 准备
    const transformer = new ResultCollectorTransformer(['transformer1', 'transformer3']);

    // 执行
    const result = transformer.transform({}, mockContext);

    // 断言
    expect(result).toEqual({
      transformer1: { data: 'result1', config: { value: 1 } },
      transformer3: { data: 'result3', config: { key: 'test' } }
    });
    expect(mockContext.getAllResults).toHaveBeenCalled();
  });

  test('UT-RESCOL-03: transform应正确合并结果', () => {
    // 准备 - 直接使用默认的上下文结果
    const transformer = new ResultCollectorTransformer();

    // 执行
    const result = transformer.transform({}, mockContext);

    // 断言 - 验证所有结果被正确返回
    expect(result).toEqual({
      transformer1: { data: 'result1', config: { value: 1 } },
      transformer2: { data: 'result2', settings: { theme: 'dark' } },
      transformer3: { data: 'result3', config: { key: 'test' } }
    });
  });

  test('UT-RESCOL-04: transform应支持深度合并结果', () => {
    // 准备 - 使用shouldMerge参数
    const transformer = new ResultCollectorTransformer(undefined, true);

    // 执行
    const result = transformer.transform({}, mockContext);

    // 断言 - 验证结果被深度合并
    expect(result).toEqual({
      data: 'result3', // 最后一个transformer3的结果覆盖之前的
      config: {
        value: 1,      // 来自transformer1
        key: 'test'    // 来自transformer3
      },
      settings: {
        theme: 'dark'  // 来自transformer2
      }
    });

    // 测试指定转换器的合并
    const specificTransformer = new ResultCollectorTransformer(['transformer1', 'transformer2'], true);
    const specificResult = specificTransformer.transform({}, mockContext);

    // 断言 - 验证只合并了指定的转换器结果
    expect(specificResult).toEqual({
      data: 'result2', // 最后一个transformer2的结果覆盖之前的
      config: {
        value: 1       // 来自transformer1
      },
      settings: {
        theme: 'dark'  // 来自transformer2
      }
    });
  });

  test('UT-RESCOL-NEG-01: transform应处理上下文中没有指定结果的情况', () => {
    // 准备
    const transformer = new ResultCollectorTransformer(['transformer1', 'nonexistent']);

    // 执行
    const result = transformer.transform({}, mockContext);

    // 断言
    expect(result).toEqual({
      transformer1: { data: 'result1', config: { value: 1 } }
    });

    // 验证警告被添加
    expect(mockContext.get).toHaveBeenCalledWith('warnings');
    expect(mockContext.set).toHaveBeenCalled();
    const setCall = mockContext.set as ReturnType<typeof vi.fn>;
    const warningsArg = setCall.mock.calls[0][1];

    // 验证警告包含正确的信息
    expect(warningsArg[0]).toMatchObject({
      code: 'transformer_result_not_found',
      message: expect.stringContaining('nonexistent'),
      transformer: 'resultCollector',
      severity: 'low'
    });
  });
});
