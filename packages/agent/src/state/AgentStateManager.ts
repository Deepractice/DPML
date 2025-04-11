import { AgentState, AgentStatus, AgentStateEvent } from './AgentState';

/**
 * 代理状态管理器选项
 */
export interface AgentStateManagerOptions {
  /** 代理ID */
  agentId: string;
  
  /** 默认超时时间（毫秒），0表示无超时 */
  defaultTimeoutMs?: number;
  
  /** 是否启用状态事件 */
  enableEvents?: boolean;
  
  /** 是否自动检测超时 */
  detectTimeouts?: boolean;
  
  /** 超时检测间隔（毫秒） */
  timeoutCheckIntervalMs?: number;
}

/**
 * 代理状态管理器接口
 * 定义代理状态管理的核心功能
 */
export interface AgentStateManager {
  /**
   * 初始化状态管理器
   * @returns 初始化是否成功
   */
  initialize(): Promise<boolean>;
  
  /**
   * 创建新的会话状态
   * @param sessionId 会话ID
   * @param initialState 可选的初始状态覆盖
   * @returns 创建的状态对象
   */
  createSession(sessionId: string, initialState?: Partial<AgentState>): Promise<AgentState>;
  
  /**
   * 获取特定会话的状态
   * @param sessionId 会话ID
   * @returns 状态对象，如果不存在则返回null
   */
  getState(sessionId: string): Promise<AgentState | null>;
  
  /**
   * 更新会话状态
   * @param sessionId 会话ID
   * @param updates 状态更新
   * @returns 更新后的状态对象
   * @throws 如果会话不存在或状态转换无效，将抛出错误
   */
  updateState(sessionId: string, updates: Partial<AgentState>): Promise<AgentState>;
  
  /**
   * 转换会话状态
   * @param sessionId 会话ID
   * @param newStatus 新状态
   * @param reason 可选的状态转换原因
   * @returns 更新后的状态对象
   * @throws 如果状态转换无效，将抛出错误
   */
  transitionState(sessionId: string, newStatus: AgentStatus, reason?: string): Promise<AgentState>;
  
  /**
   * 重置会话状态
   * @param sessionId 会话ID
   * @returns 重置后的状态对象
   * @throws 如果会话不存在，将抛出错误
   */
  resetState(sessionId: string): Promise<AgentState>;
  
  /**
   * 删除会话状态
   * @param sessionId 会话ID
   * @returns 删除是否成功
   */
  deleteSession(sessionId: string): Promise<boolean>;
  
  /**
   * 获取所有会话ID
   * @returns 会话ID数组
   */
  getAllSessionIds(): Promise<string[]>;
  
  /**
   * 检查会话是否存在
   * @param sessionId 会话ID
   * @returns 会话是否存在
   */
  hasSession(sessionId: string): Promise<boolean>;
  
  /**
   * 序列化会话状态
   * @param sessionId 会话ID
   * @returns 序列化后的状态字符串
   * @throws 如果会话不存在，将抛出错误
   */
  serializeState(sessionId: string): Promise<string>;
  
  /**
   * 从序列化字符串恢复会话状态
   * @param sessionId 会话ID
   * @param serializedState 序列化状态字符串
   * @returns 恢复的状态对象
   */
  deserializeState(sessionId: string, serializedState: string): Promise<AgentState>;
  
  /**
   * 验证状态转换是否有效
   * @param currentStatus 当前状态
   * @param newStatus 新状态
   * @returns 转换是否有效
   */
  isValidTransition(currentStatus: AgentStatus, newStatus: AgentStatus): boolean;
  
  /**
   * 添加状态事件监听器
   * @param event 事件类型
   * @param listener 事件监听器
   * @returns 监听器ID，用于移除监听器
   */
  on(event: AgentStateEvent, listener: (...args: any[]) => void): string;
  
  /**
   * 移除状态事件监听器
   * @param listenerId 监听器ID
   * @returns 移除是否成功
   */
  off(listenerId: string): boolean;
  
  /**
   * 检查状态是否超时
   * @param sessionId 会话ID
   * @returns 状态是否超时
   */
  checkTimeout(sessionId: string): Promise<boolean>;
  
  /**
   * 启动超时检测
   * @returns 启动是否成功
   */
  startTimeoutDetection(): boolean;
  
  /**
   * 停止超时检测
   * @returns 停止是否成功
   */
  stopTimeoutDetection(): boolean;
} 