import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import { replaceEnvVars } from '../../api/agentenv';
import { createTestEnv } from '../fixtures/env.fixture';
import { createComplexObject } from '../fixtures/testUtils.fixture';

describe('E2E-Env: 环境变量替换端到端测试', () => {
  let envFixture: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    // 设置测试环境变量
    envFixture = createTestEnv();
  });

  afterEach(() => {
    // 清理测试环境变量
    envFixture.cleanup();
  });

  test('应替换字符串中的环境变量引用', () => {
    const input = '@agentenv:TEST_VAR';
    const result = replaceEnvVars(input);

    expect(result).toBe('test-value');
  });

  test('应替换复杂对象中的环境变量引用', () => {
    const input = {
      apiKey: '@agentenv:API_KEY',
      endpoint: '@agentenv:SERVER_URL',
      settings: {
        username: '@agentenv:USERNAME',
        password: '@agentenv:PASSWORD'
      }
    };

    const result = replaceEnvVars(input);

    expect(result.apiKey).toBe('sk-1234567890');
    expect(result.endpoint).toBe('https://api.example.com');
    expect(result.settings.username).toBe('testuser');
    expect(result.settings.password).toBe('testpass123');
  });

  test('应处理混合数据类型', () => {
    const complexObj = createComplexObject();
    const result = replaceEnvVars(complexObj);

    // 验证不同类型和嵌套层级的正确替换
    expect(result.string).toBe('test-value');
    expect(result.array[0]).toBe('sk-1234567890');
    expect(result.array[2].key).toBe('https://api.example.com');
    expect(result.nested.level1.level2.deep).toBe('testuser');
    expect(result.mixed).toBe('Start test-value middle sk-1234567890 end');
  });

  test('应处理不存在的环境变量', () => {
    // 给控制台添加一个spy
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const input = '@agentenv:NON_EXISTENT_VAR';
    const result = replaceEnvVars(input);

    // 环境变量不存在时应保留原始引用
    expect(result).toBe('@agentenv:NON_EXISTENT_VAR');

    // 应输出警告
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('NON_EXISTENT_VAR'));

    // 清理spy
    consoleSpy.mockRestore();
  });

  test('应正确处理空值和特殊输入', () => {
    expect(replaceEnvVars(null)).toBe(null);
    expect(replaceEnvVars(undefined)).toBe(undefined);
    expect(replaceEnvVars(123)).toBe(123);
    expect(replaceEnvVars(true)).toBe(true);
  });

  test('真实应用场景：DPML配置对象', () => {
    const dpmlConfig = {
      agent: {
        name: 'My Agent',
        llm: {
          apiType: 'openai',
          apiKey: '@agentenv:API_KEY',
          model: 'gpt-4'
        },
        prompt: '你是一个助手，你的名字是@agentenv:USERNAME'
      },
      settings: {
        endpoint: '@agentenv:SERVER_URL',
        headers: {
          'Authorization': 'Bearer @agentenv:API_KEY'
        }
      }
    };

    const result = replaceEnvVars(dpmlConfig);

    expect(result.agent.llm.apiKey).toBe('sk-1234567890');
    expect(result.agent.prompt).toBe('你是一个助手，你的名字是testuser');
    expect(result.settings.endpoint).toBe('https://api.example.com');
    expect(result.settings.headers.Authorization).toBe('Bearer sk-1234567890');
  });
});
