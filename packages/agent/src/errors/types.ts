/**
 * 错误类型和错误码定义
 * 定义Agent包特定的错误类型、错误码和基础接口
 */
import { DPMLError, ErrorCode as CoreErrorCode, ErrorLevel, ErrorOptions, ErrorPosition } from '@dpml/core';

/**
 * Agent包特定错误代码枚举
 * 扩展Core包的错误代码
 */
export enum AgentErrorCode {
  // 解析和验证错误
  AGENT_TAG_ERROR = 'agent-tag-error',
  LLM_TAG_ERROR = 'llm-tag-error',
  PROMPT_TAG_ERROR = 'prompt-tag-error',
  
  // API连接错误
  API_CONNECTION_ERROR = 'api-connection-error',
  API_TIMEOUT_ERROR = 'api-timeout-error',
  API_RATE_LIMIT_ERROR = 'api-rate-limit-error',
  API_AUTHENTICATION_ERROR = 'api-authentication-error',
  
  // 配置错误
  MISSING_ENV_VAR = 'missing-env-var',
  INVALID_API_KEY = 'invalid-api-key',
  INVALID_MODEL = 'invalid-model',
  INVALID_API_URL = 'invalid-api-url',
  
  // 执行错误
  EXECUTION_ERROR = 'execution-error',
  INTERRUPTED_ERROR = 'interrupted-error',
  
  // 记忆系统错误
  MEMORY_STORAGE_ERROR = 'memory-storage-error',
  MEMORY_RETRIEVAL_ERROR = 'memory-retrieval-error',
  
  // 状态错误
  INVALID_STATE_TRANSITION = 'invalid-state-transition',
  STATE_ERROR = 'state-error',
  
  // 安全错误
  SENSITIVE_DATA_EXPOSURE = 'sensitive-data-exposure',
  PATH_TRAVERSAL_ATTEMPT = 'path-traversal-attempt',
  
  // 其他错误
  UNKNOWN_AGENT_ERROR = 'unknown-agent-error'
}

/**
 * 合并错误代码类型
 * 允许使用Core包或Agent包的错误码
 */
export type ErrorCode = CoreErrorCode | AgentErrorCode;

/**
 * Agent错误选项接口
 * 扩展基础错误选项
 */
export interface AgentErrorOptions extends ErrorOptions {
  // Agent特定属性
  agentId?: string;
  sessionId?: string;
  retryable?: boolean;
}

/**
 * Agent基础错误类
 * 扩展DPMLError添加Agent特定属性
 */
export class AgentError extends DPMLError {
  /**
   * 关联的代理ID
   */
  readonly agentId?: string;
  
  /**
   * 关联的会话ID
   */
  readonly sessionId?: string;
  
  /**
   * 是否可重试
   */
  readonly retryable: boolean;
  
  /**
   * 构造函数
   */
  constructor(options: AgentErrorOptions) {
    super(options);
    this.name = this.constructor.name;
    this.agentId = options.agentId;
    this.sessionId = options.sessionId;
    this.retryable = options.retryable || false;
  }
  
  /**
   * 转换为JSON对象
   */
  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      agentId: this.agentId,
      sessionId: this.sessionId,
      retryable: this.retryable
    };
  }
  
  /**
   * 安全转换为字符串
   * 确保不泄露敏感信息
   */
  override toString(): string {
    let result = `[${this.code}] ${this.message}`;
    
    if (this.position) {
      result += ` (at line ${this.position.line}, column ${this.position.column})`;
    }
    
    if (this.agentId) {
      result += ` [Agent: ${this.agentId}]`;
    }
    
    if (this.sessionId) {
      result += ` [Session: ${this.sessionId}]`;
    }
    
    return result;
  }
}

/**
 * 标签错误选项接口
 */
export interface TagErrorOptions extends AgentErrorOptions {
  tagName?: string;
}

/**
 * 标签错误类
 * 用于处理Agent包标签相关错误
 */
export class TagError extends AgentError {
  /**
   * 标签名称
   */
  readonly tagName?: string;
  
  /**
   * 构造函数
   */
  constructor(options: TagErrorOptions) {
    super(options);
    this.tagName = options.tagName;
  }
  
  /**
   * 转换为JSON对象
   */
  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      tagName: this.tagName
    };
  }
  
  /**
   * 安全转换为字符串
   */
  override toString(): string {
    let result = super.toString();
    
    if (this.tagName) {
      result += ` [Tag: ${this.tagName}]`;
    }
    
    return result;
  }
}

/**
 * API错误选项接口
 */
