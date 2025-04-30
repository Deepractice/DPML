/**
 * DomainConfig接口契约测试
 * 验证DomainConfig接口的结构和类型约束
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { DomainConfig, Schema, Transformer, CompileOptions, DomainCommandsConfig } from '../../../types';
import type { DomainAction } from '../../../types/DomainAction';

describe('DomainConfig Interface Contract', () => {
  // CT-TYPE-DCONF-01: DomainConfig接口应维持结构稳定性
  test('CT-TYPE-DCONF-01: DomainConfig接口应维持结构稳定性', () => {
    // 验证接口的必要属性存在
    expectTypeOf<DomainConfig>().toHaveProperty('domain');
    expectTypeOf<DomainConfig>().toHaveProperty('schema');
    expectTypeOf<DomainConfig>().toHaveProperty('transformers');
    expectTypeOf<DomainConfig>().toHaveProperty('options');
    expectTypeOf<DomainConfig>().toHaveProperty('description');
    expectTypeOf<DomainConfig>().toHaveProperty('commands');

    // 验证属性的类型
    expectTypeOf<DomainConfig['domain']>().toMatchTypeOf<string>();
    expectTypeOf<DomainConfig['description']>().toMatchTypeOf<string | undefined>();
    expectTypeOf<DomainConfig['schema']>().toMatchTypeOf<Schema>();
    expectTypeOf<DomainConfig['transformers']>().toMatchTypeOf<Array<Transformer<unknown, unknown>>>();
    expectTypeOf<DomainConfig['options']>().toMatchTypeOf<CompileOptions | undefined>();
    expectTypeOf<DomainConfig['commands']>().toMatchTypeOf<DomainCommandsConfig | undefined>();

    // 验证实例类型兼容性
    const config: DomainConfig = {
      domain: 'test-domain',
      schema: {} as Schema,
      transformers: []
    };

    expectTypeOf(config).toMatchTypeOf<DomainConfig>();

    const configWithOptions: DomainConfig = {
      domain: 'test-domain',
      description: 'Test Domain',
      schema: {} as Schema,
      transformers: [],
      options: {
        strictMode: true,
        errorHandling: 'throw'
      },
      commands: {
        includeStandard: true,
        actions: []
      }
    };

    expectTypeOf(configWithOptions).toMatchTypeOf<DomainConfig>();
  });

  // CT-TYPE-DCONF-02: DomainConfig.options应为可选字段
  test('CT-TYPE-DCONF-02: DomainConfig.options应为可选字段', () => {
    // 验证options是可选的
    type HasOptionalOptions = { domain: string; schema: Schema; transformers: Array<Transformer<unknown, unknown>> };
    expectTypeOf<HasOptionalOptions>().toMatchTypeOf<DomainConfig>();

    // 确认创建DomainConfig时options可以省略
    const configWithoutOptions: DomainConfig = {
      domain: 'test-domain',
      schema: {} as Schema,
      transformers: []
    };

    expectTypeOf(configWithoutOptions).toMatchTypeOf<DomainConfig>();

    // 验证可以直接赋值undefined
    const configWithUndefinedOptions: DomainConfig = {
      domain: 'test-domain',
      schema: {} as Schema,
      transformers: [],
      options: undefined
    };

    expectTypeOf(configWithUndefinedOptions).toMatchTypeOf<DomainConfig>();
  });

  // CT-TYPE-DCONF-03: DomainConfig应支持领域标识符
  test('CT-TYPE-DCONF-03: DomainConfig应支持领域标识符', () => {
    // 验证domain字段是必需的
    expectTypeOf<DomainConfig>().toHaveProperty('domain');
    expectTypeOf<DomainConfig['domain']>().toMatchTypeOf<string>();

    // 验证domain字段不能为undefined
    // @ts-expect-error - domain是必需的
    const invalidConfig: DomainConfig = {
      schema: {} as Schema,
      transformers: []
    };
  });

  // CT-TYPE-DCONF-04: DomainConfig应支持领域描述
  test('CT-TYPE-DCONF-04: DomainConfig应支持领域描述', () => {
    // 验证description字段是可选的
    expectTypeOf<DomainConfig>().toHaveProperty('description');
    expectTypeOf<DomainConfig['description']>().toMatchTypeOf<string | undefined>();

    // 验证可以不提供description
    const configWithoutDescription: DomainConfig = {
      domain: 'test-domain',
      schema: {} as Schema,
      transformers: []
    };

    expectTypeOf(configWithoutDescription).toMatchTypeOf<DomainConfig>();

    // 验证可以提供description
    const configWithDescription: DomainConfig = {
      domain: 'test-domain',
      description: 'Test Domain Description',
      schema: {} as Schema,
      transformers: []
    };

    expectTypeOf(configWithDescription).toMatchTypeOf<DomainConfig>();
  });

  // CT-TYPE-DCONF-05: DomainConfig应支持命令配置
  test('CT-TYPE-DCONF-05: DomainConfig应支持命令配置', () => {
    // 验证commands字段是可选的
    expectTypeOf<DomainConfig>().toHaveProperty('commands');
    expectTypeOf<DomainConfig['commands']>().toMatchTypeOf<DomainCommandsConfig | undefined>();

    // 验证commands结构
    expectTypeOf<DomainCommandsConfig>().toHaveProperty('includeStandard');
    expectTypeOf<DomainCommandsConfig>().toHaveProperty('actions');
    expectTypeOf<DomainCommandsConfig['includeStandard']>().toMatchTypeOf<boolean | undefined>();
    expectTypeOf<DomainCommandsConfig['actions']>().toMatchTypeOf<Array<DomainAction> | undefined>();

    // 验证可以不提供commands
    const configWithoutCommands: DomainConfig = {
      domain: 'test-domain',
      schema: {} as Schema,
      transformers: []
    };

    expectTypeOf(configWithoutCommands).toMatchTypeOf<DomainConfig>();

    // 验证可以提供commands
    const configWithCommands: DomainConfig = {
      domain: 'test-domain',
      schema: {} as Schema,
      transformers: [],
      commands: {
        includeStandard: true,
        actions: []
      }
    };

    expectTypeOf(configWithCommands).toMatchTypeOf<DomainConfig>();

    // 验证可以只提供includeStandard
    const configWithIncludeStandard: DomainConfig = {
      domain: 'test-domain',
      schema: {} as Schema,
      transformers: [],
      commands: {
        includeStandard: true
      }
    };

    expectTypeOf(configWithIncludeStandard).toMatchTypeOf<DomainConfig>();

    // 验证可以只提供actions
    const configWithActions: DomainConfig = {
      domain: 'test-domain',
      schema: {} as Schema,
      transformers: [],
      commands: {
        actions: []
      }
    };

    expectTypeOf(configWithActions).toMatchTypeOf<DomainConfig>();
  });
});
