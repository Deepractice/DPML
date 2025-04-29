/**
 * Framework API契约测试
 * 验证createDomainDPML API的契约稳定性和泛型支持
 */

import { describe, test, expectTypeOf, expect } from 'vitest';

import { createDomainDPML } from '../../../api/framework';
import type {
  DomainCompiler,
  DomainConfig,
  Schema,
  Transformer
} from '../../../types';

// 测试用模型类型
interface TestModel {
  id: string;
  name: string;
  data: Record<string, unknown>;
}

// 复杂嵌套模型类型
interface ComplexModel {
  root: {
    items: TestModel[];
    metadata: {
      version: string;
      timestamp: number;
    };
  };
}

describe('Framework API Contract Tests', () => {
  // CT-API-FRMW-01: createDomainDPML应返回DomainCompiler<T>
  test('CT-API-FRMW-01: createDomainDPML应返回DomainCompiler<T>', () => {
    // 验证函数存在性
    expect(typeof createDomainDPML).toBe('function');

    // 验证函数签名和返回类型
    expectTypeOf<Parameters<typeof createDomainDPML<TestModel>>[0]>().toMatchTypeOf<DomainConfig>();
    expectTypeOf<ReturnType<typeof createDomainDPML<TestModel>>>().toMatchTypeOf<DomainCompiler<TestModel>>();

    // 验证不同类型的泛型约束
    expectTypeOf<ReturnType<typeof createDomainDPML<string>>>().toMatchTypeOf<DomainCompiler<string>>();
    expectTypeOf<ReturnType<typeof createDomainDPML<number>>>().toMatchTypeOf<DomainCompiler<number>>();
    expectTypeOf<ReturnType<typeof createDomainDPML<boolean>>>().toMatchTypeOf<DomainCompiler<boolean>>();
    expectTypeOf<ReturnType<typeof createDomainDPML<any[]>>>().toMatchTypeOf<DomainCompiler<any[]>>();
    expectTypeOf<ReturnType<typeof createDomainDPML<Record<string, unknown>>>>().toMatchTypeOf<DomainCompiler<Record<string, unknown>>>();

    // 验证复杂嵌套类型
    expectTypeOf<ReturnType<typeof createDomainDPML<ComplexModel>>>().toMatchTypeOf<DomainCompiler<ComplexModel>>();
  });

  // CT-API-FRMW-02: 返回的DomainCompiler实例应具有所有必要方法
  test('CT-API-FRMW-02: 返回的DomainCompiler实例应具有所有必要方法', () => {
    // 因为这是契约测试，我们只验证类型，不进行实际调用
    const compilerType = {} as ReturnType<typeof createDomainDPML<TestModel>>;

    // 验证所有必要方法存在
    expectTypeOf(compilerType).toHaveProperty('compile');
    expectTypeOf(compilerType).toHaveProperty('extend');
    expectTypeOf(compilerType).toHaveProperty('getSchema');
    expectTypeOf(compilerType).toHaveProperty('getTransformers');

    // 验证方法签名
    expectTypeOf(compilerType.compile).parameters.toMatchTypeOf<[string]>();
    expectTypeOf(compilerType.compile).returns.toMatchTypeOf<Promise<TestModel>>();

    expectTypeOf(compilerType.extend).parameters.toMatchTypeOf<[Partial<DomainConfig>]>();
    expectTypeOf(compilerType.extend).returns.toMatchTypeOf<void>();

    expectTypeOf(compilerType.getSchema).parameters.toMatchTypeOf<[]>();
    expectTypeOf(compilerType.getSchema).returns.toMatchTypeOf<Schema>();

    expectTypeOf(compilerType.getTransformers).parameters.toMatchTypeOf<[]>();
    expectTypeOf(compilerType.getTransformers).returns.toMatchTypeOf<Array<Transformer<unknown, unknown>>>();
  });

  // CT-API-FRMW-03: DomainCompiler.compile方法应保持泛型类型不变
  test('CT-API-FRMW-03: DomainCompiler.compile方法应保持泛型类型不变', () => {
    type CustomType = { custom: boolean };

    // 验证compile方法正确保留泛型类型
    const customCompilerType = {} as ReturnType<typeof createDomainDPML<CustomType>>;

    expectTypeOf(customCompilerType.compile).returns.toMatchTypeOf<Promise<CustomType>>();

    // 验证不同类型的compile返回值
    const stringCompilerType = {} as ReturnType<typeof createDomainDPML<string>>;
    const numberCompilerType = {} as ReturnType<typeof createDomainDPML<number>>;
    const arrayCompilerType = {} as ReturnType<typeof createDomainDPML<string[]>>;

    expectTypeOf(stringCompilerType.compile).returns.toMatchTypeOf<Promise<string>>();
    expectTypeOf(numberCompilerType.compile).returns.toMatchTypeOf<Promise<number>>();
    expectTypeOf(arrayCompilerType.compile).returns.toMatchTypeOf<Promise<string[]>>();
  });
});
