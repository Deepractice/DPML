/**
 * Agent状态模型定义
 * 定义代理的所有可能状态和状态转换规则
 */

/**
 * 代理状态枚举
 * 表示代理可能处于的各种状态
 */
export enum AgentStatus {
  /** 空闲状态，等待输入 */
  IDLE = 'idle',
  
  /** 思考状态，正在处理输入 */
  THINKING = 'thinking',
  
  /** 执行状态，正在执行任务 */
  EXECUTING = 'executing',
  
  /** 回复状态，正在生成回复 */
  RESPONDING = 'responding',
  
  /** 完成状态，任务已完成 */
  DONE = 'done',
  
  /** 暂停状态，执行被暂停 */
  PAUSED = 'paused',
  
  /** 错误状态，发生错误 */
  ERROR = 'error',
}

/**
 * 代理状态转换规则
 * 定义从一个状态可以转换到哪些状态
 */
export const AGENT_STATE_TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
  [AgentStatus.IDLE]: [AgentStatus.THINKING, AgentStatus.ERROR],
  [AgentStatus.THINKING]: [AgentStatus.EXECUTING, AgentStatus.RESPONDING, AgentStatus.ERROR, AgentStatus.PAUSED],
  [AgentStatus.EXECUTING]: [AgentStatus.THINKING, AgentStatus.RESPONDING, AgentStatus.DONE, AgentStatus.ERROR, AgentStatus.PAUSED],
  [AgentStatus.RESPONDING]: [AgentStatus.DONE, AgentStatus.ERROR, AgentStatus.PAUSED],
  [AgentStatus.DONE]: [AgentStatus.IDLE, AgentStatus.ERROR],
  [AgentStatus.PAUSED]: [AgentStatus.THINKING, AgentStatus.EXECUTING, AgentStatus.RESPONDING, AgentStatus.ERROR],
  [AgentStatus.ERROR]: [AgentStatus.IDLE],
};

/**
 * 代理状态事件类型
 * 表示代理状态变更时触发的事件
 */
export type AgentStateEvent = 
  | 'state:change'  // 状态变更事件
  | 'state:error'   // 状态错误事件
  | 'state:timeout' // 状态超时事件
  | 'state:reset';  // 状态重置事件

/**
 * 代理状态接口
 * 定义代理状态的核心属性和数据结构
 */
export interface AgentState {
  /** 代理唯一标识符 */
  id: string;
  
  /** 当前状态 */
  status: AgentStatus;
  
  /** 会话ID，用于关联多轮对话 */
  sessionId: string;
  
  /** 上次状态更新时间戳 */
  updatedAt: number;
  
  /** 当前状态开始时间戳 */
  statusStartedAt: number;
  
  /** 超时配置（毫秒），0表示无超时 */
  timeoutMs: number;
  
  /** 消息历史记录 */
  messages: AgentMessage[];
  
  /** 状态元数据，用于存储特定状态的额外信息 */
  metadata: Record<string, any>;
}

/**
 * 代理消息接口
 * 表示代理状态中记录的消息
 */
export interface AgentMessage {
  /** 消息ID */
  id: string;
  
  /** 消息角色 */
  role: 'user' | 'assistant' | 'system';
  
  /** 消息内容 */
  content: string;
  
  /** 消息创建时间戳 */
  createdAt: number;
  
  /** 消息元数据 */
  metadata?: Record<string, any>;
}

/**
 * 代理状态变更事件数据
 * 状态变更事件传递的信息
 */
export interface AgentStateChangeEventData {
  /** 代理ID */
  agentId: string;
  
  /** 会话ID */
  sessionId: string;
  
  /** 上一个状态 */
  previousStatus: AgentStatus;
  
  /** 当前状态 */
  currentStatus: AgentStatus;
  
  /** 变更原因 */
  reason?: string;
  
  /** 时间戳 */
  timestamp: number;
}

/**
 * 代理状态错误事件数据
 * 状态错误事件传递的信息
 */
export interface AgentStateErrorEventData {
  /** 代理ID */
  agentId: string;
  
  /** 会话ID */
  sessionId: string;
  
  /** 发生错误的状态 */
  status: AgentStatus;
  
  /** 错误消息 */
  message: string;
  
  /** 错误对象 */
  error: Error;
  
  /** 时间戳 */
  timestamp: number;
}

/**
 * 代理状态超时事件数据
 * 状态超时事件传递的信息
 */
export interface AgentStateTimeoutEventData {
  /** 代理ID */
  agentId: string;
  
  /** 会话ID */
  sessionId: string;
  
  /** 超时的状态 */
  status: AgentStatus;
  
  /** 状态开始时间 */
  startedAt: number;
  
  /** 超时配置（毫秒） */
  timeoutMs: number;
  
  /** 时间戳 */
  timestamp: number;
} 