/**
 * Pipeline单元测试
 * 测试Pipeline的添加和执行功能
 */

import { describe, test, expect, vi } from 'vitest';

import { Pipeline } from '../../../core/transformer/Pipeline';
import { TransformContext } from '../../../types/TransformContext';
import type { ProcessingResult } from '../../../types/ProcessingResult';
import type { Transformer } from '../../../types/Transformer';

describe('Pipeline', () => {
  // 创建一个基本的ProcessingResult模拟对象
  const createMockProcessingResult = (): ProcessingResult => {
    return {
      document: { rootNode: {} } as any,
      isValid: true,
      references: {} as any
    };
  };

  test('should add transformers to the pipeline', () => {
    // 准备
    const pipeline = new Pipeline();
    const transformer = {
      name: 'testTransformer',
      transform: vi.fn()
    } as unknown as Transformer<unknown, unknown>;
    
    // 执行
    const result = pipeline.add(transformer);
    
    // 断言
    expect(result).toBe(pipeline); // 返回自身以支持链式调用
    // 注意：由于transformers是私有的，我们只能通过行为来测试，无法直接检查内部数组
  });
  
  test('should execute transformers in order', () => {
    // 准备
    const pipeline = new Pipeline();
    const processingResult = createMockProcessingResult();
    const context = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      getDocument: vi.fn(),
      getReferences: vi.fn(),
      getValidation: vi.fn(),
      isDocumentValid: vi.fn(),
      getAllResults: vi.fn()
    } as unknown as TransformContext;
    
    const transformer1 = {
      name: 'transformer1',
      transform: vi.fn().mockReturnValue('result1')
    } as unknown as Transformer<unknown, unknown>;
    
    const transformer2 = {
      name: 'transformer2',
      transform: vi.fn().mockReturnValue('result2')
    } as unknown as Transformer<unknown, unknown>;
    
    pipeline.add(transformer1).add(transformer2);
    
    // 执行
    const result = pipeline.execute('input', context);
    
    // 断言
    expect(transformer1.transform).toHaveBeenCalledWith('input', context);
    expect(transformer2.transform).toHaveBeenCalledWith('result1', context);
    expect(result).toBe('result2');
  });
  
  test('should store transformer results in context if name is provided', () => {
    // 准备
    const pipeline = new Pipeline();
    const processingResult = createMockProcessingResult();
    const context = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      getDocument: vi.fn(),
      getReferences: vi.fn(),
      getValidation: vi.fn(),
      isDocumentValid: vi.fn(),
      getAllResults: vi.fn()
    } as unknown as TransformContext;
    
    const transformer = {
      name: 'namedTransformer',
      transform: vi.fn().mockReturnValue('transformedData')
    } as unknown as Transformer<unknown, unknown>;
    
    pipeline.add(transformer);
    
    // 执行
    pipeline.execute('input', context);
    
    // 断言
    expect(context.set).toHaveBeenCalledWith('namedTransformer', 'transformedData');
  });

  test('UT-PIPE-NEG-01: execute应处理转换器抛出异常的情况', () => {
    // 准备
    const pipeline = new Pipeline();
    const processingResult = createMockProcessingResult();
    const context = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      getDocument: vi.fn(),
      getReferences: vi.fn(),
      getValidation: vi.fn(),
      isDocumentValid: vi.fn(),
      getAllResults: vi.fn()
    } as unknown as TransformContext;
    const error = new Error('转换器异常');

    // 模拟console.error以避免测试输出中的错误信息
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const transformer = {
      name: 'errorTransformer',
      transform: vi.fn().mockImplementation(() => {
        throw error;
      })
    } as unknown as Transformer<unknown, unknown>;

    pipeline.add(transformer);

    // 执行和断言
    expect(() => {
      pipeline.execute('input', context);
    }).toThrow(error);

    // 验证错误被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Pipeline execution error');

    // 清理
    consoleErrorSpy.mockRestore();
  });

  test('should return input as output when pipeline is empty', () => {
    // 准备
    const pipeline = new Pipeline();
    const processingResult = createMockProcessingResult();
    const context = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      getDocument: vi.fn(),
      getReferences: vi.fn(),
      getValidation: vi.fn(),
      isDocumentValid: vi.fn(),
      getAllResults: vi.fn()
    } as unknown as TransformContext;
    const input = { test: 'data' };

    // 执行
    const result = pipeline.execute(input, context);

    // 断言 - 空管道应返回输入作为输出
    expect(result).toBe(input);
  });
}); 