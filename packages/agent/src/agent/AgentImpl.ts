/**
 * Agent实现类
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
    
    return this.stateManager.getState(sessionId);
  }

  /**
   * 执行Agent请求
   * @param request Agent请求
   * @returns 执行结果
   */
  async execute(request: AgentRequest): Promise<AgentResult> {
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
      
      // 准备请求选项
      const requestOptions: CompletionOptions = {
        messages: state?.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })) || [],
        model: request.model || this.config.executionConfig.defaultModel,
        signal: abortController.signal
      };
      
      // 添加系统提示词
      if (this.config.executionConfig.systemPrompt) {
        requestOptions.messages.unshift({
          role: 'system',
          content: this.config.executionConfig.systemPrompt
        });
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
      
      // 发送完成事件
      this.eventSystem.emit('agent:done', {
        agentId: this.id,
        sessionId
      });
      
      // 清除中止控制器
      this.abortControllers.delete(sessionId);
      
      // 计算处理时间
      const processingTimeMs = Date.now() - startTime;
      
      return {
        success: true,
        sessionId,
        text: result.content,
        finishReason: 'done',
        processingTimeMs,
        usage: result.usage
      };
    } catch (error) {
      // 错误处理
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.ERROR
      });
      
      // 发送错误事件
      this.eventSystem.emit('agent:error', {
        agentId: this.id,
        sessionId,
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      // 清除中止控制器
      this.abortControllers.delete(sessionId);
      
      // 计算处理时间
      const processingTimeMs = Date.now() - startTime;
      
      // 构建错误消息
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        sessionId,
        text: errorMessage,
        finishReason: 'error',
        error: errorMessage,
        processingTimeMs
      };
    }
  }

  /**
   * 流式执行Agent请求
   * @param request Agent请求
   */
  async *executeStream(request: AgentRequest): AsyncGenerator<AgentResponse> {
    const sessionId = request.sessionId || uuidv4();
    
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
      
      // 准备请求选项
      const requestOptions: CompletionOptions = {
        messages: state?.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })) || [],
        model: request.model || this.config.executionConfig.defaultModel,
        signal: abortController.signal,
        stream: true
      };
      
      // 添加系统提示词
      if (this.config.executionConfig.systemPrompt) {
        requestOptions.messages.unshift({
          role: 'system',
          content: this.config.executionConfig.systemPrompt
        });
      }
      
      // 执行LLM流式调用
      const stream = this.llmConnector.completeStream(requestOptions);
      
      let fullText = '';
      const startTime = Date.now();
      
      for await (const chunk of stream) {
        fullText += chunk.content;
        
        yield {
          text: chunk.content,
          timestamp: new Date().toISOString()
        };
      }
      
      // 添加助手消息到状态
      await this.stateManager.addMessage(sessionId, {
        id: uuidv4(),
        role: 'assistant',
        content: fullText,
        createdAt: Date.now()
      });
      
      // 存储助手消息到记忆
      await this.memory.store(sessionId, {
        text: fullText,
        role: 'assistant',
        timestamp: Date.now()
      });
      
      // 更新状态为完成
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.DONE
      });
      
      // 发送完成事件
      this.eventSystem.emit('agent:done', {
        agentId: this.id,
        sessionId
      });
      
      // 清除中止控制器
      this.abortControllers.delete(sessionId);
    } catch (error) {
      // 错误处理
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.ERROR
      });
      
      // 发送错误事件
      this.eventSystem.emit('agent:error', {
        agentId: this.id,
        sessionId,
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      // 清除中止控制器
      this.abortControllers.delete(sessionId);
      
      throw error;
    }
  }

  /**
   * 中断Agent执行
   * @param sessionId 会话ID
   */
  async interrupt(sessionId: string): Promise<void> {
    const abortController = this.abortControllers.get(sessionId);
    
    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(sessionId);
      
      // 更新状态为中断
      await this.stateManager.updateState(sessionId, {
        status: AgentStatus.PAUSED
      });
      
      // 发送中断事件
      this.eventSystem.emit('agent:interrupted', {
        agentId: this.id,
        sessionId
      });
    }
  }

  /**
   * 重置Agent状态
   * @param sessionId 会话ID
   */
  async reset(sessionId: string): Promise<void> {
    // 重置状态
    await this.stateManager.resetState(sessionId);
    
    // 清除记忆
    await this.memory.clear(sessionId);
    
    // 清除中止控制器
    this.abortControllers.delete(sessionId);
    
    // 发送重置事件
    this.eventSystem.emit('agent:reset', {
      agentId: this.id,
      sessionId
    });
  }
} 