import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { replaceEnvVars } from '../../../../core/agentenv/agentenvCore';
import { createTestEnv } from '../../../fixtures/env.fixture';
import { createComplexObject } from '../../../fixtures/testUtils.fixture';

describe('UT-Env-Core: 环境变量Core层单元测试', () => {
  // 模拟console.warn
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  let envFixture: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    // 设置测试环境变量
    envFixture = createTestEnv();

    // 清理模拟历史
    warnSpy.mockClear();
  });

  afterEach(() => {
    // 清理测试环境变量
    envFixture.cleanup();
  });

  test('replaceEnvVars应处理null/undefined', () => {
    expect(replaceEnvVars(null)).toBe(null);
    expect(replaceEnvVars(undefined)).toBe(undefined);
  });

  test('replaceEnvVars应处理基本字符串', () => {
    expect(replaceEnvVars('hello world')).toBe('hello world');
  });

  test('replaceEnvVars应替换字符串中的环境变量引用', () => {
    expect(replaceEnvVars('@agentenv:TEST_VAR')).toBe('test-value');
  });

  test('replaceEnvVars应替换字符串中的多个环境变量引用', () => {
    const input = 'Key: @agentenv:API_KEY, Test: @agentenv:TEST_VAR';
    const expected = 'Key: sk-1234567890, Test: test-value';

    expect(replaceEnvVars(input)).toBe(expected);
  });

  test('replaceEnvVars应处理不存在的环境变量', () => {
    const input = '@agentenv:NON_EXISTENT_VAR';

    expect(replaceEnvVars(input)).toBe(input);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('NON_EXISTENT_VAR'));
  });

  test('replaceEnvVars应处理数组', () => {
    const input = ['@agentenv:TEST_VAR', 'normal', '@agentenv:API_KEY'];
    const expected = ['test-value', 'normal', 'sk-1234567890'];

    expect(replaceEnvVars(input)).toEqual(expected);
  });

  test('replaceEnvVars应处理简单对象', () => {
    const input = {
      key1: '@agentenv:TEST_VAR',
      key2: 'normal',
      key3: '@agentenv:API_KEY'
    };
    const expected = {
      key1: 'test-value',
      key2: 'normal',
      key3: 'sk-1234567890'
    };

    expect(replaceEnvVars(input)).toEqual(expected);
  });

  test('replaceEnvVars应处理嵌套对象', () => {
    const input = {
      key1: '@agentenv:TEST_VAR',
      nested: {
        key2: '@agentenv:API_KEY',
        deeper: {
          key3: '@agentenv:TEST_VAR'
        }
      }
    };
    const expected = {
      key1: 'test-value',
      nested: {
        key2: 'sk-1234567890',
        deeper: {
          key3: 'test-value'
        }
      }
    };

    expect(replaceEnvVars(input)).toEqual(expected);
  });

  test('replaceEnvVars应处理混合数据结构', () => {
    const input = {
      key1: '@agentenv:TEST_VAR',
      array: ['normal', '@agentenv:API_KEY'],
      nested: {
        key2: '@agentenv:TEST_VAR'
      }
    };
    const expected = {
      key1: 'test-value',
      array: ['normal', 'sk-1234567890'],
      nested: {
        key2: 'test-value'
      }
    };

    expect(replaceEnvVars(input)).toEqual(expected);
  });

  test('replaceEnvVars应处理复杂对象', () => {
    const complexObj = createComplexObject();
    const result = replaceEnvVars(complexObj);

    // 验证替换结果
    expect(result.string).toBe('test-value');
    expect(result.array[0]).toBe('sk-1234567890');
    expect(result.array[2].key).toBe('https://api.example.com');
    expect(result.nested.level1.level2.deep).toBe('testuser');
    expect(result.nested.sibling).toBe('testpass123');
    expect(result.mixed).toBe('Start test-value middle sk-1234567890 end');

    // 非字符串值不变
    expect(result.number).toBe(42);
    expect(result.boolean).toBe(true);
    expect(result.null).toBe(null);
    expect(result.undefined).toBe(undefined);
  });

  test('replaceEnvVars应正确处理非对象非数组非字符串类型', () => {
    expect(replaceEnvVars(123)).toBe(123);
    expect(replaceEnvVars(true)).toBe(true);
    expect(replaceEnvVars(false)).toBe(false);
  });
});
