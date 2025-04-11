/**
 * 错误处理系统测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorLevel } from '@dpml/core';

import { 
  AgentError, 
  AgentErrorCode, 
  ApiError,
  ConfigError,
  MemoryError,
  SecurityError,
  StateError,
  TagError
} from '../types';

import { ErrorFactory } from '../factory';
import { 
  withRetry, 
  withFallback, 
  handleRateLimit,
  safeExecute,
  safeExecuteAsync
} from '../handlers';

describe('错误类型测试(UT-ERR-001)', () => {
  it('AgentError应该包含正确的属性', () => {
    const error = new AgentError({
      code: AgentErrorCode.UNKNOWN_AGENT_ERROR,
      message: '测试错误',
      level: ErrorLevel.ERROR,
      agentId: 'test-agent',
      sessionId: 'test-session',
      retryable: true
    });
    
    expect(error.code).toBe(AgentErrorCode.UNKNOWN_AGENT_ERROR);
    expect(error.message).toBe('测试错误');
    expect(error.level).toBe(ErrorLevel.ERROR);
    expect(error.agentId).toBe('test-agent');
    expect(error.sessionId).toBe('test-session');
    expect(error.retryable).toBe(true);
  });
  
  it('toString方法应该返回格式化的错误信息', () => {
    const error = new AgentError({
      code: AgentErrorCode.UNKNOWN_AGENT_ERROR,
      message: '测试错误',
      agentId: 'test-agent',
      sessionId: 'test-session'
    });
    
    const str = error.toString();
    expect(str).toContain('[unknown-agent-error]');
    expect(str).toContain('测试错误');
    expect(str).toContain('[Agent: test-agent]');
    expect(str).toContain('[Session: test-session]');
  });
  
  it('特定错误类应该包含其特定属性', () => {
    const apiError = new ApiError({
      code: AgentErrorCode.API_RATE_LIMIT_ERROR,
      message: 'API速率限制',
      provider: 'openai',
      statusCode: 429,
      rateLimitReset: Date.now() + 5000
    });
    
    expect(apiError.provider).toBe('openai');
    expect(apiError.statusCode).toBe(429);
    expect(typeof apiError.rateLimitReset).toBe('number');
    
    const stateError = new StateError({
      code: AgentErrorCode.INVALID_STATE_TRANSITION,
      message: '无效状态转换',
      fromState: 'idle',
      toState: 'error'
    });
    
    expect(stateError.fromState).toBe('idle');
    expect(stateError.toState).toBe('error');
  });
});

describe('错误工厂测试(UT-ERR-002)', () => {
  it('应该创建指定类型的错误', () => {
    const tagError = ErrorFactory.createTagError('标签验证错误', AgentErrorCode.AGENT_TAG_ERROR, {
      tagName: 'agent'
    });
    
    expect(tagError).toBeInstanceOf(TagError);
    expect(tagError.tagName).toBe('agent');
    
    const apiError = ErrorFactory.createApiError('API连接错误', AgentErrorCode.API_CONNECTION_ERROR, {
      provider: 'openai'
    });
    
    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.provider).toBe('openai');
    
    const configError = ErrorFactory.createConfigError('配置错误', AgentErrorCode.MISSING_ENV_VAR, {
      configKey: 'OPENAI_API_KEY'
    });
    
    expect(configError).toBeInstanceOf(ConfigError);
    expect(configError.configKey).toBe('OPENAI_API_KEY');
  });
  
  it('fromError应该处理各种错误类型', () => {
    // 标准Error
    const stdError = new Error('标准错误');
    const fromStdError = ErrorFactory.fromError(stdError);
    
    expect(fromStdError).toBeInstanceOf(AgentError);
    expect(fromStdError.message).toBe('标准错误');
    
    // 字符串
    const strError = ErrorFactory.fromError('字符串错误');
    expect(strError.message).toBe('字符串错误');
    
    // 其他类型
    const objError = ErrorFactory.fromError({ foo: 'bar' });
    expect(objError.message).toBe('发生未知错误');
    
    // 已是AgentError
    const agentErr = new AgentError({
      code: AgentErrorCode.UNKNOWN_AGENT_ERROR,
      message: '已是代理错误'
    });
    
    const fromAgentErr = ErrorFactory.fromError(agentErr);
    expect(fromAgentErr).toBe(agentErr); // 应该是同一个实例
  });
  
  it('应该智能处理重试标志', () => {
    // 速率限制错误默认可重试
    const rateLimitErr = ErrorFactory.createApiError(
      '速率限制', 
      AgentErrorCode.API_RATE_LIMIT_ERROR
    );
    expect(rateLimitErr.retryable).toBe(true);
    
    // 超时错误默认可重试
    const timeoutErr = ErrorFactory.createApiError(
      '连接超时', 
      AgentErrorCode.API_TIMEOUT_ERROR
    );
    expect(timeoutErr.retryable).toBe(true);
    
    // 认证错误默认不可重试
    const authErr = ErrorFactory.createApiError(
      '认证失败', 
      AgentErrorCode.API_AUTHENTICATION_ERROR
    );
    expect(authErr.retryable).toBe(false);
    
    // 可以通过选项覆盖
    const overrideErr = ErrorFactory.createApiError(
      '认证失败', 
      AgentErrorCode.API_AUTHENTICATION_ERROR,
      { retryable: true }
    );
    expect(overrideErr.retryable).toBe(true);
  });
});

describe('重试机制测试(UT-ERR-007)', () => {
  it('应该在错误后重试函数', async () => {
    const fn = vi.fn();
    let attempts = 0;
    
    fn.mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new AgentError({
          code: AgentErrorCode.API_TIMEOUT_ERROR,
          message: '连接超时',
          retryable: true
        });
      }
      return Promise.resolve('成功');
    });
    
    const result = await withRetry(fn);
    
    expect(fn).toHaveBeenCalledTimes(3);
    expect(result).toBe('成功');
  });
  
  it('超过最大重试次数应该抛出错误', async () => {
    const fn = vi.fn().mockRejectedValue(
      new AgentError({
        code: AgentErrorCode.API_TIMEOUT_ERROR,
        message: '连接超时',
        retryable: true
      })
    );
    
    await expect(withRetry(fn, { maxRetries: 2 })).rejects.toThrow('连接超时');
    expect(fn).toHaveBeenCalledTimes(3); // 初始 + 2次重试
  });
  
  it('不可重试的错误应该立即抛出', async () => {
    const fn = vi.fn().mockRejectedValue(
      new AgentError({
        code: AgentErrorCode.API_AUTHENTICATION_ERROR,
        message: '认证失败',
        retryable: false
      })
    );
    
    await expect(withRetry(fn)).rejects.toThrow('认证失败');
    expect(fn).toHaveBeenCalledTimes(1); // 不重试
  });
  
  it('应该调用onRetry钩子', async () => {
    const fn = vi.fn();
    const onRetry = vi.fn();
    let attempts = 0;
    
    fn.mockImplementation(() => {
      attempts++;
      if (attempts < 2) {
        throw new AgentError({
          code: AgentErrorCode.API_TIMEOUT_ERROR,
          message: '连接超时',
          retryable: true
        });
      }
      return Promise.resolve('成功');
    });
    
    await withRetry(fn, { onRetry });
    
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.any(AgentError), 1);
  });
});

describe('降级机制测试(UT-ERR-008)', () => {
  it('主函数成功时不应调用降级', async () => {
    const primary = vi.fn().mockResolvedValue('主函数结果');
    const fallback = vi.fn().mockResolvedValue('降级结果');
    
    const result = await withFallback(primary, fallback);
    
    expect(result).toBe('主函数结果');
    expect(primary).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
  });
  
  it('主函数失败时应调用降级', async () => {
    const primary = vi.fn().mockRejectedValue(new Error('主函数错误'));
    const fallback = vi.fn().mockResolvedValue('降级结果');
    
    const result = await withFallback(primary, fallback);
    
    expect(result).toBe('降级结果');
    expect(primary).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledTimes(1);
  });
  
  it('主函数和降级都失败时应抛出组合错误', async () => {
    const primary = vi.fn().mockRejectedValue(new Error('主函数错误'));
    const fallback = vi.fn().mockRejectedValue(new Error('降级错误'));
    
    await expect(withFallback(primary, fallback)).rejects.toThrow(/主要函数失败.*降级函数也失败/);
    expect(primary).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledTimes(1);
  });
  
  it('应该尊重shouldFallback选项', async () => {
    const primary = vi.fn().mockRejectedValue(new Error('主函数错误'));
    const fallback = vi.fn().mockResolvedValue('降级结果');
    const shouldFallback = vi.fn().mockReturnValue(false);
    
    await expect(withFallback(primary, fallback, { shouldFallback })).rejects.toThrow('主函数错误');
    expect(primary).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
    expect(shouldFallback).toHaveBeenCalledTimes(1);
  });
  
  it('应该尊重defaultValue选项', async () => {
    const primary = vi.fn().mockRejectedValue(new Error('主函数错误'));
    const fallback = vi.fn().mockRejectedValue(new Error('降级错误'));
    
    const result = await withFallback(primary, fallback, {
      defaultValue: '默认值'
    });
    
    expect(result).toBe('默认值');
  });
});

describe('速率限制处理测试(UT-ERR-005)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
    vi.clearAllMocks();
  });
  
  it('非速率限制错误应立即抛出', async () => {
    const fn = vi.fn().mockRejectedValue(
      new AgentError({
        code: AgentErrorCode.API_AUTHENTICATION_ERROR,
        message: '认证失败'
      })
    );
    
    const promise = handleRateLimit(fn);
    await expect(promise).rejects.toThrow('认证失败');
    expect(fn).toHaveBeenCalledTimes(1);
  });
  
  it('应在速率限制后等待并重试', async () => {
    const fn = vi.fn();
    let attempts = 0;
    
    fn.mockImplementation(() => {
      attempts++;
      if (attempts === 1) {
        const error = new ApiError({
          code: AgentErrorCode.API_RATE_LIMIT_ERROR,
          message: '速率限制',
          rateLimitReset: Date.now() + 5000
        });
        return Promise.reject(error);
      }
      return Promise.resolve('成功');
    });
    
    const promise = handleRateLimit(fn);
    
    // 立即运行所有定时器
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('成功');
    expect(fn).toHaveBeenCalledTimes(2);
  });
  
  it('超过最大重试次数应抛出错误', { timeout: 1000 }, async () => {
    // 模拟setTimeout直接调用回调
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      if (typeof callback === 'function') {
        callback();
      }
      return 1 as any;
    });
    
    // 使用spy来检查函数调用
    const fn = vi.fn();
    
    // 第一次和第二次都返回速率限制错误
    fn.mockRejectedValueOnce(
      new ApiError({
        code: AgentErrorCode.API_RATE_LIMIT_ERROR,
        message: '速率限制',
        retryable: true
      })
    ).mockRejectedValueOnce(
      new ApiError({
        code: AgentErrorCode.API_RATE_LIMIT_ERROR,
        message: '速率限制',
        retryable: true
      })
    );
    
    // 设置最大重试次数为1
    await expect(handleRateLimit(fn, { maxRetries: 1 }))
      .rejects
      .toThrow('速率限制');
    
    // 验证函数被调用了2次
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('错误恢复测试(UT-ERR-009)', () => {
  it('safeExecute应该捕获错误并返回默认值', () => {
    const fn = () => { throw new Error('执行错误'); };
    const onError = vi.fn();
    
    const result = safeExecute(fn, {
      defaultValue: '默认值',
      onError
    });
    
    expect(result).toBe('默认值');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(AgentError));
  });
  
  it('safeExecuteAsync应该捕获异步错误并返回默认值', async () => {
    const fn = () => Promise.reject(new Error('异步错误'));
    const onError = vi.fn();
    
    const result = await safeExecuteAsync(fn, {
      defaultValue: '默认值',
      onError
    });
    
    expect(result).toBe('默认值');
    expect(onError).toHaveBeenCalledTimes(1);
  });
  
  it('没有默认值时应返回null', async () => {
    const fn = () => Promise.reject(new Error('异步错误'));
    
    const result = await safeExecuteAsync(fn);
    expect(result).toBeNull();
  });
}); 