import { describe, it, expect, vi } from 'vitest';

import { adaptDomainAction, adaptDomainActions } from '../../../../../core/framework/cli/commandAdapter';
import type { DomainContext } from '../../../../../core/framework/types';
import type { DomainAction } from '../../../../../types/DomainAction';
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

  // UT-CMDADP-02: 验证执行器能正确注入上下文并调用原始执行器
  it('UT-CMDADP-02: command executor should correctly inject context and call original executor', async () => {
    const domain = 'test-domain';
    const result = adaptDomainAction(testAction, domain, testContext);

    // 测试参数传递
    const testArgs = ['arg-value', { option: 'value' }];

    await result.action(...testArgs);

    // 验证执行器被调用，且上下文和参数正确传递
    expect(testAction.action).toHaveBeenCalledWith(testContext, ...testArgs);
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
});
