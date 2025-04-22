/**
 * Pipeline单元测试
 * 测试Pipeline的添加和执行功能
 */

import { describe, test, expect, vi } from 'vitest';

import { Pipeline } from '../../../core/transformer/Pipeline';
import { TransformContext } from '../../../core/transformer/TransformContext';
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
    const context = new TransformContext(processingResult);

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
    const context = new TransformContext(processingResult);

    // 监视context.set方法
    const setSpy = vi.spyOn(context, 'set');

    const transformer = {
      name: 'namedTransformer',
      transform: vi.fn().mockReturnValue('transformedData')
    } as unknown as Transformer<unknown, unknown>;

    pipeline.add(transformer);

    // 执行
    pipeline.execute('input', context);

    // 断言
    expect(setSpy).toHaveBeenCalledWith('namedTransformer', 'transformedData');
  });
});
