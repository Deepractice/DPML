import { describe, test, expect } from 'vitest';

import { ENV_VAR_PATTERN, ENV_VAR_PREFIX } from '../../../core/agentenv/constants';

describe('CT-Type-Env: 环境变量常量契约测试', () => {
  test('ENV_VAR_PATTERN常量应符合预期模式', () => {
    // 验证常量存在且为正则表达式类型
    expect(ENV_VAR_PATTERN).toBeInstanceOf(RegExp);

    // 验证正则匹配预期模式
    expect('@agentenv:TEST_VAR'.match(ENV_VAR_PATTERN)?.[0]).toBe('@agentenv:TEST_VAR');
    expect(ENV_VAR_PATTERN.test('@agentenv:API_KEY')).toBe(true);
    expect(ENV_VAR_PATTERN.test('@agentenv:123')).toBe(false); // 不匹配数字开头
    expect(ENV_VAR_PATTERN.test('@agentenv:test_var')).toBe(false); // 不匹配小写
    expect(ENV_VAR_PATTERN.test('@other:TEST_VAR')).toBe(false); // 不匹配其他前缀
  });

  test('ENV_VAR_PREFIX常量应符合预期值', () => {
    expect(ENV_VAR_PREFIX).toBe('@agentenv:');
  });
});
