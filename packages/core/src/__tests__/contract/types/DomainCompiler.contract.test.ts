/**
 * DomainCompiler接口契约测试
 * 验证DomainCompiler接口的结构和泛型支持
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { DomainCompiler, Schema, Transformer, DomainConfig } from '../../../types';

// 测试用类型
interface TestModel {
  id: string;
  name: string;
  properties: Record<string, unknown>;
}

describe('DomainCompiler Interface Contract', () => {
  // CT-TYPE-DCOMP-01: DomainCompiler接口应维持结构稳定性
  test('CT-TYPE-DCOMP-01: DomainCompiler接口应维持结构稳定性', () => {
    // 验证接口的必要方法存在
    expectTypeOf<DomainCompiler<unknown>>().toHaveProperty('compile');
    expectTypeOf<DomainCompiler<unknown>>().toHaveProperty('extend');
    expectTypeOf<DomainCompiler<unknown>>().toHaveProperty('getSchema');
    expectTypeOf<DomainCompiler<unknown>>().toHaveProperty('getTransformers');

    // 验证方法的类型
    expectTypeOf<DomainCompiler<unknown>['compile']>().toBeFunction();
    expectTypeOf<DomainCompiler<unknown>['extend']>().toBeFunction();
    expectTypeOf<DomainCompiler<unknown>['getSchema']>().toBeFunction();
    expectTypeOf<DomainCompiler<unknown>['getTransformers']>().toBeFunction();

    // 验证方法参数和返回值类型
    expectTypeOf<DomainCompiler<unknown>['compile']>().parameters.toMatchTypeOf<[string]>();
    expectTypeOf<DomainCompiler<unknown>['extend']>().parameters.toMatchTypeOf<[Partial<DomainConfig>]>();
    expectTypeOf<DomainCompiler<unknown>['getSchema']>().parameters.toMatchTypeOf<[]>();
    expectTypeOf<DomainCompiler<unknown>['getTransformers']>().parameters.toMatchTypeOf<[]>();

    expectTypeOf<DomainCompiler<unknown>['getSchema']>().returns.toMatchTypeOf<Schema>();
    expectTypeOf<DomainCompiler<unknown>['getTransformers']>().returns.toMatchTypeOf<Array<Transformer<unknown, unknown>>>();
  });

  // CT-TYPE-DCOMP-02: DomainCompiler.compile应返回Promise<T>
  test('CT-TYPE-DCOMP-02: DomainCompiler.compile应返回Promise<T>', () => {
    // 验证泛型参数T正确应用于compile方法的返回值
    expectTypeOf<DomainCompiler<TestModel>['compile']>().returns.toMatchTypeOf<Promise<TestModel>>();

    // 验证不同类型的泛型约束
    expectTypeOf<DomainCompiler<string>['compile']>().returns.toMatchTypeOf<Promise<string>>();
    expectTypeOf<DomainCompiler<number>['compile']>().returns.toMatchTypeOf<Promise<number>>();
    expectTypeOf<DomainCompiler<boolean>['compile']>().returns.toMatchTypeOf<Promise<boolean>>();
    expectTypeOf<DomainCompiler<any[]>['compile']>().returns.toMatchTypeOf<Promise<any[]>>();
    expectTypeOf<DomainCompiler<Record<string, unknown>>['compile']>().returns.toMatchTypeOf<Promise<Record<string, unknown>>>();

    // 验证嵌套复杂类型
    type ComplexType = {
      data: TestModel[];
      metadata: {
        version: number;
        generated: Date;
      };
    };

    expectTypeOf<DomainCompiler<ComplexType>['compile']>().returns.toMatchTypeOf<Promise<ComplexType>>();
  });
});