export interface ApiErrorOptions extends AgentErrorOptions {
  provider?: string;
  statusCode?: number;
  rateLimitReset?: number;
}

/**
 * API错误类
 * 用于处理LLM API调用相关错误
 */
export class ApiError extends AgentError {
  /**
   * API提供商
   */
  readonly provider?: string;
  
  /**
   * HTTP状态码
   */
  readonly statusCode?: number;
  
  /**
   * 速率限制重置时间
   */
  readonly rateLimitReset?: number;
  
  /**
   * 构造函数
   */
  constructor(options: ApiErrorOptions) {
    super(options);
    this.provider = options.provider;
    this.statusCode = options.statusCode;
    this.rateLimitReset = options.rateLimitReset;
  }
  
  /**
   * 转换为JSON对象
   */
  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      provider: this.provider,
      statusCode: this.statusCode,
      rateLimitReset: this.rateLimitReset
    };
  }
  
  /**
   * 安全转换为字符串
   */
  override toString(): string {
    let result = super.toString();
    
    if (this.provider) {
      result += ` [Provider: ${this.provider}]`;
    }
    
    if (this.statusCode) {
      result += ` [Status: ${this.statusCode}]`;
    }
    
    return result;
  }
}

/**
 * 配置错误选项接口
 */
export interface ConfigErrorOptions extends AgentErrorOptions {
  configKey?: string;
}

/**
 * 配置错误类
 * 用于处理配置相关错误
 */
export class ConfigError extends AgentError {
  /**
   * 配置键
   */
  readonly configKey?: string;
  
  /**
   * 构造函数
   */
  constructor(options: ConfigErrorOptions) {
    super(options);
    this.configKey = options.configKey;
  }
  
  /**
   * 转换为JSON对象
   */
  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      configKey: this.configKey
    };
  }
  
  /**
   * 安全转换为字符串
   */
  override toString(): string {
    let result = super.toString();
    
    if (this.configKey) {
      result += ` [Config: ${this.configKey}]`;
    }
    
    return result;
  }
}

/**
 * 记忆系统错误选项接口
 */
export interface MemoryErrorOptions extends AgentErrorOptions {
  memoryType?: string;
}

/**
 * 记忆系统错误类
 * 用于处理记忆存储和检索相关错误
 */
export class MemoryError extends AgentError {
  /**
   * 记忆系统类型
   */
  readonly memoryType?: string;
  
  /**
   * 构造函数
   */
  constructor(options: MemoryErrorOptions) {
    super(options);
    this.memoryType = options.memoryType;
  }
  
  /**
   * 转换为JSON对象
   */
  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      memoryType: this.memoryType
    };
  }
  
  /**
   * 安全转换为字符串
   */
  override toString(): string {
    let result = super.toString();
    
    if (this.memoryType) {
      result += ` [Memory: ${this.memoryType}]`;
    }
    
    return result;
  }
}

/**
 * 状态错误选项接口
 */
export interface StateErrorOptions extends AgentErrorOptions {
  fromState?: string;
  toState?: string;
}

/**
 * 状态错误类
 * 用于处理状态转换和管理相关错误
 */
export class StateError extends AgentError {
  /**
   * 起始状态
   */
  readonly fromState?: string;
  
  /**
   * 目标状态
   */
  readonly toState?: string;
  
  /**
   * 构造函数
   */
  constructor(options: StateErrorOptions) {
    super(options);
    this.fromState = options.fromState;
    this.toState = options.toState;
  }
  
  /**
   * 转换为JSON对象
   */
  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      fromState: this.fromState,
      toState: this.toState
    };
  }
  
  /**
   * 安全转换为字符串
   */
  override toString(): string {
    let result = super.toString();
    
    if (this.fromState && this.toState) {
      result += ` [State: ${this.fromState} -> ${this.toState}]`;
    }
    
    return result;
  }
}

/**
 * 安全错误选项接口
 */
export interface SecurityErrorOptions extends AgentErrorOptions {
  securityContext?: string;
}

/**
 * 安全错误类
 * 用于处理安全相关错误
 */
export class SecurityError extends AgentError {
  /**
   * 安全上下文
   */
  readonly securityContext?: string;
  
  /**
   * 构造函数
   */
  constructor(options: SecurityErrorOptions) {
    super(options);
    this.securityContext = options.securityContext;
  }
  
  /**
   * 转换为JSON对象
   */
  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      securityContext: this.securityContext
    };
  }
  
  /**
   * 安全转换为字符串
   */
  override toString(): string {
    let result = super.toString();
    
    if (this.securityContext) {
      result += ` [Security: ${this.securityContext}]`;
    }
    
    return result;
  }
} 