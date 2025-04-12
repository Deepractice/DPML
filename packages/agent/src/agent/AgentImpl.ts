/**
 * Agent实现类
 * 优化版本：添加并发控制和轻量级状态管理
 */
import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentConfig, AgentRequest, AgentResponse, AgentResult } from './types';
import { AgentStateManager } from '../state/AgentStateManager';
import { AgentMemory } from '../memory/AgentMemory';
import { LLMConnector, CompletionOptions, CompletionResult } from '../connector/LLMConnector';
import { EventSystem } from '../events/EventSystem';
import { AgentStatus, Message } from '../state/AgentState';

/**
 * AgentImpl构造函数选项接口
 */
interface AgentImplOptions extends AgentConfig {
  stateManager: AgentStateManager;
  memory: AgentMemory;
  connector: LLMConnector;
  eventSystem: EventSystem;
}

/**
 * 代理执行计数器和指标
 */
interface AgentMetrics {
  requestsProcessed: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  averageResponseTime: number;
  totalProcessingTime: number;
}

/**
 * 导出的Agent实现类
 * 真正的实现将在其他文件中完成
 */
export class AgentImpl implements Agent {
  private id: string;
  private version: string;
  private stateManager: AgentStateManager;
  private memory: AgentMemory;
  private llmConnector: LLMConnector;
  private eventSystem: EventSystem;
  private config: AgentConfig;
  private abortControllers: Map<string, AbortController>;
  
  /**
   * 活跃请求计数
   */
  private activeRequestCount: number = 0;
  
  /**
   * 最大并发请求数
   */
  private maxConcurrentRequests: number = 5;
  
  /**
   * 请求队列
   */
  private requestQueue: Array<() => Promise<void>> = [];
  
  /**
   * 会话状态缓存
   * 用于减少频繁的状态访问
   */
  private sessionStateCache: Map<string, {
    state: any,
    timestamp: number
  }> = new Map();
  
  /**
   * 缓存生存时间(毫秒)
   */
  private stateCacheTTL: number = 2000;
  
  /**
   * 性能指标
   */
  private metrics: AgentMetrics = {
    requestsProcessed: 0,
    tokensUsed: {
      prompt: 0,
      completion: 0,
      total: 0
    },
    averageResponseTime: 0,
    totalProcessingTime: 0
  };

  /**
   * 构造函数
   * @param options Agent配置选项
   */
  constructor(options: AgentImplOptions) {
    this.id = options.id;
    this.version = options.version;
    this.stateManager = options.stateManager;
    this.memory = options.memory;
    this.llmConnector = options.connector;
    this.eventSystem = options.eventSystem;
    this.config = {
      id: options.id,
      version: options.version,
      executionConfig: options.executionConfig
    };
    this.abortControllers = new Map();
    
    // 设置并发请求数量
    if (options.executionConfig?.maxConcurrentRequests) {
      this.maxConcurrentRequests = options.executionConfig.maxConcurrentRequests;
    }
    
    // 定期清理过期的状态缓存
    setInterval(() => this.cleanupStateCache(), 30000);
  }
  
  /**
   * 清理过期的状态缓存
   * @private
   */
  private cleanupStateCache(): void {
    const now = Date.now();
    for (const [key, item] of this.sessionStateCache.entries()) {
      if (now - item.timestamp > this.stateCacheTTL) {
        this.sessionStateCache.delete(key);
      }
    }
  }

  /**
   * 获取Agent ID
   * @returns Agent ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * 获取Agent版本
   * @returns Agent版本
   */
  getVersion(): string {
    return this.version;
  }
  
