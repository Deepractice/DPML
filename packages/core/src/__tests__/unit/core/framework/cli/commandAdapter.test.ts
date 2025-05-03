import { describe, it, expect, vi } from 'vitest';

import { adaptDomainAction, adaptDomainActions } from '../../../../../core/framework/cli/commandAdapter';
import type { DomainContext } from '../../../../../core/framework/types';
import type { DomainAction, DomainActionContext } from '../../../../../types/DomainAction';
import type { Schema } from '../../../../../types/Schema';

describe('Command Adapter', () => {
  // 创建测试用的领域上下文
  const testContext: DomainContext = {
    domain: 'test-domain',
    description: 'Test Domain',
    schema: {
      root: {
        element: 'root',
        children: {
          elements: []
        }
      }
    } as Schema,
    transformers: [],
    options: {
      strictMode: true,
      errorHandling: 'throw',
      transformOptions: { resultMode: 'merged' },
      custom: {}
    },
    compiler: {
      compile: async (content: string) => ({ result: 'compiled' }),
      extend: () => {},
      getSchema: () => ({} as Schema),
      getTransformers: () => []
    }
  };

  // 创建测试用的领域命令
  const testAction: DomainAction = {
    name: 'test-command',
    description: 'Test command description',
    args: [{ name: 'arg1', description: 'Argument 1' }],
    options: [{ flags: '-o, --option', description: 'Option 1' }],
    action: vi.fn().mockResolvedValue('test-result')
  };

  // UT-CMDADP-01: 验证 adaptDomainAction 正确转换单个命令
  it('UT-CMDADP-01: adaptDomainAction should correctly convert a domain action to a CLI command', () => {
    const domain = 'test-domain';
    const result = adaptDomainAction(testAction, domain, testContext);

    // 验证基本属性正确转换
    expect(result.name).toBe(`${domain}:${testAction.name}`);
    expect(result.description).toBe(testAction.description);
    expect(result.arguments).toBe(testAction.args);
    expect(result.options).toBe(testAction.options);
    expect(result.category).toBe(domain);
  });

  // UT-CMDADP-02: 验证执行器能正确注入DomainActionContext并调用原始执行器
  it('UT-CMDADP-02: command executor should correctly inject DomainActionContext and call original executor', async () => {
    const domain = 'test-domain';
    const result = adaptDomainAction(testAction, domain, testContext);

    // 测试参数传递
    const testArgs = ['arg-value', { option: 'value' }];

    await result.action(...testArgs);

    // 验证执行器被调用
    expect(testAction.action).toHaveBeenCalled();

    // 简化测试方式，不再直接访问mock属性
    // 验证第一个参数应该是DomainActionContext对象
    expect(testAction.action).toHaveBeenCalledWith(
      expect.objectContaining({
        getCompiler: expect.any(Function),
        getDomain: expect.any(Function),
        getDescription: expect.any(Function),
        getOptions: expect.any(Function)
      }),
      testArgs[0],
      testArgs[1]
    );
  });

  // UT-CMDADP-03: 验证 adaptDomainActions 能正确批量转换命令
  it('UT-CMDADP-03: adaptDomainActions should correctly convert multiple domain actions', () => {
    const domain = 'test-domain';
    const testActions: DomainAction[] = [
      testAction,
      {
        name: 'another-command',
        description: 'Another command',
        args: [],
        options: [],
        action: vi.fn()
      }
    ];

    const results = adaptDomainActions(testActions, domain, testContext);

    // 验证结果数组长度
    expect(results.length).toBe(testActions.length);

    // 验证每个命令都被正确转换
    results.forEach((result, index) => {
      const action = testActions[index];

      expect(result.name).toBe(`${domain}:${action.name}`);
      expect(result.description).toBe(action.description);
    });
  });

  // UT-CMDADP-04: 验证命令名称格式正确
  it('UT-CMDADP-04: command name should use correct domain:command format', () => {
    const domains = ['auth', 'user', 'system'];
    const actionNames = ['create', 'update', 'delete'];

    domains.forEach(domain => {
      actionNames.forEach(actionName => {
        const action: DomainAction = {
          name: actionName,
          description: 'Test action',
          args: [],
          options: [],
          action: vi.fn()
        };

        const result = adaptDomainAction(action, domain, testContext);

        expect(result.name).toBe(`${domain}:${actionName}`);
      });
    });
  });

  // UT-CMDADP-05: 验证执行器结果正确返回
  it('UT-CMDADP-05: command executor should return the correct result from the original executor', async () => {
    const expectedResult = 'expected-result';
    const action: DomainAction = {
      name: 'result-test',
      description: 'Test result passing',
      args: [],
      options: [],
      action: vi.fn().mockResolvedValue(expectedResult)
    };

    const result = adaptDomainAction(action, 'test-domain', testContext);
    const executorResult = await result.action();

    expect(executorResult).toBe(expectedResult);
  });

  // UT-CMDADP-06: 验证DomainActionContext实现了必要的方法
  it('UT-CMDADP-06: DomainActionContext should implement all required methods', async () => {
    const domain = 'test-domain';
    const result = adaptDomainAction(testAction, domain, testContext);

    // 创建一个监视DomainActionContext方法的测试命令
    const spyAction: DomainAction = {
      name: 'spy-action',
      description: 'Action with spies on context methods',
      action: vi.fn(async (actionContext: DomainActionContext) => {
        // 调用所有方法以验证它们的实现
        actionContext.getCompiler();
        actionContext.getDomain();
        actionContext.getDescription();
        actionContext.getOptions();
      })
    };

    const spyResult = adaptDomainAction(spyAction, domain, testContext);

    await spyResult.action();

    expect(spyAction.action).toHaveBeenCalled();
    // 验证调用没有抛出错误
  });

  // UT-CMDADP-07: 验证DomainContext.compiler为空时，getCompiler应抛出错误
  it('UT-CMDADP-07: DomainActionContext.getCompiler应在context.compiler为空时抛出错误', () => {
    const domain = 'test-domain';

    // 创建一个不含compiler的context
    const contextWithoutCompiler: DomainContext = {
      ...testContext,
      compiler: undefined
    };

    // 创建一个调用getCompiler的命令
    const action: DomainAction = {
      name: 'compiler-test',
      description: 'Test compiler access',
      action: (context: DomainActionContext) => {
        // 测试是否抛出错误
        expect(() => context.getCompiler()).toThrow('领域编译器尚未初始化');
      }
    };

    const testResult = adaptDomainAction(action, domain, contextWithoutCompiler);

    // 执行action，里面的断言会验证getCompiler是否抛出错误
    testResult.action(contextWithoutCompiler);
  });

  // UT-CMDADP-08: 验证DomainContext.compiler存在时，getCompiler应正常返回
  it('UT-CMDADP-08: DomainActionContext.getCompiler应在context.compiler存在时正常返回', () => {
    const domain = 'test-domain';
    const mockCompiler = {
      compile: async () => ({}),
      extend: () => {},
      getSchema: () => ({} as Schema),
      getTransformers: () => []
    };

    // 创建一个含compiler的context
    const contextWithCompiler: DomainContext = {
      ...testContext,
      compiler: mockCompiler
    };

    // 让我们验证action中能获取到compiler
    let retrievedCompiler: any = null;

    const action: DomainAction = {
      name: 'compiler-test',
      description: 'Test compiler access',
      action: (context: DomainActionContext) => {
        // 不应抛出错误
        retrievedCompiler = context.getCompiler();
        expect(retrievedCompiler).toBe(mockCompiler);
      }
    };

    const testResult = adaptDomainAction(action, domain, contextWithCompiler);

    // 执行命令action
    testResult.action(contextWithCompiler);

    // 确认能获取到编译器
    expect(retrievedCompiler).toBe(mockCompiler);
  });
});
