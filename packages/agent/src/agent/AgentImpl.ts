/**
 * Agent实现类
 * 优化版本：添加并发控制和轻量级状态管理
 */
import { v4 as uuidv4 } from 'uuid';

import { EventType } from '../events/EventTypes';
import { AgentStatus } from '../state/AgentState';

import type {
  Agent,
  AgentConfig,
  AgentRequest,
  AgentResponse,
  AgentResult,
} from './types';
import type {
  LLMConnector,
  CompletionOptions,
} from '../connector/LLMConnector';
import type { EventSystem } from '../events/EventSystem';
import type { SessionEventData } from '../events/EventTypes';
import type { AgentMemory } from '../memory/AgentMemory';
import type { Message } from '../state/AgentState';
import type { AgentStateManager } from '../state/AgentStateManager';

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
  private sessionStateCache: Map<
    string,
    {
      state: any;
      timestamp: number;
    }
  > = new Map();

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
      total: 0,
    },
    averageResponseTime: 0,
    totalProcessingTime: 0,
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
      executionConfig: options.executionConfig,
    };
    this.abortControllers = new Map();

    // 设置并发请求数量
    if (options.executionConfig?.maxConcurrentRequests) {
      this.maxConcurrentRequests =
        options.executionConfig.maxConcurrentRequests;
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
  private updateMetrics(
    processingTime: number,
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }
  ): void {
    // 增加处理请求数
    this.metrics.requestsProcessed++;

    // 更新处理时间
    this.metrics.totalProcessingTime += processingTime;
    this.metrics.averageResponseTime =
      this.metrics.totalProcessingTime / this.metrics.requestsProcessed;

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
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 处理请求队列
   * @private
   */
  private processQueue(): void {
    if (
      this.requestQueue.length === 0 ||
      this.activeRequestCount >= this.maxConcurrentRequests
    ) {
      return;
    }

    const request = this.requestQueue.shift();

    if (request) {
      this.activeRequestCount++;
      request().finally(() => {
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
    // 如果未提供sessionId，返回一个空状态
    if (!sessionId) {
      const allSessions = await this.stateManager.getAllSessionIds();

      if (allSessions.length > 0) {
        sessionId = allSessions[0];
      } else {
        // 返回空状态
        return {
          messages: [],
          status: AgentStatus.IDLE,
        };
      }
    }

    // 检查缓存
    const now = Date.now();
    const cached = this.sessionStateCache.get(sessionId);

    if (cached && now - cached.timestamp <= this.stateCacheTTL) {
      return cached.state;
    }

    // 获取最新状态
    let state = await this.stateManager.getState(sessionId);

    // 如果状态不存在，返回空状态
    if (!state) {
      state = {
        messages: [],
        status: AgentStatus.IDLE,
      };
    }

    // 更新缓存
    this.sessionStateCache.set(sessionId, {
      state,
      timestamp: now,
    });

    return state;
  }

  /**
   * 确保会话存在，如果不存在则创建
   * @param sessionId 会话ID
   * @private
   */
  private async ensureSessionExists(sessionId: string): Promise<void> {
    const exists = await this.stateManager.hasSession(sessionId);

    if (!exists) {
      await this.stateManager.createSession(sessionId);
    }
  }

  /**
   * 确保会话状态有效
   * @param sessionId 会话ID
   * @param targetState 目标状态
   * @private
   */
  private async ensureValidState(
    sessionId: string,
    targetState: AgentStatus
  ): Promise<void> {
    try {
      // 检查会话是否存在
      const sessionExists = await this.stateManager.hasSession(sessionId);

      if (!sessionExists) {
        await this.stateManager.createSession(sessionId);

        return;
      }

      // 获取当前状态
      const currentState = await this.stateManager.getState(sessionId);

      if (!currentState) {
        await this.stateManager.createSession(sessionId);

        return;
      }

      // 检查是否需要重置状态
      const needsReset =
        currentState.status === AgentStatus.ERROR ||
        currentState.status === AgentStatus.DONE ||
        (currentState.status !== AgentStatus.IDLE &&
          !this.isValidStateTransition(currentState.status, targetState));

      if (needsReset) {
        // 重置状态
        await this.stateManager.resetState(sessionId);

        // 发送状态重置事件
        this.eventSystem.emit(EventType.AGENT_STATE_RESET, {
          agentId: this.id,
          sessionId,
          previousStatus: currentState.status,
          currentStatus: AgentStatus.IDLE,
          reason: 'auto-reset',
          timestamp: Date.now(),
        } as SessionEventData);
      }
    } catch (error) {
      // 记录错误但不抛出，尽量保持会话流畅
      console.error(`确保状态有效时出错: ${error.message}`);

      // 尝试重置状态
      try {
        await this.stateManager.createSession(sessionId);
      } catch (resetError) {
        console.error(`创建会话失败: ${resetError.message}`);
      }
    }
  }

  /**
   * 检查状态转换是否有效
   * @param from 起始状态
   * @param to 目标状态
   * @private
   */
  private isValidStateTransition(from: AgentStatus, to: AgentStatus): boolean {
    const AGENT_STATE_TRANSITIONS = {
      [AgentStatus.IDLE]: [AgentStatus.THINKING, AgentStatus.ERROR],
      [AgentStatus.THINKING]: [
        AgentStatus.EXECUTING,
        AgentStatus.RESPONDING,
        AgentStatus.ERROR,
        AgentStatus.PAUSED,
      ],
      [AgentStatus.EXECUTING]: [
        AgentStatus.THINKING,
        AgentStatus.RESPONDING,
        AgentStatus.DONE,
        AgentStatus.ERROR,
        AgentStatus.PAUSED,
      ],
      [AgentStatus.RESPONDING]: [
        AgentStatus.DONE,
        AgentStatus.ERROR,
        AgentStatus.PAUSED,
      ],
      [AgentStatus.DONE]: [AgentStatus.IDLE, AgentStatus.ERROR],
      [AgentStatus.PAUSED]: [
        AgentStatus.THINKING,
        AgentStatus.EXECUTING,
        AgentStatus.RESPONDING,
        AgentStatus.ERROR,
      ],
      [AgentStatus.ERROR]: [AgentStatus.IDLE],
    };

    const validTransitions = AGENT_STATE_TRANSITIONS[from];

    return validTransitions?.includes(to) || false;
  }

  /**
   * 执行Agent请求
   * @param request Agent请求
   * @returns 执行结果
   */
  async execute(request: AgentRequest): Promise<AgentResult> {
    const sessionId = request.sessionId || uuidv4();

    // 确保状态有效
    await this.ensureValidState(sessionId, AgentStatus.THINKING);

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
      // 确保会话存在
      await this.ensureSessionExists(sessionId);

      // 更新状态为思考中
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.THINKING,
      });

      // 发送思考事件
      this.eventSystem.emit(EventType.AGENT_THINKING, {
        agentId: this.id,
        sessionId,
      } as SessionEventData);

      // 获取当前状态
      const currentState = await this.stateManager.getState(sessionId);

      // 添加用户消息到状态
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: request.text,
        createdAt: Date.now(),
      };

      // 更新状态中的消息数组
      const updatedMessages = [...(currentState?.messages || []), userMessage];

      await this.stateManager.updateState(sessionId, {
        messages: updatedMessages,
      });

      // 存储用户消息到记忆
      await this.memory.store(sessionId, {
        text: request.text,
        role: 'user',
        timestamp: Date.now(),
      });

      // 更新状态为响应中
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.RESPONDING,
      });

      // 更新状态缓存
      this.invalidateStateCache(sessionId);

      // 发送响应事件
      this.eventSystem.emit(EventType.AGENT_RESPONDING, {
        agentId: this.id,
        sessionId,
      } as SessionEventData);

      // 准备上下文和系统提示
      const state = await this.stateManager.getState(sessionId);

      // 创建中止控制器
      const abortController = new AbortController();

      this.abortControllers.set(sessionId, abortController);

      // 发送LLM前事件
      this.eventSystem.emit(EventType.AGENT_LLM_BEFORE, {
        agentId: this.id,
        sessionId,
        messages: state?.messages || [],
      } as SessionEventData);

      // 优化消息格式转换，减少内存复制
      const formattedMessages = this.formatMessages(
        state?.messages || [],
        request
      );

      // 准备请求选项
      const requestOptions: CompletionOptions = {
        messages: formattedMessages,
        model: request.model || this.config.executionConfig.defaultModel,
        signal: abortController.signal,
        maxTokens:
          request.maxTokens || this.config.executionConfig.maxResponseTokens,
        temperature:
          request.temperature || this.config.executionConfig.temperature,
      };

      // 如果频繁调用相同内容，允许使用缓存提高性能
      if (request.allowCache !== false) {
        requestOptions.useCache = true;
      }

      // 执行LLM调用
      const result = await this.llmConnector.complete(requestOptions);

      // 发送LLM成功事件
      this.eventSystem.emit(EventType.AGENT_LLM_SUCCESS, {
        agentId: this.id,
        sessionId,
        result,
      } as SessionEventData);

      // 添加助手消息到状态
      const assistantMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: result.content,
        createdAt: Date.now(),
      };

      // 更新状态中的消息数组
      const updatedMessagesWithAssistant = [
        ...(state?.messages || []),
        assistantMessage,
      ];

      await this.stateManager.updateState(sessionId, {
        messages: updatedMessagesWithAssistant,
      });

      // 存储助手消息到记忆
      await this.memory.store(sessionId, {
        text: result.content,
        role: 'assistant',
        timestamp: Date.now(),
      });

      // 更新状态为完成
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.DONE,
      });

      // 更新状态缓存
      this.invalidateStateCache(sessionId);

      // 发送完成事件
      this.eventSystem.emit('agent:done', {
        agentId: this.id,
        sessionId,
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
        usage: result.usage,
        processingTimeMs,
        success: true,
        response: {
          text: result.content,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      // 计算处理时间
      const processingTimeMs = Date.now() - startTime;

      // 尝试创建会话（如果尚未创建）
      try {
        const exists = await this.stateManager.hasSession(sessionId);

        if (!exists) {
          await this.stateManager.createSession(sessionId);
        }

        // 更新错误状态
        await this.stateManager.updateState(sessionId, {
          status: AgentStatus.ERROR,
        });
      } catch (stateError) {
        // 状态更新错误不应影响响应
        console.error('更新状态失败:', stateError);
      }

      // 更新状态缓存
      this.invalidateStateCache(sessionId);

      // 发送错误事件
      this.eventSystem.emit('agent:error', {
        agentId: this.id,
        sessionId,
        error,
      });

      // 清除中止控制器
      this.abortControllers.delete(sessionId);

      // 返回错误结果
      return {
        sessionId,
        success: false,
        error: (error as Error).message || String(error),
        processingTimeMs,
      };
    }
  }

  /**
   * 格式化消息
   * @param messages 消息数组
   * @param request 请求参数
   * @returns 格式化的消息数组
   * @private
   */
  private formatMessages(
    messages: Message[],
    request: AgentRequest
  ): Array<{ role: string; content: string }> {
    const result: Array<{ role: string; content: string }> = [];

    // 添加系统提示
    result.push({
      role: 'system',
      content: this.config.executionConfig.systemPrompt,
    });

    // 限制上下文消息数量
    let filteredMessages = messages;

    if (
      request.maxContextMessages &&
      messages.length > request.maxContextMessages
    ) {
      // 保留系统消息和最近的N条消息
      const systemMessages = messages.filter(m => m.role === 'system');
      const nonSystemMessages = messages
        .filter(m => m.role !== 'system')
        .slice(-request.maxContextMessages);

      filteredMessages = [...systemMessages, ...nonSystemMessages];
    }

    // 添加历史消息
    for (const message of filteredMessages) {
      result.push({
        role: message.role,
        content: message.content,
      });
    }

    return result;
  }

  /**
   * 使缓存中的状态失效
   * @param sessionId 会话ID
   * @private
   */
  private invalidateStateCache(sessionId: string): void {
    this.sessionStateCache.delete(sessionId);
  }

  /**
   * 流式执行Agent请求
   * @param request Agent请求
   */
  async *executeStream(request: AgentRequest): AsyncGenerator<AgentResponse> {
    const sessionId = request.sessionId || uuidv4();
    const startTime = Date.now();

    try {
      // 确保状态有效
      await this.ensureValidState(sessionId, AgentStatus.THINKING);

      // 更新状态为思考中
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.THINKING,
      });

      // 发送思考事件
      this.eventSystem.emit('agent:thinking', {
        agentId: this.id,
        sessionId,
      });

      // 获取当前状态
      const currentState = await this.stateManager.getState(sessionId);

      // 添加用户消息到状态
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: request.text,
        createdAt: Date.now(),
      };

      // 更新状态中的消息数组
      const updatedMessages = [...(currentState?.messages || []), userMessage];

      await this.stateManager.updateState(sessionId, {
        messages: updatedMessages,
      });

      // 存储用户消息到记忆
      await this.memory.store(sessionId, {
        text: request.text,
        role: 'user',
        timestamp: Date.now(),
      });

      // 更新状态为响应中
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.RESPONDING,
      });

      // 更新状态缓存
      this.invalidateStateCache(sessionId);

      // 发送响应事件
      this.eventSystem.emit(EventType.AGENT_RESPONDING, {
        agentId: this.id,
        sessionId,
      } as SessionEventData);

      // 准备上下文和系统提示
      const state = await this.stateManager.getState(sessionId);

      // 创建中止控制器
      const abortController = new AbortController();

      this.abortControllers.set(sessionId, abortController);

      // 发送LLM前事件
      this.eventSystem.emit(EventType.AGENT_LLM_BEFORE, {
        agentId: this.id,
        sessionId,
        messages: state?.messages || [],
      } as SessionEventData);

      // 优化消息格式转换，减少内存复制
      const formattedMessages = this.formatMessages(
        state?.messages || [],
        request
      );

      // 准备请求选项
      const requestOptions: CompletionOptions = {
        messages: formattedMessages,
        model: request.model || this.config.executionConfig.defaultModel,
        signal: abortController.signal,
        maxTokens:
          request.maxTokens || this.config.executionConfig.maxResponseTokens,
        temperature:
          request.temperature || this.config.executionConfig.temperature,
        stream: true,
      };

      // 流式执行LLM调用
      const stream = await this.llmConnector.completeStream(requestOptions);

      // 完整响应文本，用于最后记录到历史
      let fullResponseText = '';

      // 迭代流响应
      for await (const chunk of stream) {
        // 更新完整响应
        fullResponseText += chunk.content;

        // 创建并返回响应块
        const responseChunk: AgentResponse = {
          text: chunk.content,
          timestamp: new Date().toISOString(),
        };

        yield responseChunk;
      }

      // 添加完整响应到状态
      const assistantMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: fullResponseText,
        createdAt: Date.now(),
      };

      // 更新状态中的消息数组
      const updatedMessagesWithAssistant = [
        ...(state?.messages || []),
        assistantMessage,
      ];

      await this.stateManager.updateState(sessionId, {
        messages: updatedMessagesWithAssistant,
      });

      // 存储助手消息到记忆
      await this.memory.store(sessionId, {
        text: fullResponseText,
        role: 'assistant',
        timestamp: Date.now(),
      });

      // 更新状态为完成
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.DONE,
      });

      // 更新状态缓存
      this.invalidateStateCache(sessionId);

      // 发送完成事件
      this.eventSystem.emit('agent:done', {
        agentId: this.id,
        sessionId,
      });

      // 清除中止控制器
      this.abortControllers.delete(sessionId);

      // 计算处理时间
      const processingTimeMs = Date.now() - startTime;

      // 更新指标
      this.updateMetrics(processingTimeMs);
    } catch (error) {
      // 尝试创建会话（如果尚未创建）
      try {
        const exists = await this.stateManager.hasSession(sessionId);

        if (!exists) {
          await this.stateManager.createSession(sessionId);
        }

        // 更新错误状态
        await this.stateManager.updateState(sessionId, {
          status: AgentStatus.ERROR,
        });
      } catch (stateError) {
        // 状态更新错误不应影响响应
        console.error('更新状态失败:', stateError);
      }

      // 更新状态缓存
      this.invalidateStateCache(sessionId);

      // 发送错误事件
      this.eventSystem.emit('agent:error', {
        agentId: this.id,
        sessionId,
        error,
      });

      // 清除中止控制器
      this.abortControllers.delete(sessionId);

      // 最后一个响应块包含错误信息
      yield {
        text: `错误: ${(error as Error).message || String(error)}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
    }
  }

  /**
   * 中断Agent执行
   * @param sessionId 会话ID
   */
  async interrupt(sessionId: string): Promise<void> {
    // 获取中止控制器
    const controller = this.abortControllers.get(sessionId);

    if (controller) {
      controller.abort();
      this.abortControllers.delete(sessionId);

      // 确保会话存在
      const exists = await this.stateManager.hasSession(sessionId);

      if (exists) {
        // 更新状态为中断
        await this.stateManager.updateState(sessionId, {
          status: AgentStatus.INTERRUPTED,
        });

        // 更新状态缓存
        this.invalidateStateCache(sessionId);

        // 发送中断事件
        this.eventSystem.emit('agent:interrupted', {
          agentId: this.id,
          sessionId,
        });
      }
    }
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

    // 检查会话是否存在，如果不存在则创建
    const exists = await this.stateManager.hasSession(sessionId);

    if (!exists) {
      await this.stateManager.createSession(sessionId);
    } else {
      // 重置状态
      await this.stateManager.resetState(sessionId);
    }

    // 清除记忆
    await this.memory.clear(sessionId);

    // 更新状态缓存
    this.invalidateStateCache(sessionId);

    // 发送重置事件
    this.eventSystem.emit('agent:reset', {
      agentId: this.id,
      sessionId,
    });
  }
}
