/**
 * Transformer接口契约测试
 * 验证Transformer接口的稳定性
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { Transformer, TransformContext } from '../../../types';

// 创建一个符合接口的测试类型
type TestInput = { input: string };
type TestOutput = { output: number };

// 测试接口定义
describe('Transformer Interface Contract', () => {
  test('Transformer interface should have required properties and methods', () => {
    // 定义一个符合Transformer接口的对象类型
    type TestTransformer = Transformer<TestInput, TestOutput>;

    // 验证接口定义了name属性
    expectTypeOf<TestTransformer>().toHaveProperty('name');
    expectTypeOf<TestTransformer['name']>().toBeString();

    // 验证接口可能定义了description属性
    expectTypeOf<TestTransformer>().toHaveProperty('description');
    expectTypeOf<TestTransformer['description']>().toBeNullable();

    // 验证接口定义了transform方法
    expectTypeOf<TestTransformer>().toHaveProperty('transform');
    expectTypeOf<TestTransformer['transform']>().toBeFunction();

    // 验证transform方法的签名
    expectTypeOf<TestTransformer['transform']>().parameters.toMatchTypeOf<[TestInput, TransformContext]>();
    expectTypeOf<TestTransformer['transform']>().returns.toMatchTypeOf<TestOutput>();
  });

  test('Transformer interface should support generic types', () => {
    // 使用不同的泛型参数
    type StringTransformer = Transformer<string, number>;
    type ObjectTransformer = Transformer<{a: number}, {b: string}>;
    type ComplexTransformer = Transformer<Map<string, any>, Array<{id: string}>>;

    // 验证泛型参数正确应用于transform方法
    expectTypeOf<StringTransformer['transform']>().parameters.toMatchTypeOf<[string, TransformContext]>();
    expectTypeOf<StringTransformer['transform']>().returns.toBeNumber();

    expectTypeOf<ObjectTransformer['transform']>().parameters.toMatchTypeOf<[{a: number}, TransformContext]>();
    expectTypeOf<ObjectTransformer['transform']>().returns.toMatchTypeOf<{b: string}>();

    expectTypeOf<ComplexTransformer['transform']>().parameters.toMatchTypeOf<[Map<string, any>, TransformContext]>();
    expectTypeOf<ComplexTransformer['transform']>().returns.toMatchTypeOf<Array<{id: string}>>();
  });
});
