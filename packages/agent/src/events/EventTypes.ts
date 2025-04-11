/**
 * 代理事件类型枚举
 * 定义系统中所有可能的事件类型
 */
export enum EventType {
  // 生命周期事件
  /** 代理初始化开始 */
  AGENT_INITIALIZING = 'agent:initializing',
  
  /** 代理初始化完成 */
  AGENT_INITIALIZED = 'agent:initialized',
  
  /** 聊天开始 */
  CHAT_STARTED = 'chat:started',
  
  /** 聊天完成 */
  CHAT_COMPLETED = 'chat:completed',
  
  /** 会话创建 */
  SESSION_CREATED = 'session:created',
  
  /** 会话删除 */
  SESSION_DELETED = 'session:deleted',
  
  // 处理阶段事件
  /** 提示词构建开始 */
  PROMPT_BUILDING = 'prompt:building',
  
  /** 提示词构建完成 */
  PROMPT_BUILT = 'prompt:built',
  
  /** LLM请求开始 */
  LLM_REQUEST_STARTED = 'llm:request:started',
  
  /** LLM请求完成 */
  LLM_REQUEST_COMPLETED = 'llm:request:completed',
  
  /** LLM流式响应块 */
  LLM_RESPONSE_CHUNK = 'llm:response:chunk',
  
  // 状态事件
  /** 状态变更 */
  STATE_CHANGED = 'state:changed',
  
  /** 状态错误 */
  STATE_ERROR = 'state:error',
  
  /** 状态超时 */
  STATE_TIMEOUT = 'state:timeout',
  
  // 错误事件
  /** 一般错误 */
  ERROR_OCCURRED = 'error:occurred',
  
  /** LLM错误 */
  LLM_ERROR = 'llm:error',
  
  /** 内存错误 */
  MEMORY_ERROR = 'memory:error',
  
  // 记忆事件
  /** 记忆项添加 */
  MEMORY_ITEM_ADDED = 'memory:item:added',
  
  /** 记忆清理 */
  MEMORY_CLEARED = 'memory:cleared'
}

/**
 * 事件数据基础接口
 */
export interface EventData {
  /** 时间戳 */
  timestamp?: number;
  
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 代理事件数据接口
 */
export interface AgentEventData extends EventData {
  /** 代理ID */
  agentId: string;
}

/**
 * 会话事件数据接口
 */
export interface SessionEventData extends AgentEventData {
  /** 会话ID */
  sessionId: string;
}

/**
 * 错误事件数据接口
 */
export interface ErrorEventData extends SessionEventData {
  /** 错误消息 */
  message: string;
  
  /** 错误对象 */
  error: Error;
  
  /** 错误代码 */
  code?: string;
} 