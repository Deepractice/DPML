/**
 * Agent执行相关类型定义
 */
import { CompletionChunk } from '../connector/LLMConnector';
import { AgentState, AgentStatus, Message } from '../state/AgentState';

/**
 * 代理输入选项
 */
export interface AgentInputOptions {
  /**
   * 用户输入文本
   */
  text: string;

  /**
   * 会话ID，用于区分不同会话上下文
   * 如果未提供，将自动生成
   */
  sessionId?: string;

  /**
   * 超时时间（毫秒）
   * 如果为0则不设置超时
   */
  timeoutMs?: number;

  /**
   * 是否启用流式执行模式
   */
  stream?: boolean;

  /**
   * 元数据，任意附加信息
   */
  metadata?: Record<string, any>;
}

/**
 * 代理输出结果
 */
export interface AgentOutput {
  /**
   * 响应文本
   */
  text: string;

  /**
   * 会话ID
   */
  sessionId: string;

  /**
   * 完成原因
   */
  finishReason?: 'done' | 'timeout' | 'error' | 'interrupted';

  /**
   * 使用统计
   */
  usage?: {
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
   * 处理时长（毫秒）
   */
  processingTimeMs: number;

  /**
   * 元数据，任意附加信息
   */
  metadata?: Record<string, any>;
}

/**
 * 代理输出流块，用于流式执行模式
 */
export interface AgentOutputChunk {
  /**
   * 响应文本片段
   */
  text: string;

  /**
   * 会话ID
   */
  sessionId: string;

  /**
   * 是否为最后一个块
   */
  isLast: boolean;

  /**
   * 完成原因（仅在最后一个块中可能存在）
   */
  finishReason?: 'done' | 'timeout' | 'error' | 'interrupted';

  /**
   * 处理时长（毫秒）（仅在最后一个块中存在）
   */
  processingTimeMs?: number;

  /**
   * 元数据，任意附加信息
   */
  metadata?: Record<string, any>;
}

/**
 * 代理执行配置
 */
export interface AgentExecutionConfig {
  /**
   * 默认模型
   */
  defaultModel: string;

  /**
   * API类型
   */
  apiType: string;

  /**
   * 系统提示词
   */
  systemPrompt: string;

  /**
   * 最大响应token数
   * 默认为1000
   */
  maxResponseTokens?: number;

  /**
   * 温度参数(0-1)
   * 默认为0.7
   */
  temperature?: number;

  /**
   * 最大并发请求数
   * 默认为5
   */
  maxConcurrentRequests?: number;

  /**
   * 默认请求超时时间(毫秒)
   * 默认为60000 (1分钟)
   */
  defaultTimeout?: number;
}

/**
 * Agent接口
 * 定义Agent的核心功能
 */
export interface Agent {
  /**
   * 获取Agent ID
   * @returns Agent ID
   */
  getId(): string;

  /**
   * 获取Agent版本
   * @returns Agent版本
   */
  getVersion(): string;

  /**
   * 获取Agent状态
   * @param sessionId 会话ID
   * @returns Agent状态
   */
  getState(sessionId?: string): Promise<any>;

  /**
   * 执行Agent请求
   * @param request Agent请求
   * @returns 执行结果
   */
  execute(request: AgentRequest): Promise<AgentResult>;

  /**
   * 流式执行Agent请求
   * @param request Agent请求
   */
  executeStream(request: AgentRequest): AsyncGenerator<AgentResponse>;

  /**
   * 中断Agent执行
   * @param sessionId 会话ID
   */
  interrupt(sessionId: string): Promise<void>;

  /**
   * 重置Agent状态
   * @param sessionId 会话ID
   */
  reset(sessionId: string): Promise<void>;
}

/**
 * Agent工厂配置
 */
export interface AgentFactoryConfig {
  /**
   * Agent ID
   */
  id: string;

  /**
   * Agent版本
   */
  version: string;

  /**
   * 状态管理器类型
   */
  stateManagerType?: 'memory' | 'file';

  /**
   * 基础路径（用于文件状态管理器）
   */
  basePath?: string;

  /**
   * 记忆系统类型
   */
  memoryType?: 'simple' | 'vector';

  /**
   * 执行配置
   */
  executionConfig: {
    /**
     * 默认模型
     */
    defaultModel: string;

    /**
     * API类型
     */
    apiType: string;

    /**
     * 系统提示
     */
    systemPrompt: string;
  };
}

/**
 * Agent配置
 * 扩展工厂配置，包含更多内部设置
 */
export interface AgentConfig extends AgentFactoryConfig {
  // 可以根据需要添加更多Agent配置项
}

/**
 * 代理请求参数
 */
export interface AgentRequest {
  /**
   * 输入文本
   */
  text: string;

  /**
   * 会话ID(可选)
   * 如果未提供，将创建新会话
   */
  sessionId?: string;

  /**
   * 模型名称(可选)
   * 如果未提供，将使用配置的默认模型
   */
  model?: string;

  /**
   * 最大输出token数(可选)
   */
  maxTokens?: number;

  /**
   * 温度参数(0-1)
   */
  temperature?: number;

  /**
   * 是否允许使用缓存
   * 默认为true
   */
  allowCache?: boolean;

  /**
   * 上下文最大消息数量
   * 如果设置，将只保留最近的n条消息用于输入
   */
  maxContextMessages?: number;

  /**
   * 请求超时时间(毫秒)
   */
  timeout?: number;
}

/**
 * Agent响应
 */
export interface AgentResponse {
  /**
   * 响应文本
   */
  text: string;

  /**
   * 使用情况
   */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };

  /**
   * 时间戳
   */
  timestamp: string;
}

/**
 * Agent结果
 */
export interface AgentResult {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 会话ID
   */
  sessionId: string;

  /**
   * 响应（成功时）
   */
  response?: AgentResponse;

  /**
   * 错误信息（失败时）
   */
  error?: string;
}
