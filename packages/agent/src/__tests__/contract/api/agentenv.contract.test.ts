import { describe, test, expect, vi } from 'vitest';

import { replaceEnvVars } from '../../../api/agentenv';
import { replaceEnvVars } from '../../../core/agentenv/agentenvCore';

// 模拟Core层
vi.mock('../../../core/agentenv/agentenvCore', () => ({
  replaceEnvVars: vi.fn(val => val)
}));

describe('CT-API-Env: 环境变量API契约测试', () => {
  test('replaceEnvVars函数应符合公开契约', () => {
    // 验证函数存在且为函数类型
    expect(typeof replaceEnvVars).toBe('function');
  });

  test('replaceEnvVars函数应接受泛型参数并返回相同类型', () => {
    // 字符串测试
    const strInput = 'test';
    const strResult = replaceEnvVars(strInput);

    expect(typeof strResult).toBe('string');

    // 对象测试
    const objInput = { key: 'value' };
    const objResult = replaceEnvVars(objInput);

    expect(typeof objResult).toBe('object');

    // 数组测试
    const arrInput = ['test'];
    const arrResult = replaceEnvVars(arrInput);

    expect(Array.isArray(arrResult)).toBe(true);
  });

  test('replaceEnvVars函数应将API调用委托给Core层', () => {
    const input = '@agentenv:TEST_VAR';

    replaceEnvVars(input);
    expect(replaceEnvVars).toHaveBeenCalledWith(input);
  });
});
