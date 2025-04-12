import { 
  LLMConnector, 
  CompletionOptions, 
  CompletionResult, 
  CompletionChunk,
  LLMErrorType,
  LLMConnectorError 
} from './LLMConnector';

// 添加请求缓存接口
interface RequestCacheItem {
  result: CompletionResult;
  timestamp: number;
}

/**
 * 抽象LLM连接器基类
 * 提供通用功能实现，如重试逻辑
 */
export abstract class AbstractLLMConnector implements LLMConnector {
  /**
   * 连接器类型
   */
  protected readonly type: string;
  
  /**
   * 默认重试配置
   */
  protected readonly defaultRetry = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000
  };
  
  /**
   * 当前活跃请求的取消控制器映射
   * 用于支持请求取消功能
   */
  protected activeRequests: Map<string, AbortController> = new Map();
  
  /**
   * 请求缓存 - 用于缓存相同请求的结果，提高性能
   * 键为请求的散列，值为缓存项
   */
  protected requestCache: Map<string, RequestCacheItem> = new Map();
  
  /**
   * 正在进行中的请求映射
   * 用于合并相同的同时请求
   */
  protected pendingRequests: Map<string, Promise<CompletionResult>> = new Map();
  
  /**
   * 缓存生存时间(毫秒)
   * 默认5分钟
   */
  protected cacheTTL = 5 * 60 * 1000;
  
  /**
   * 最大并发请求数
   */
  protected maxConcurrentRequests = 5;
  
  /**
   * 当前活跃请求数
   */
  protected activeRequestCount = 0;
  
  /**
   * 请求队列
   */
  protected requestQueue: Array<() => Promise<void>> = [];
  
  /**
   * 构造函数
   * @param type 连接器类型
   */
  constructor(type: string) {
    this.type = type;
    
    // 定期清理过期缓存
    setInterval(() => this.cleanupCache(), 60000);
  }
  
  /**
   * 获取连接器类型
   */
  getType(): string {
    return this.type;
  }
  
  /**
   * 设置缓存生存时间
   * @param ttl 生存时间(毫秒)
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }
  
  /**
   * 设置最大并发请求数
   * @param max 最大并发请求数
   */
  setMaxConcurrentRequests(max: number): void {
    this.maxConcurrentRequests = max;
  }
  
  /**
   * 清理过期缓存
   * @private
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, item] of this.requestCache.entries()) {
      if (now - item.timestamp > this.cacheTTL) {
        this.requestCache.delete(key);
      }
    }
  }
  
  /**
   * 获取支持的模型列表
   * 子类必须实现
   */
  abstract getSupportedModels(): Promise<string[]>;
  
  /**
   * 验证模型是否受支持
   * @param model 模型名称
   */
  async isModelSupported(model: string): Promise<boolean> {
    const supportedModels = await this.getSupportedModels();
    return supportedModels.includes(model);
  }
  
  /**
   * 计算输入文本的token数量
   * 子类必须实现
   */
  abstract countTokens(text: string, model: string): Promise<number>;
  
  /**
   * 生成请求的唯一散列，用于缓存
   * @param options 请求选项
   * @private
   */
  private generateRequestHash(options: CompletionOptions): string {
    // 简单实现 - 实际项目应使用更健壮的哈希算法
    const keyParts = [
      options.model,
      JSON.stringify(options.messages),
      options.temperature || 0.7,
      options.maxTokens || 1000
    ];
    return keyParts.join('|');
  }
  
  /**
   * 添加请求到队列并在可能时执行
   * @param fn 请求函数
   * @private
   */
  private async enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeRequestCount < this.maxConcurrentRequests) {
      this.activeRequestCount++;
      try {
        return await fn();
      } finally {
        this.activeRequestCount--;
        this.processQueue();
      }
    }
    
    // 创建一个Promise，将其解析函数存储在队列中
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          resolve(await fn());
        } catch (err) {
          reject(err);
        }
      });
    });
  }
  
  /**
   * 处理请求队列
   * @private
   */
  private processQueue(): void {
    if (this.requestQueue.length === 0 || this.activeRequestCount >= this.maxConcurrentRequests) {
      return;
    }
    
    const nextRequest = this.requestQueue.shift();
    if (nextRequest) {
      this.activeRequestCount++;
      nextRequest().finally(() => {
        this.activeRequestCount--;
        this.processQueue();
      });
    }
  }
  
  /**
   * 发送完成请求(同步模式)
   * 包含重试逻辑
   * @param options 完成选项
   */
  async complete(options: CompletionOptions): Promise<CompletionResult> {
    // 生成请求哈希，用于缓存和请求合并
    const requestHash = this.generateRequestHash(options);
    
    // 检查缓存是否可用
    if (options.useCache !== false) {
      const cachedItem = this.requestCache.get(requestHash);
      
      // 如果有缓存且未过期，直接返回
      if (cachedItem && (Date.now() - cachedItem.timestamp <= this.cacheTTL)) {
        return {...cachedItem.result};
      }
      
      // 检查是否有相同请求正在进行中
      const pendingRequest = this.pendingRequests.get(requestHash);
      if (pendingRequest) {
        // 复用已经在进行中的相同请求
        return await pendingRequest;
      }
      
      // 使用请求队列限制并发，并添加到进行中请求
      const requestPromise = this.enqueueRequest(async () => {
        // 再次检查缓存，避免在队列等待期间缓存已更新
        const cachedItem = this.requestCache.get(requestHash);
        if (cachedItem && (Date.now() - cachedItem.timestamp <= this.cacheTTL)) {
          return {...cachedItem.result};
        }
        
        // 执行实际请求
        const result = await this.completeWithRetry(options);
        
        // 缓存结果
        this.requestCache.set(requestHash, {
          result,
          timestamp: Date.now()
        });
        
        return result;
      });
      
      // 添加到进行中请求
      this.pendingRequests.set(requestHash, requestPromise);
      
      // 完成后从进行中请求中移除
      requestPromise.finally(() => {
        this.pendingRequests.delete(requestHash);
      });
      
      return await requestPromise;
    }
    
    // 不使用缓存，但仍然限制并发
    return this.enqueueRequest(() => this.completeWithRetry(options));
  }
  
  /**
   * 发送完成请求(带重试)
   * @param options 完成选项
   * @private
   */
  private async completeWithRetry(options: CompletionOptions): Promise<CompletionResult> {
    const retry = options.retry || this.defaultRetry;
    let lastError: LLMConnectorError | null = null;
    
    // 生成唯一请求ID
    const requestId = options.model + '-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    
    // 设置AbortController
    const controller = new AbortController();
    this.activeRequests.set(requestId, controller);
    
    try {
      // 重试循环
      for (let attempt = 0; attempt <= retry.maxRetries; attempt++) {
        try {
          // 最后一次尝试
          if (attempt === retry.maxRetries) {
            const result = await this.executeCompletion({
              ...options,
              stream: false
            }, controller.signal, requestId);
            return result;
          }
          
          // 常规尝试
          const result = await this.executeCompletion({
            ...options,
            stream: false
          }, controller.signal, requestId);
          return result;
        } catch (error) {
          const llmError = this.normalizeError(error);
          lastError = llmError;
          
          // 检查错误是否可重试
          if (!this.isRetryableError(llmError) || attempt >= retry.maxRetries) {
            throw llmError;
          }
          
          // 计算退避延迟 (指数退避算法)
          const delay = Math.min(
            retry.initialDelay * Math.pow(2, attempt),
            retry.maxDelay
          );
          
          // 优先使用提供商建议的重试时间
          const retryAfter = llmError.retry?.retryAfter || delay;
          
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, retryAfter));
        }
      }
      
      // 若重试用尽但没有成功，抛出最后一个错误
      throw lastError || new LLMConnectorError(
        '达到最大重试次数', 
        LLMErrorType.UNKNOWN
      );
    } finally {
      // 清理请求
      this.activeRequests.delete(requestId);
    }
  }
  
  /**
   * 发送流式完成请求
   * @param options 完成选项
   */
  async *completeStream(options: CompletionOptions): AsyncIterable<CompletionChunk> {
    // 流式请求不支持缓存，但仍需限制并发
    
    // 创建一个Promise来处理队列
    const queuePromise = new Promise<void>((resolve, reject) => {
      const executeRequest = async () => {
        if (this.activeRequestCount < this.maxConcurrentRequests) {
          this.activeRequestCount++;
          resolve();
        } else {
          this.requestQueue.push(async () => {
            try {
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        }
      };
      
      executeRequest();
    });
    
    // 等待队列处理
    await queuePromise;
    
    try {
      const retry = options.retry || this.defaultRetry;
      let attempt = 0;
      let lastError: LLMConnectorError | null = null;
      
      // 生成唯一请求ID
      const requestId = options.model + '-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      
      // 设置AbortController
      const controller = new AbortController();
      this.activeRequests.set(requestId, controller);
      
      try {
        while (attempt <= retry.maxRetries) {
          try {
            // 调用子类实现的流式处理方法
            const stream = this.executeCompletionStream({
              ...options,
              stream: true
            }, controller.signal, requestId);
            
            // 使用for-await-of遍历流并产生结果
            for await (const chunk of stream) {
              yield chunk;
            }
            
            // 成功完成后返回
            return;
          } catch (error) {
            const llmError = this.normalizeError(error);
            lastError = llmError;
            
            // 检查错误是否可重试
            if (!this.isRetryableError(llmError) || attempt >= retry.maxRetries) {
              throw llmError;
            }
            
            attempt++;
            
            // 计算退避延迟
            const delay = Math.min(
              retry.initialDelay * Math.pow(2, attempt - 1),
              retry.maxDelay
            );
            
            // 优先使用提供商建议的重试时间
            const retryAfter = llmError.retry?.retryAfter || delay;
            
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, retryAfter));
            
            // 如果是流式传输中断，则返回重试事件
            yield {
              content: '',
              isLast: false,
              model: options.model,
              requestId: requestId
            };
          }
        }
        
        // 若重试用尽但没有成功，抛出最后一个错误
        throw lastError || new LLMConnectorError(
          '达到最大重试次数', 
          LLMErrorType.UNKNOWN
        );
      } finally {
        // 清理请求
        this.activeRequests.delete(requestId);
      }
    } finally {
      // 完成后减少活跃请求计数并处理队列
      this.activeRequestCount--;
      this.processQueue();
    }
  }
  
  /**
   * 中断请求
   * @param requestId 可选的请求ID
   */
  async abortRequest(requestId?: string): Promise<void> {
    if (requestId) {
      // 中断指定请求
      const controller = this.activeRequests.get(requestId);
      if (controller) {
        controller.abort();
        this.activeRequests.delete(requestId);
      }
    } else {
      // 中断所有请求
      for (const controller of this.activeRequests.values()) {
        controller.abort();
      }
      this.activeRequests.clear();
    }
  }
  
  /**
   * 执行完成请求
   * 子类必须实现
   */
  protected abstract executeCompletion(
    options: CompletionOptions, 
    abortSignal: AbortSignal,
    requestId: string
  ): Promise<CompletionResult>;
  
  /**
   * 执行流式完成请求
   * 子类必须实现
   */
  protected abstract executeCompletionStream(
    options: CompletionOptions,
    abortSignal: AbortSignal,
    requestId: string
  ): AsyncIterable<CompletionChunk>;
  
  /**
   * 规范化错误
   * 将各种错误转换为LLMConnectorError
   */
  protected normalizeError(error: unknown): LLMConnectorError {
    // 如果已经是LLMConnectorError，直接返回
    if (error instanceof LLMConnectorError) {
      return error;
    }
    
    // 处理标准错误
    if (error instanceof Error) {
      // AbortError处理
      if (error.name === 'AbortError' || error.message.includes('abort') || error.message.includes('AbortError')) {
        return new LLMConnectorError(
          '请求被中断', 
          LLMErrorType.ABORTED,
          {
            originalError: error,
            retryable: false
          }
        );
      }
      
      // 超时错误
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        return new LLMConnectorError(
          '请求超时', 
          LLMErrorType.TIMEOUT,
          {
            originalError: error,
            retryable: true
          }
        );
      }
      
      // 网络错误
      if (
        error.name === 'FetchError' || 
        error.message.includes('network') || 
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND')
      ) {
        return new LLMConnectorError(
          '网络连接错误: ' + error.message, 
          LLMErrorType.CONNECTION,
          {
            originalError: error,
            retryable: true
          }
        );
      }
      
      // 通用错误
      return new LLMConnectorError(
        error.message, 
        LLMErrorType.UNKNOWN,
        {
          originalError: error,
          retryable: false
        }
      );
    }
    
    // 处理非Error对象
    return new LLMConnectorError(
      typeof error === 'string' ? error : '未知错误',
      LLMErrorType.UNKNOWN,
      {
        originalError: typeof error === 'object' ? (error as Error) : undefined,
        retryable: false
      }
    );
  }
  
  /**
   * 判断错误是否可重试
   */
  protected isRetryableError(error: LLMConnectorError): boolean {
    // 如果错误明确指定了是否可重试，则使用该设置
    if (error.retry?.retryable !== undefined) {
      return error.retry.retryable;
    }
    
    // 基于错误类型判断是否可重试
    switch (error.type) {
      case LLMErrorType.TIMEOUT:
      case LLMErrorType.CONNECTION:
      case LLMErrorType.RATE_LIMIT:
      case LLMErrorType.SERVER:
        return true;
      
      case LLMErrorType.AUTHENTICATION:
      case LLMErrorType.PERMISSION:
      case LLMErrorType.MODEL_NOT_FOUND:
      case LLMErrorType.BAD_REQUEST:
      case LLMErrorType.CONTENT_FILTER:
      case LLMErrorType.ABORTED:
      case LLMErrorType.TOKEN_LIMIT:
      case LLMErrorType.UNKNOWN:
        return false;
    }
  }
} 