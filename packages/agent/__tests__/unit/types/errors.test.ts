/**
 * AgentError 单元测试
 */
import { describe, test, expect } from 'vitest';

import { AgentError, AgentErrorType } from '../../../src/types';

describe('UT-Error', () => {
  test('UT-Error-01: AgentError构造函数应设置所有属性', () => {
    // 准备
    const message = '测试错误消息';
    const type = AgentErrorType.CONFIG;
    const code = 'TEST_ERROR_CODE';
    const cause = new Error('原始错误');

    // 执行
    const error = new AgentError(message, type, code, cause);

    // 验证
    expect(error.message).toBe(message);
    expect(error.type).toBe(type);
    expect(error.code).toBe(code);
    expect(error.cause).toBe(cause);
    expect(error.name).toBe('AgentError');
  });

  test('UT-Error-02: AgentError应支持原始错误作为cause', () => {
    // 准备
    const originalError = new Error('原始错误');

    originalError.stack = 'mock stack';

    // 执行
    const error = new AgentError('包装错误', AgentErrorType.LLM_SERVICE, 'API_ERROR', originalError);

    // 验证
    expect(error.cause).toBe(originalError);
    expect(error.cause?.message).toBe('原始错误');
  });

  test('UT-Error-03: AgentError应使用默认错误类型', () => {
    // 准备 & 执行
    const error = new AgentError('没有指定类型的错误');

    // 验证
    expect(error.type).toBe(AgentErrorType.UNKNOWN);
  });

  test('UT-Error-04: AgentError应使用默认错误码', () => {
    // 准备 & 执行
    const error = new AgentError('没有指定错误码的错误', AgentErrorType.CONTENT);

    // 验证
    expect(error.code).toBe('AGENT_ERROR');
  });

  test('UT-Error-05: AgentError应继承Error类', () => {
    // 准备 & 执行
    const error = new AgentError('测试错误');

    // 验证
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AgentError);
  });

  test('UT-Error-06: AgentErrorType应包含所有预定义错误类型', () => {
    // 验证错误类型枚举
    expect(AgentErrorType.CONFIG).toBeDefined();
    expect(AgentErrorType.LLM_SERVICE).toBeDefined();
    expect(AgentErrorType.CONTENT).toBeDefined();
    expect(AgentErrorType.SESSION).toBeDefined();
    expect(AgentErrorType.UNKNOWN).toBeDefined();

    // 验证枚举值类型
    expect(typeof AgentErrorType.CONFIG).toBe('string');
  });

  test('UT-Error-07: AgentError应能在try/catch中捕获并处理', () => {
    // 准备
    const errorMessage = '意料之中的错误';

    // 执行
    let caughtError: AgentError | null = null;

    try {
      throw new AgentError(errorMessage, AgentErrorType.LLM_SERVICE);
    } catch (error) {
      if (error instanceof AgentError) {
        caughtError = error;
      }
    }

    // 验证
    expect(caughtError).not.toBeNull();
    expect(caughtError?.message).toBe(errorMessage);
    expect(caughtError?.type).toBe(AgentErrorType.LLM_SERVICE);
  });

  test('UT-Error-08: AgentError应支持Promise异常捕获', async () => {
    // 准备
    const errorMessage = 'Promise中的错误';

    // 执行
    const failingPromise = async () => {
      throw new AgentError(errorMessage, AgentErrorType.CONTENT);
    };

    // 验证
    await expect(failingPromise()).rejects.toThrow(AgentError);
    await expect(failingPromise()).rejects.toThrow(errorMessage);

    try {
      await failingPromise();
    } catch (error) {
      expect(error).toBeInstanceOf(AgentError);
      const agentError = error as AgentError;

      expect(agentError.type).toBe(AgentErrorType.CONTENT);
    }
  });
});
