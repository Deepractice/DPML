/**
 * LLM连接器接口
 * 提供与各种LLM提供商API交互的统一接口
 */

/**
 * LLM完成请求选项
 */
export interface CompletionOptions {
  /**
   * 输入消息数组
   */
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  
  /**
   * 模型标识符
   */
  model: string;
  
  /**
   * 最大输出token数量
   */
  maxTokens?: number;
  
  /**
   * 温度参数(0-1)
   */
  temperature?: number;
  
  /**
   * 停止序列
   */
  stopSequences?: string[];
  
  /**
   * 完整性采样上限，控制文本生成的随机性
   */
  topP?: number;
  
  /**
   * 是否启用流式响应
   */
  stream?: boolean;
  
  /**
   * 是否使用缓存
   * 默认为true，如果设置为false则不使用缓存
   */
  useCache?: boolean;
  
  /**
   * 重试配置
   */
  retry?: {
    /**
     * 最大重试次数
     */
    maxRetries: number;
    
    /**
     * 初始重试延迟(毫秒)
     */
    initialDelay: number;
    
    /**
     * 最大重试延迟(毫秒)
     */
    maxDelay: number;
  };
  
  /**
   * 取消信号
   */
  signal?: AbortSignal;
}

/**
 * 完成结果接口
 */
export interface CompletionResult {
  /**
   * 生成的文本内容
   */
  content: string;
  
  /**
   * 使用统计
   */
  usage: {
    /**
     * 输入token数量
     */
    promptTokens: number;
    
    /**
     * 完成token数量
     */
    completionTokens: number;
    
    /**
     * 总token数量
     */
    totalTokens: number;
  };
  
  /**
   * 结束原因
   */
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
  
  /**
   * 请求ID
   */
  requestId?: string;
  
  /**
   * 模型名称
   */
  model: string;
}

/**
 * 流式完成块接口
 */
export interface CompletionChunk {
  /**
   * 内容片段
   */
  content: string;
  
  /**
   * 是否是最后一个块
   */
  isLast: boolean;
  
  /**
   * 结束原因(仅在最后一个块中可能存在)
   */
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
  
  /**
   * 模型名称
   */
  model: string;
  
  /**
   * 请求ID
   */
  requestId?: string;
}

/**
 * LLM连接器接口
 * 支持同步和流式响应模式
 */
export interface LLMConnector {
  /**
   * 获取连接器类型
   */
  getType(): string;
  
  /**
   * 获取连接器支持的模型列表
   */
  getSupportedModels(): Promise<string[]>;
  
  /**
   * 验证模型是否受支持
   * @param model 模型名称
   */
  isModelSupported(model: string): Promise<boolean>;
  
  /**
   * 计算输入文本的token数量
   * @param text 输入文本
   * @param model 模型名称(不同模型可能有不同的计算方式)
   */
  countTokens(text: string, model: string): Promise<number>;
  
  /**
   * 发送完成请求(同步模式)
   * @param options 完成选项
   */
  complete(options: CompletionOptions): Promise<CompletionResult>;
  
  /**
   * 发送完成请求(流式模式)
   * @param options 完成选项
   */
  completeStream(options: CompletionOptions): AsyncIterable<CompletionChunk>;
  
  /**
   * 中断正在进行的请求
   * @param requestId 可选的请求ID，如果未提供则中断所有当前请求
   */
  abortRequest(requestId?: string): Promise<void>;
}

/**
 * LLM连接器错误类型
 */
export enum LLMErrorType {
  AUTHENTICATION = 'authentication_error',
  PERMISSION = 'permission_error',
  RATE_LIMIT = 'rate_limit_error',
  CONNECTION = 'connection_error',
  TIMEOUT = 'timeout_error',
  MODEL_NOT_FOUND = 'model_not_found',
  BAD_REQUEST = 'bad_request_error',
  SERVER = 'server_error',
  CONTENT_FILTER = 'content_filter_error',
  ABORTED = 'request_aborted',
  TOKEN_LIMIT = 'token_limit_error',
  UNKNOWN = 'unknown_error'
}

/**
 * LLM连接器错误
 */
export class LLMConnectorError extends Error {
  /**
   * 错误类型
   */
  readonly type: LLMErrorType;
  
  /**
   * 提供商特定的错误代码
   */
  readonly providerErrorCode?: string;
  
  /**
   * 原始错误对象
   */
  readonly originalError?: Error;
  
  /**
   * 重试信息
   */
  readonly retry?: {
    /**
     * 是否可重试
     */
    retryable: boolean;
    
    /**
     * 建议的重试等待时间(毫秒)
     */
    retryAfter?: number;
  };
  
  constructor(
    message: string, 
    type: LLMErrorType, 
    options?: {
      providerErrorCode?: string;
      originalError?: Error;
      retryable?: boolean;
      retryAfter?: number;
    }
  ) {
    super(message);
    this.name = 'LLMConnectorError';
    this.type = type;
    this.providerErrorCode = options?.providerErrorCode;
    this.originalError = options?.originalError;
    
    if (options?.retryable !== undefined) {
      this.retry = {
        retryable: options.retryable,
        retryAfter: options.retryAfter
      };
    }
  }
} 