  /**
   * 获取代理指标
   * @returns 代理指标数据
   */
  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }
  
  /**
   * 更新指标
   * @param processingTime 处理时间(毫秒)
   * @param usage token使用情况
   * @private
   */
  private updateMetrics(processingTime: number, usage?: { promptTokens: number, completionTokens: number, totalTokens: number }): void {
    // 增加处理请求数
    this.metrics.requestsProcessed++;
    
    // 更新处理时间
    this.metrics.totalProcessingTime += processingTime;
    this.metrics.averageResponseTime = this.metrics.totalProcessingTime / this.metrics.requestsProcessed;
    
    // 更新token使用情况
    if (usage) {
      this.metrics.tokensUsed.prompt += usage.promptTokens || 0;
      this.metrics.tokensUsed.completion += usage.completionTokens || 0;
      this.metrics.tokensUsed.total += usage.totalTokens || 0;
    }
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
   * 获取Agent状态
   * @param sessionId 会话ID
   * @returns Agent状态
   */
  async getState(sessionId?: string): Promise<any> {
    // 如果未提供sessionId，使用第一个会话或创建新会话
    if (!sessionId) {
      const sessions = await this.stateManager.getSessions();
      if (sessions.length > 0) {
        sessionId = sessions[0];
      } else {
        // 创建一个新会话
        sessionId = uuidv4();
        await this.stateManager.initState(sessionId);
      }
    }
    
    // 检查缓存
    const now = Date.now();
    const cached = this.sessionStateCache.get(sessionId);
    if (cached && (now - cached.timestamp <= this.stateCacheTTL)) {
      return cached.state;
    }
    
    // 获取最新状态
    const state = await this.stateManager.getState(sessionId);
    
    // 更新缓存
    this.sessionStateCache.set(sessionId, {
      state,
      timestamp: now
    });
    
    return state;
  }

  /**
   * 执行Agent请求
   * @param request Agent请求
   * @returns 执行结果
   */
  async execute(request: AgentRequest): Promise<AgentResult> {
    // 使用并发队列控制并发执行数量
    return this.enqueueRequest(() => this.executeInternal(request));
  }
  
  /**
   * 内部执行方法
   * @param request Agent请求
   * @returns 执行结果
   * @private
   */
  private async executeInternal(request: AgentRequest): Promise<AgentResult> {
    const sessionId = request.sessionId || uuidv4();
    const startTime = Date.now();
    
    try {
      // 更新状态为思考中
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.THINKING
      });
      
      // 发送思考事件
      this.eventSystem.emit('agent:thinking', {
        agentId: this.id,
        sessionId
      });
      
      // 添加用户消息到状态
      await this.stateManager.addMessage(sessionId, {
        id: uuidv4(),
        role: 'user',
        content: request.text,
        createdAt: Date.now()
      });
      
      // 存储用户消息到记忆
      await this.memory.store(sessionId, {
        text: request.text,
        role: 'user',
        timestamp: Date.now()
      });
      
      // 更新状态为响应中
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.RESPONDING
      });
      
      // 更新状态缓存
      this.invalidateStateCache(sessionId);
      
      // 发送响应事件
      this.eventSystem.emit('agent:responding', {
        agentId: this.id,
        sessionId
      });
      
      // 准备上下文和系统提示
      const state = await this.stateManager.getState(sessionId);
      
      // 创建中止控制器
      const abortController = new AbortController();
      this.abortControllers.set(sessionId, abortController);
      
      // 发送LLM前事件
      this.eventSystem.emit('agent:llm:before', {
        agentId: this.id,
        sessionId,
        messages: state?.messages || []
      });
      
      // 优化消息格式转换，减少内存复制
      const formattedMessages = this.formatMessages(state?.messages || [], request);
      
      // 准备请求选项
      const requestOptions: CompletionOptions = {
        messages: formattedMessages,
        model: request.model || this.config.executionConfig.defaultModel,
        signal: abortController.signal,
        maxTokens: request.maxTokens || this.config.executionConfig.maxResponseTokens,
        temperature: request.temperature || this.config.executionConfig.temperature
      };
      
      // 如果频繁调用相同内容，允许使用缓存提高性能
      if (request.allowCache !== false) {
        requestOptions.useCache = true;
      }
      
      // 执行LLM调用
      const result = await this.llmConnector.complete(requestOptions);
      
      // 发送LLM成功事件
      this.eventSystem.emit('agent:llm:success', {
        agentId: this.id,
        sessionId,
        result
      });
      
      // 添加助手消息到状态
      await this.stateManager.addMessage(sessionId, {
        id: uuidv4(),
        role: 'assistant',
        content: result.content,
        createdAt: Date.now()
      });
      
      // 存储助手消息到记忆
      await this.memory.store(sessionId, {
        text: result.content,
        role: 'assistant',
        timestamp: Date.now()
      });
      
      // 更新状态为完成
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.DONE
      });
      
      // 更新状态缓存
      this.invalidateStateCache(sessionId);
      
      // 发送完成事件
      this.eventSystem.emit('agent:done', {
        agentId: this.id,
        sessionId
      });
      
      // 清除中止控制器
      this.abortControllers.delete(sessionId);
      
      // 计算处理时间
      const processingTimeMs = Date.now() - startTime;
      
      // 更新性能指标
      this.updateMetrics(processingTimeMs, result.usage);
      
      // 返回结果
      return {
        text: result.content,
        sessionId,
        finishReason: 'done',
        processingTimeMs,
        success: true,
        usage: result.usage
      };
    } catch (error) {
      // 计算处理时间
      const processingTimeMs = Date.now() - startTime;
      
      // 更新错误状态
      try {
        await this.stateManager.updateState(sessionId, {
          status: AgentStatus.ERROR
        });
        
        // 更新状态缓存
        this.invalidateStateCache(sessionId);
      } catch (stateError) {
        // 状态更新错误不应影响响应
        console.error('更新状态失败:', stateError);
      }
      
      // 发送错误事件
      this.eventSystem.emit('agent:error', {
        agentId: this.id,
        sessionId,
        error
      });
      
      // 清除中止控制器
      this.abortControllers.delete(sessionId);
      
      // 更新性能指标 - 即使出错也记录
      this.updateMetrics(processingTimeMs);
      
      // 返回错误结果
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        text: `执行出错: ${errorMessage}`,
        sessionId,
        finishReason: 'error',
        processingTimeMs,
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * 格式化消息，优化内存使用
   * @param messages 原始消息
   * @param request 请求对象
   * @returns 格式化后的消息
   * @private
   */
  private formatMessages(messages: Message[], request: AgentRequest): Array<{role: string, content: string}> {
    // 创建一个新数组，避免修改原始消息
    const formattedMessages: Array<{role: string, content: string}> = [];
    
    // 添加系统提示词
    if (this.config.executionConfig.systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: this.config.executionConfig.systemPrompt
      });
    }
    
    // 添加上下文消息，但进行长度限制
    if (request.maxContextMessages) {
      // 限制上下文消息数量，保留最近的n条
      const recentMessages = messages.slice(-request.maxContextMessages);
      for (const msg of recentMessages) {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    } else {
      // 使用所有消息
      for (const msg of messages) {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }
    
    return formattedMessages;
  }
  
  /**
   * 使状态缓存失效
   * @param sessionId 会话ID
   * @private
   */
  private invalidateStateCache(sessionId: string): void {
    this.sessionStateCache.delete(sessionId);
  }

  /**
   * 执行Agent流式请求
   * @param request Agent请求
   * @returns 流式执行结果
   */
  async *executeStream(request: AgentRequest): AsyncGenerator<AgentResponse> {
    // 使用并发队列和流式请求
    const stream = await this.enqueueRequest(async () => {
      const sessionId = request.sessionId || uuidv4();
      const startTime = Date.now();
      
      try {
        // 更新状态为思考中
        await this.stateManager.updateState(sessionId, {
          status: AgentStatus.THINKING
        });
        
        // 发送思考事件
        this.eventSystem.emit('agent:thinking', {
          agentId: this.id,
          sessionId
        });
        
        // 添加用户消息到状态
        await this.stateManager.addMessage(sessionId, {
          id: uuidv4(),
          role: 'user',
          content: request.text,
          createdAt: Date.now()
        });
        
        // 存储用户消息到记忆
        await this.memory.store(sessionId, {
          text: request.text,
          role: 'user',
          timestamp: Date.now()
        });
        
        // 更新状态为响应中
        await this.stateManager.updateState(sessionId, {
          status: AgentStatus.RESPONDING
        });
        
        // 更新状态缓存
        this.invalidateStateCache(sessionId);
        
        // 发送响应事件
        this.eventSystem.emit('agent:responding', {
          agentId: this.id,
          sessionId
        });
        
        // 准备上下文和系统提示
        const state = await this.stateManager.getState(sessionId);
        
        // 创建中止控制器
        const abortController = new AbortController();
        this.abortControllers.set(sessionId, abortController);
        
        // 发送LLM前事件
        this.eventSystem.emit('agent:llm:before', {
          agentId: this.id,
          sessionId,
          messages: state?.messages || []
        });
        
        // 优化消息格式转换
        const formattedMessages = this.formatMessages(state?.messages || [], request);
        
        // 准备请求选项
        const requestOptions: CompletionOptions = {
          messages: formattedMessages,
          model: request.model || this.config.executionConfig.defaultModel,
          signal: abortController.signal,
          stream: true,
          maxTokens: request.maxTokens || this.config.executionConfig.maxResponseTokens,
          temperature: request.temperature || this.config.executionConfig.temperature
        };
        
        // 流式请求不使用缓存
        requestOptions.useCache = false;
        
        // 创建转换流返回
        return {
          sessionId,
          stream: this.llmConnector.completeStream(requestOptions),
          startTime,
          fullContent: '',
          tokens: 0
        };
      } catch (error) {
        // 错误初始化处理
        await this.stateManager.updateState(sessionId, {
          status: AgentStatus.ERROR
        });
        
        // 更新状态缓存
        this.invalidateStateCache(sessionId);
        
        // 发送错误事件
        this.eventSystem.emit('agent:error', {
          agentId: this.id,
          sessionId,
          error: error instanceof Error ? error : new Error(String(error))
        });
        
        // 清除中止控制器
        this.abortControllers.delete(sessionId);
        
        // 抛出错误
        throw error;
      }
    });
    
    // 处理流式响应
    try {
      for await (const chunk of stream.stream) {
        // 更新完整内容
        stream.fullContent += chunk.content;
        
        // 更新token计数
        stream.tokens++;
        
        // 产生响应块
        yield {
          sessionId: stream.sessionId,
          text: chunk.content,
          isLast: chunk.isLast,
          finishReason: chunk.finishReason
        };
        
        // 如果是最后一块，处理完成逻辑
        if (chunk.isLast) {
          // 添加助手消息到状态
          await this.stateManager.addMessage(stream.sessionId, {
            id: uuidv4(),
            role: 'assistant',
            content: stream.fullContent,
            createdAt: Date.now()
          });
          
          // 存储助手消息到记忆
          await this.memory.store(stream.sessionId, {
            text: stream.fullContent,
            role: 'assistant',
            timestamp: Date.now()
          });
          
          // 更新状态为完成
          await this.stateManager.updateState(stream.sessionId, {
            status: AgentStatus.DONE
          });
          
          // 更新状态缓存
          this.invalidateStateCache(stream.sessionId);
          
          // 发送完成事件
          this.eventSystem.emit('agent:done', {
            agentId: this.id,
            sessionId: stream.sessionId
          });
          
          // 清除中止控制器
          this.abortControllers.delete(stream.sessionId);
          
          // 计算处理时间
          const processingTimeMs = Date.now() - stream.startTime;
          
          // 更新指标
          this.updateMetrics(processingTimeMs, {
            promptTokens: 0, // 暂无法获取精确值
            completionTokens: stream.tokens,
            totalTokens: stream.tokens
          });
        }
      }
    } catch (error) {
      // 错误处理
      await this.stateManager.updateState(stream.sessionId, {
        status: AgentStatus.ERROR
      });
      
      // 更新状态缓存
      this.invalidateStateCache(stream.sessionId);
      
      // 发送错误事件
      this.eventSystem.emit('agent:error', {
        agentId: this.id,
        sessionId: stream.sessionId,
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      // 清除中止控制器
      this.abortControllers.delete(stream.sessionId);
      
      // 计算处理时间
      const processingTimeMs = Date.now() - stream.startTime;
      
      // 更新指标
      this.updateMetrics(processingTimeMs);
      
      // 构建错误消息
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // 产生错误响应
      yield {
        sessionId: stream.sessionId,
        text: errorMessage,
        isLast: true,
        finishReason: 'error',
        error: errorMessage
      };
    }
  }

  /**
   * 中断执行
   * @param sessionId 会话ID
   */
  async interrupt(sessionId: string): Promise<void> {
    // 获取中止控制器
    const controller = this.abortControllers.get(sessionId);
    if (controller) {
      // 中止请求
      controller.abort();
      this.abortControllers.delete(sessionId);
    }
    
    // 更新状态为暂停
    await this.stateManager.updateState(sessionId, {
      status: AgentStatus.PAUSED
    });
    
    // 更新状态缓存
    this.invalidateStateCache(sessionId);
    
    // 发送中断事件
    this.eventSystem.emit('agent:interrupted', {
      agentId: this.id,
      sessionId
    });
    
    // 中断LLM请求
    await this.llmConnector.abortRequest();
  }

  /**
   * 重置代理
   * @param sessionId 会话ID
   */
  async reset(sessionId: string): Promise<void> {
    // 中断当前请求
    const controller = this.abortControllers.get(sessionId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(sessionId);
    }
    
    // 重置状态
    await this.stateManager.resetState(sessionId);
    
    // 清除记忆
    await this.memory.clear(sessionId);
    
    // 更新状态缓存
    this.invalidateStateCache(sessionId);
    
    // 发送重置事件
    this.eventSystem.emit('agent:reset', {
      agentId: this.id,
      sessionId
    });
  }
} 