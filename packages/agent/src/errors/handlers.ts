/**
 * 错误处理器
 * 提供错误重试、降级和恢复机制
 */
import { AgentError, ApiError } from './types';
import { ErrorFactory } from './factory';

/**
 * 重试选项接口
 */
export interface RetryOptions {
  /**
   * 最大重试次数
   */
  maxRetries: number;
  
  /**
   * 重试延迟时间(毫秒)
   */
  delayMs: number;
  
  /**
   * 延迟增长因子
   * 每次重试后延迟时间乘以此因子
   */
  backoffFactor: number;
  
  /**
   * 最大延迟时间(毫秒)
   */
  maxDelayMs: number;
  
  /**
   * 判断错误是否可重试的函数
   */
  isRetryable?: (error: any) => boolean;
  
  /**
   * 每次重试前调用的钩子函数
   */
  onRetry?: (error: any, attempt: number) => void | Promise<void>;
}

/**
 * 默认重试选项
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  delayMs: 500,
  backoffFactor: 1.5,
  maxDelayMs: 10000,
  isRetryable: (error) => {
    if (error instanceof AgentError) {
      return error.retryable;
    }
    
    // 对于网络错误，通常可以重试
    if (error instanceof Error) {
      return /timeout|network|econnrefused|econnreset|epipe|etimedout/i.test(error.message);
    }
    
    return false;
  }
};

/**
 * 异步函数类型
 */
type AsyncFunction<T> = () => Promise<T>;

/**
 * 带有重试机制的函数执行
 * 自动重试可重试的错误
 * 
 * @param fn 要执行的异步函数
 * @param options 重试选项
 * @returns 函数执行结果
 * @throws 如果超过最大重试次数，或错误不可重试，则抛出错误
 */
export async function withRetry<T>(
  fn: AsyncFunction<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const retryOpts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let attempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      // 检查是否可以重试
      const canRetry = attempt <= retryOpts.maxRetries && 
        (retryOpts.isRetryable?.(error) ?? false);
      
      if (!canRetry) {
        // 转换为标准错误格式
        throw ErrorFactory.fromError(error);
      }
      
      // 计算重试延迟
      const delay = Math.min(
        retryOpts.delayMs * Math.pow(retryOpts.backoffFactor, attempt - 1),
        retryOpts.maxDelayMs
      );
      
      // 调用重试钩子
      if (retryOpts.onRetry) {
        await Promise.resolve(retryOpts.onRetry(error, attempt));
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * 降级选项接口
 */
export interface FallbackOptions<T> {
  /**
   * 判断错误是否应该降级的函数
   */
  shouldFallback?: (error: any) => boolean;
  
  /**
   * 降级函数调用前的钩子函数
   */
  onFallback?: (error: any) => void | Promise<void>;
  
  /**
   * 发生错误时返回的默认值
   */
  defaultValue?: T;
}

/**
 * 带有降级机制的函数执行
 * 当主函数失败时，尝试使用降级函数
 * 
 * @param primary 主要的异步函数
 * @param fallback 降级的异步函数
 * @param options 降级选项
 * @returns 函数执行结果
 * @throws 如果主函数和降级函数都失败，则抛出错误
 */
export async function withFallback<T>(
  primary: AsyncFunction<T>,
  fallback: AsyncFunction<T>,
  options: FallbackOptions<T> = {}
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    // 检查是否应该降级
    const shouldFallback = options.shouldFallback?.(error) ?? true;
    
    if (!shouldFallback) {
      throw ErrorFactory.fromError(error);
    }
    
    // 调用降级钩子
    if (options.onFallback) {
      await Promise.resolve(options.onFallback(error));
    }
    
    try {
      // 尝试降级函数
      return await fallback();
    } catch (fallbackError) {
      // 如果提供了默认值，则返回
      if ('defaultValue' in options) {
        return options.defaultValue as T;
      }
      
      // 同时报告两个错误
      const primaryErr = ErrorFactory.fromError(error);
      const fallbackErr = ErrorFactory.fromError(fallbackError);
      
      throw ErrorFactory.createAgentError(
        `主要函数失败: ${primaryErr.message}; 降级函数也失败: ${fallbackErr.message}`,
        primaryErr.code as any,
        { cause: primaryErr }
      );
    }
  }
}

/**
 * 速率限制处理选项
 */
export interface RateLimitOptions {
  /**
   * 最大重试次数
   */
  maxRetries: number;
  
  /**
   * 额外等待时间(毫秒)
   */
  extraDelayMs: number;
  
  /**
   * 每次重试前调用的钩子函数
   */
  onWaiting?: (resetTime: number, attempt: number) => void | Promise<void>;
}

/**
 * 默认速率限制处理选项
 */
export const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
  maxRetries: 2,
  extraDelayMs: 1000,
  onWaiting: undefined
};

/**
 * 处理API速率限制
 * 当遇到速率限制错误时，等待限制重置后重试
 * 
 * @param fn 要执行的异步函数
 * @param options 速率限制处理选项
 * @returns 函数执行结果
 * @throws 如果超过最大重试次数或发生其他错误，则抛出错误
 */
export async function handleRateLimit<T>(
  fn: AsyncFunction<T>,
  options: Partial<RateLimitOptions> = {}
): Promise<T> {
  const rateLimitOpts = { ...DEFAULT_RATE_LIMIT_OPTIONS, ...options };
  let attempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      // 检查是否是速率限制错误
      if (!(error instanceof ApiError) || 
          error.code !== 'api-rate-limit-error' || 
          attempt >= rateLimitOpts.maxRetries) {
        throw ErrorFactory.fromError(error);
      }
      
      attempt++;
      
      // 获取重置时间，如果没有则使用默认值
      let waitTime = 1000;
      if (error.rateLimitReset) {
        const now = Date.now();
        const resetTime = error.rateLimitReset;
        waitTime = Math.max(0, resetTime - now) + rateLimitOpts.extraDelayMs;
      }
      
      // 调用等待钩子
      if (rateLimitOpts.onWaiting) {
        await Promise.resolve(rateLimitOpts.onWaiting(waitTime, attempt));
      }
      
      // 等待速率限制重置
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * 安全函数执行选项
 */
export interface SafeExecutionOptions<T> {
  /**
   * 默认返回值
   */
  defaultValue?: T;
  
  /**
   * 错误处理函数
   */
  onError?: (error: Error) => void;
}

/**
 * 安全执行函数
 * 捕获所有错误，并返回默认值或null
 * 
 * @param fn 要执行的函数
 * @param options 安全执行选项
 * @returns 函数执行结果或默认值
 */
export function safeExecute<T>(
  fn: () => T,
  options: SafeExecutionOptions<T> = {}
): T | null {
  try {
    return fn();
  } catch (error) {
    const agentError = ErrorFactory.fromError(error);
    
    if (options.onError) {
      options.onError(agentError);
    }
    
    return 'defaultValue' in options ? options.defaultValue as T : null;
  }
}

/**
 * 安全异步执行函数
 * 捕获所有错误，并返回默认值或null
 * 
 * @param fn 要执行的异步函数
 * @param options 安全执行选项
 * @returns 函数执行结果或默认值的Promise
 */
export async function safeExecuteAsync<T>(
  fn: AsyncFunction<T>,
  options: SafeExecutionOptions<T> = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const agentError = ErrorFactory.fromError(error);
    
    if (options.onError) {
      options.onError(agentError);
    }
    
    return 'defaultValue' in options ? options.defaultValue as T : null;
  }
} 