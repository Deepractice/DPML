/**
 * DomainConfig接口契约测试
 * 验证DomainConfig接口的结构和类型约束
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { DomainConfig, Schema, Transformer, CompileOptions } from '../../../types';

describe('DomainConfig Interface Contract', () => {
  // CT-TYPE-DCONF-01: DomainConfig接口应维持结构稳定性
  test('CT-TYPE-DCONF-01: DomainConfig接口应维持结构稳定性', () => {
    // 验证接口的必要属性存在
    expectTypeOf<DomainConfig>().toHaveProperty('schema');
    expectTypeOf<DomainConfig>().toHaveProperty('transformers');
    expectTypeOf<DomainConfig>().toHaveProperty('options');

    // 验证属性的类型
    expectTypeOf<DomainConfig['schema']>().toMatchTypeOf<Schema>();
    expectTypeOf<DomainConfig['transformers']>().toMatchTypeOf<Array<Transformer<unknown, unknown>>>();
    expectTypeOf<DomainConfig['options']>().toMatchTypeOf<CompileOptions | undefined>();

    // 验证实例类型兼容性
    const config: DomainConfig = {
      schema: {} as Schema,
      transformers: []
    };

    expectTypeOf(config).toMatchTypeOf<DomainConfig>();

    const configWithOptions: DomainConfig = {
      schema: {} as Schema,
      transformers: [],
      options: {
        strictMode: true,
        errorHandling: 'throw'
      }
    };

    expectTypeOf(configWithOptions).toMatchTypeOf<DomainConfig>();
  });

  // CT-TYPE-DCONF-02: DomainConfig.options应为可选字段
  test('CT-TYPE-DCONF-02: DomainConfig.options应为可选字段', () => {
    // 验证options是可选的
    type HasOptionalOptions = { schema: Schema; transformers: Array<Transformer<unknown, unknown>> };
    expectTypeOf<HasOptionalOptions>().toMatchTypeOf<DomainConfig>();

    // 确认创建DomainConfig时options可以省略
    const configWithoutOptions: DomainConfig = {
      schema: {} as Schema,
      transformers: []
    };

    expectTypeOf(configWithoutOptions).toMatchTypeOf<DomainConfig>();

    // 验证可以直接赋值undefined
    const configWithUndefinedOptions: DomainConfig = {
      schema: {} as Schema,
      transformers: [],
      options: undefined
    };

    expectTypeOf(configWithUndefinedOptions).toMatchTypeOf<DomainConfig>();
  });
});
