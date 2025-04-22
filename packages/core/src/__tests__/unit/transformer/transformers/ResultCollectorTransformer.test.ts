/**
 * ResultCollectorTransformer单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ResultCollectorTransformer } from '../../../../core/transformer/transformers/ResultCollectorTransformer';
import { TransformContext } from '../../../../types/TransformContext';

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
        transformer1: { data: 'result1' },
        transformer2: { data: 'result2' },
        transformer3: { data: 'result3' }
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
      transformer1: { data: 'result1' },
      transformer2: { data: 'result2' },
      transformer3: { data: 'result3' }
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
      transformer1: { data: 'result1' },
      transformer3: { data: 'result3' }
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
      transformer1: { data: 'result1' },
      transformer2: { data: 'result2' },
      transformer3: { data: 'result3' }
    });
  });

  test('UT-RESCOL-NEG-01: transform应处理上下文中没有指定结果的情况', () => {
    // 准备
    const transformer = new ResultCollectorTransformer(['transformer1', 'nonexistent']);
    
    // 执行
    const result = transformer.transform({}, mockContext);
    
    // 断言
    expect(result).toEqual({
      transformer1: { data: 'result1' }
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