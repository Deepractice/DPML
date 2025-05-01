/**
 * DomainDPML接口契约测试
 * 验证DomainDPML接口的结构和类型约束
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { DomainDPML, DomainCompiler, CLI, Schema } from '../../../types';

// 测试用的泛型类型
interface TestModel {
  id: string;
  name: string;
}

describe('DomainDPML Interface Contract', () => {
  // CT-TYPE-DPML-01: DomainDPML接口应维持结构稳定性
  test('CT-TYPE-DPML-01: DomainDPML接口应维持结构稳定性', () => {
    // 验证接口的必要属性存在
    expectTypeOf<DomainDPML<unknown>>().toHaveProperty('compiler');
    expectTypeOf<DomainDPML<unknown>>().toHaveProperty('cli');

    // 验证属性的类型
    expectTypeOf<DomainDPML<unknown>['compiler']>().toMatchTypeOf<DomainCompiler<unknown>>();
    expectTypeOf<DomainDPML<unknown>['cli']>().toMatchTypeOf<CLI>();

    // 验证实例类型兼容性
    const dpml: DomainDPML<TestModel> = {
      compiler: {} as DomainCompiler<TestModel>,
      cli: {} as CLI
    };

    expectTypeOf(dpml).toMatchTypeOf<DomainDPML<TestModel>>();
  });

  // CT-TYPE-DPML-02: DomainDPML接口应正确传递泛型参数
  test('CT-TYPE-DPML-02: DomainDPML接口应正确传递泛型参数', () => {
    // 验证泛型参数T正确传递给compiler属性
    expectTypeOf<DomainDPML<TestModel>['compiler']>().toMatchTypeOf<DomainCompiler<TestModel>>();

    // 验证cli属性不依赖泛型参数
    expectTypeOf<DomainDPML<TestModel>['cli']>().toMatchTypeOf<CLI>();
    expectTypeOf<DomainDPML<string>['cli']>().toMatchTypeOf<CLI>();

    // 验证不同泛型参数的DomainDPML实例类型不兼容
    expectTypeOf<DomainDPML<string>>().not.toMatchTypeOf<DomainDPML<number>>();
  });

  // CT-TYPE-DPML-03: DomainDPML接口应支持基本使用场景
  test('CT-TYPE-DPML-03: DomainDPML接口应支持基本使用场景', () => {
    // 创建一个模拟的DomainDPML实例
    const mockCompiler: DomainCompiler<TestModel> = {
      compile: async (content: string) => ({ id: '1', name: 'Test' }),
      extend: (config) => {},
      getSchema: () => ({ element: 'test' } as Schema),
      getTransformers: () => []
    };

    const mockCLI: CLI = {
      execute: async (argv?: string[]) => {},
      showHelp: () => {},
      showVersion: () => {},
      registerCommands: (commands) => {}
    };

    const dpml: DomainDPML<TestModel> = {
      compiler: mockCompiler,
      cli: mockCLI
    };

    // 验证编译器方法类型
    expectTypeOf(dpml.compiler.compile).parameter(0).toBeString();
    expectTypeOf(dpml.compiler.compile).returns.resolves.toMatchTypeOf<TestModel>();

    // 验证CLI方法类型
    expectTypeOf(dpml.cli.execute).parameter(0).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(dpml.cli.execute).returns.resolves.toBeVoid();
  });
});
