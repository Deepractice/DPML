import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { replaceEnvVars as apiReplaceEnvVars } from '../../api/agentenv';
import { replaceEnvVars } from '../../core/agentenv/agentenvCore';
import { createTestEnv } from '../fixtures/env.fixture';

// 部分模拟Core层
vi.mock('../../core/agentenv/agentenvCore', async () => {
  const actual = await vi.importActual('../../core/agentenv/agentenvCore');

  return {
    ...actual,
    replaceEnvVars: vi.fn((...args) => {
      // 调用实际函数但跟踪调用
      return (actual as any).replaceEnvVars(...args);
    })
  };
});

describe('IT-Env: 环境变量集成测试', () => {
  let envFixture: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    // 设置测试环境变量
    envFixture = createTestEnv();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 清理测试环境变量
    envFixture.cleanup();
  });

  test('API层应将调用委托给Core层', () => {
    const input = '@agentenv:TEST_VAR';

    apiReplaceEnvVars(input);
    expect(replaceEnvVars).toHaveBeenCalledTimes(1);
  });

  test('API层应传递正确的参数给Core层', () => {
    const input = { key: '@agentenv:TEST_VAR', nested: { key2: 'normal' } };

    apiReplaceEnvVars(input);
    expect(replaceEnvVars).toHaveBeenCalledWith(input);
  });

  test('API层应返回Core层的处理结果', () => {
    const input = '@agentenv:TEST_VAR';
    const result = apiReplaceEnvVars(input);

    expect(result).toBe('test-value');
  });

  test('复杂对象应被正确处理和替换', () => {
    const input = {
      key: '@agentenv:TEST_VAR',
      nested: {
        array: ['@agentenv:API_KEY', 'normal']
      }
    };

    const result = apiReplaceEnvVars(input);

    expect(result.key).toBe('test-value');
    expect(result.nested.array[0]).toBe('sk-1234567890');
    expect(result.nested.array[1]).toBe('normal');
  });
});
