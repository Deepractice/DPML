/**
 * Transformer API契约测试
 * 验证API层转换器函数的签名和行为保持稳定
 */

// mock必须在import之前
import { vi } from 'vitest';

// 模拟transformerService
vi.mock('../../../core/transformer/transformerService', () => ({
  transformerService: {
    transform: vi.fn().mockReturnValue({
      transformers: { test: 'value' },
      merged: 'test result',
      raw: 'raw data',
      warnings: [],
      metadata: {
        transformers: ['test'],
        options: {},
        timestamp: Date.now()
      }
    }),
    registerTransformer: vi.fn()
  }
}));

import { describe, test, expectTypeOf, expect } from 'vitest';

import {
  transform,
  registerTransformer
} from '../../../api/transformer';
import type {
  ProcessingResult,
  Transformer,
  TransformOptions,
  TransformResult
} from '../../../types';

describe('Transformer API Contract', () => {
  // CT-API-TRANS-01
  test('transform<T> API should maintain type signature', () => {
    // 验证函数存在
    expectTypeOf(transform).toBeFunction();

    // 验证参数类型
    expectTypeOf(transform<unknown>).parameters.toMatchTypeOf<[
      ProcessingResult,
      TransformOptions?
    ]>();

    // 验证返回类型
    expectTypeOf(transform<string>).returns.toMatchTypeOf<TransformResult<string>>();
    expectTypeOf(transform<number>).returns.toMatchTypeOf<TransformResult<number>>();
    expectTypeOf(transform<{ id: string }>).returns.toMatchTypeOf<TransformResult<{ id: string }>>();
  });

  // CT-API-TRANS-02
  test('registerTransformer API should maintain type signature', () => {
    // 验证函数存在
    expectTypeOf(registerTransformer).toBeFunction();

    // 验证参数类型 - 使用具体的测试类型
    type TestTransformer = Transformer<string, number>;
    const testTransformer: TestTransformer = {
      name: 'test',
      transform: (input: string) => Number(input)
    };

    // 不能直接检查参数类型的泛型约束，所以验证一个实例
    // 应该能通过编译时检查
    registerTransformer(testTransformer);

    // 验证返回类型
    expectTypeOf(registerTransformer).returns.toBeVoid();
  });

  // CT-API-TRANS-04
  test('transform<T> API should return result conforming to TransformResult interface', () => {
    // 执行测试
    const mockProcessingResult = {} as ProcessingResult;
    const result = transform<string>(mockProcessingResult);

    // 验证结果符合接口
    expect(result).toHaveProperty('transformers');
    expect(result).toHaveProperty('merged');
    expect(result).toHaveProperty('metadata');
  });

  // CT-API-TRANS-05
  test('transform<T> API should support custom result types', () => {
    // 测试自定义类型
    interface CustomType {
      id: string;
      values: number[];
      nested: {
        field: boolean;
      };
    }

    // 验证可以使用自定义类型作为泛型参数
    expectTypeOf(transform<CustomType>).returns.toMatchTypeOf<TransformResult<CustomType>>();
    expectTypeOf<TransformResult<CustomType>['merged']>().toMatchTypeOf<CustomType>();
  });
});
