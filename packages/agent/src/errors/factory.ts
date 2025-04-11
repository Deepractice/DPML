/**
 * 错误工厂类
 * 提供创建各种错误的便捷工厂方法
 */
import { ErrorLevel } from '@dpml/core';
import {
  AgentError,
  AgentErrorCode,
  ApiError,
  ApiErrorOptions,
  ConfigError,
  ConfigErrorOptions,
  MemoryError,
  MemoryErrorOptions,
  SecurityError,
  SecurityErrorOptions,
  StateError,
  StateErrorOptions,
  TagError,
  TagErrorOptions
} from './types';

/**
 * 错误工厂类
 * 提供创建各种Agent相关错误的便捷方法
 */
export class ErrorFactory {
  /**
   * 创建标签错误
   */
  static createTagError(
    message: string,
    code: AgentErrorCode = AgentErrorCode.AGENT_TAG_ERROR,
    options: Partial<TagErrorOptions> = {}
  ): TagError {
    return new TagError({
      code,
      message,
      level: options.level || ErrorLevel.ERROR,
      tagName: options.tagName,
      agentId: options.agentId,
      sessionId: options.sessionId,
      position: options.position,
      cause: options.cause
    });
  }
  
  /**
   * 创建API错误
   */
  static createApiError(
    message: string,
    code: AgentErrorCode = AgentErrorCode.API_CONNECTION_ERROR,
    options: Partial<ApiErrorOptions> = {}
  ): ApiError {
    const isRateLimit = code === AgentErrorCode.API_RATE_LIMIT_ERROR;
    
    return new ApiError({
      code,
      message,
      level: options.level || ErrorLevel.ERROR,
      provider: options.provider,
      statusCode: options.statusCode,
      rateLimitReset: options.rateLimitReset,
      agentId: options.agentId,
      sessionId: options.sessionId,
      position: options.position,
      cause: options.cause,
      // 速率限制错误和连接超时通常可以重试
      retryable: options.retryable !== undefined 
        ? options.retryable 
        : (isRateLimit || code === AgentErrorCode.API_TIMEOUT_ERROR)
    });
  }
  
  /**
   * 创建配置错误
   */
  static createConfigError(
    message: string,
    code: AgentErrorCode = AgentErrorCode.MISSING_ENV_VAR,
    options: Partial<ConfigErrorOptions> = {}
  ): ConfigError {
    return new ConfigError({
      code,
      message,
      level: options.level || ErrorLevel.ERROR,
      configKey: options.configKey,
      agentId: options.agentId,
      sessionId: options.sessionId,
      position: options.position,
      cause: options.cause,
      // 配置错误通常不可重试
      retryable: options.retryable || false
    });
  }
  
  /**
   * 创建记忆错误
   */
  static createMemoryError(
    message: string,
    code: AgentErrorCode = AgentErrorCode.MEMORY_STORAGE_ERROR,
    options: Partial<MemoryErrorOptions> = {}
  ): MemoryError {
    return new MemoryError({
      code,
      message,
      level: options.level || ErrorLevel.ERROR,
      memoryType: options.memoryType,
      agentId: options.agentId,
      sessionId: options.sessionId,
      position: options.position,
      cause: options.cause,
      // 存储错误可能可以重试，但检索错误通常不行
      retryable: options.retryable !== undefined
        ? options.retryable
        : code === AgentErrorCode.MEMORY_STORAGE_ERROR
    });
  }
  
  /**
   * 创建状态错误
   */
  static createStateError(
    message: string,
    code: AgentErrorCode = AgentErrorCode.STATE_ERROR,
    options: Partial<StateErrorOptions> = {}
  ): StateError {
    return new StateError({
      code,
      message,
      level: options.level || ErrorLevel.ERROR,
      fromState: options.fromState,
      toState: options.toState,
      agentId: options.agentId,
      sessionId: options.sessionId,
      position: options.position,
      cause: options.cause,
      // 状态错误通常不可重试
      retryable: options.retryable || false
    });
  }
  
  /**
   * 创建安全错误
   */
  static createSecurityError(
    message: string,
    code: AgentErrorCode = AgentErrorCode.SENSITIVE_DATA_EXPOSURE,
    options: Partial<SecurityErrorOptions> = {}
  ): SecurityError {
    return new SecurityError({
      code,
      message,
      level: options.level || ErrorLevel.ERROR,
      securityContext: options.securityContext,
      agentId: options.agentId,
      sessionId: options.sessionId,
      position: options.position,
      cause: options.cause,
      // 安全错误不应该重试
      retryable: false
    });
  }
  
  /**
   * 创建一般Agent错误
   */
  static createAgentError(
    message: string,
    code: AgentErrorCode = AgentErrorCode.UNKNOWN_AGENT_ERROR,
    options: Partial<ApiErrorOptions> = {}
  ): AgentError {
    return new AgentError({
      code,
      message,
      level: options.level || ErrorLevel.ERROR,
      agentId: options.agentId,
      sessionId: options.sessionId,
      position: options.position,
      cause: options.cause,
      retryable: options.retryable || false
    });
  }
  
  /**
   * 从原始错误创建Agent错误
   * 根据原始错误类型决定创建何种错误
   */
  static fromError(error: unknown, defaultMessage = '发生未知错误'): AgentError {
    // 如果已经是AgentError，直接返回
    if (error instanceof AgentError) {
      return error;
    }
    
    // 处理标准Error对象
    if (error instanceof Error) {
      return this.createAgentError(
        error.message || defaultMessage,
        AgentErrorCode.UNKNOWN_AGENT_ERROR,
        { cause: error }
      );
    }
    
    // 处理字符串
    if (typeof error === 'string') {
      return this.createAgentError(error || defaultMessage);
    }
    
    // 处理其他类型
    return this.createAgentError(
      defaultMessage,
      AgentErrorCode.UNKNOWN_AGENT_ERROR,
      {
        cause: new Error(
          typeof error === 'object' ? JSON.stringify(error) : String(error)
        )
      }
    );
  }
} 