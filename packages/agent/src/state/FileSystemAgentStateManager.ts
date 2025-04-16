import * as fs from 'fs';
import * as path from 'path';

import { v4 as uuidv4 } from 'uuid';

import { EventType, getGlobalEventSystem } from '../events';

import {
  AgentStatus,
  AgentStateErrorEventData,
  AGENT_STATE_TRANSITIONS,
} from './AgentState';

import type {
  AgentState,
  AgentStateEvent,
  AgentStateChangeEventData,
  AgentStateTimeoutEventData,
} from './AgentState';
import type {
  AgentStateManager,
  AgentStateManagerOptions,
} from './AgentStateManager';
import type { EventSystem, SessionEventData } from '../events';

/**
 * 文件系统存储选项
 */
export interface FileSystemAgentStateManagerOptions
  extends AgentStateManagerOptions {
  /** 状态文件存储目录 */
  storageDir: string;

  /** 是否自动创建存储目录 */
  createIfNotExists?: boolean;

  /** 状态文件扩展名 */
  fileExtension?: string;
}

/**
 * 事件监听器接口
 */
interface EventListener {
  /** 监听器ID */
  id: string;

  /** 事件类型 */
  event: AgentStateEvent;

  /** 回调函数 */
  callback: (...args: any[]) => void;
}

/**
 * 基于文件系统的代理状态管理器实现
 * 状态数据保存到文件系统中，适用于需要持久化的应用
 */
export class FileSystemAgentStateManager implements AgentStateManager {
  /** 代理ID */
  private agentId: string;

  /** 默认超时时间（毫秒） */
  private defaultTimeoutMs: number;

  /** 是否启用事件 */
  private enableEvents: boolean;

  /** 是否检测超时 */
  private detectTimeouts: boolean;

  /** 超时检测间隔（毫秒） */
  private timeoutCheckIntervalMs: number;

  /** 状态文件存储目录 */
  private storageDir: string;

  /** 状态文件扩展名 */
  private fileExtension: string;

  /** 状态缓存（内存中的副本，提高性能） */
  private stateCache: Map<string, AgentState>;

  /** 事件监听器列表 */
  private eventListeners: EventListener[];

  /** 超时检测定时器ID */
  private timeoutDetectionInterval: NodeJS.Timeout | null;

  /** 事件系统 */
  private eventSystem: EventSystem;

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: FileSystemAgentStateManagerOptions) {
    this.agentId = options.agentId;
    this.defaultTimeoutMs = options.defaultTimeoutMs || 0; // 默认无超时
    this.enableEvents = options.enableEvents !== false; // 默认启用事件
    this.detectTimeouts = options.detectTimeouts !== false; // 默认检测超时
    this.timeoutCheckIntervalMs = options.timeoutCheckIntervalMs || 5000; // 默认5秒检测一次

    this.storageDir = options.storageDir;
    this.fileExtension = options.fileExtension || '.state.json';

    this.stateCache = new Map<string, AgentState>();
    this.eventListeners = [];
    this.timeoutDetectionInterval = null;

    // 获取事件系统
    this.eventSystem = options.eventSystem || getGlobalEventSystem();

    // 创建存储目录（如果需要）
    if (
      options.createIfNotExists !== false &&
      !fs.existsSync(this.storageDir)
    ) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * 初始化状态管理器
   * @returns 初始化成功
   */
  async initialize(): Promise<boolean> {
    // 确保存储目录存在
    if (!fs.existsSync(this.storageDir)) {
      throw new Error(`Storage directory does not exist: ${this.storageDir}`);
    }

    // 预加载所有状态文件到缓存（可选的优化）
    try {
      const files = fs.readdirSync(this.storageDir);
      const stateFiles = files.filter(file =>
        file.endsWith(this.fileExtension)
      );

      for (const file of stateFiles) {
        const sessionId = path.basename(file, this.fileExtension);

        try {
          const state = await this.loadStateFromFile(sessionId);

          if (state) {
            this.stateCache.set(sessionId, state);
          }
        } catch (error) {
          console.warn(`Failed to load state for session ${sessionId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize file system state manager:', error);

      return false;
    }

    // 启动超时检测（如果需要）
    if (this.detectTimeouts) {
      this.startTimeoutDetection();
    }

    return true;
  }

  /**
   * 创建新的会话状态
   * @param sessionId 会话ID
   * @param initialState 可选的初始状态覆盖
   * @returns 创建的状态对象
   */
  async createSession(
    sessionId: string,
    initialState?: Partial<AgentState>
  ): Promise<AgentState> {
    // 创建默认状态
    const defaultState: AgentState = {
      id: uuidv4(),
      status: AgentStatus.IDLE,
      sessionId,
      updatedAt: Date.now(),
      statusStartedAt: Date.now(),
      timeoutMs: this.defaultTimeoutMs,
      messages: [],
      metadata: {},
    };

    // 合并初始状态覆盖
    const state = { ...defaultState, ...initialState };

    // 更新缓存
    this.stateCache.set(sessionId, state);

    // 保存到文件
    await this.saveStateToFile(sessionId, state);

    // 触发状态创建事件
    this.emitEvent('state:change', {
      agentId: this.agentId,
      sessionId,
      previousStatus: state.status, // 新创建的状态，前后状态相同
      currentStatus: state.status,
      reason: 'session_created',
      timestamp: Date.now(),
    } as AgentStateChangeEventData);

    return state;
  }

  /**
   * 获取特定会话的状态
   * @param sessionId 会话ID
   * @returns 状态对象，如果不存在则返回null
   */
  async getState(sessionId: string): Promise<AgentState | null> {
    // 尝试从缓存获取
    const cachedState = this.stateCache.get(sessionId);

    if (cachedState) {
      return cachedState;
    }

    // 尝试从文件加载
    try {
      const state = await this.loadStateFromFile(sessionId);

      if (state) {
        // 更新缓存
        this.stateCache.set(sessionId, state);

        return state;
      }
    } catch (error) {
      console.error(`Failed to load state for session ${sessionId}:`, error);
    }

    return null;
  }

  /**
   * 更新会话状态
   * @param sessionId 会话ID
   * @param updates 状态更新
   * @returns 更新后的状态对象
   * @throws 如果会话不存在，将抛出错误
   */
  async updateState(
    sessionId: string,
    updates: Partial<AgentState>
  ): Promise<AgentState> {
    const currentState = await this.getState(sessionId);

    if (!currentState) {
      throw new Error(`Session ${sessionId} does not exist`);
    }

    // 检查状态转换，只记录非标准转换但不阻止
    if (updates.status && updates.status !== currentState.status) {
      if (!this.isValidTransition(currentState.status, updates.status)) {
        // 记录警告但不抛出错误
        console.warn(
          `警告: 状态转换 ${currentState.status} -> ${updates.status} 不符合标准规则（SessionId: ${sessionId}）`
        );

        // 发送非标准转换事件
        this.eventSystem.emit(EventType.STATE_CHANGED, {
          agentId: this.agentId,
          sessionId,
          previousStatus: currentState.status,
          currentStatus: updates.status,
          nonStandard: true,
          reason: 'non-standard-transition',
          timestamp: Date.now(),
        } as SessionEventData);
      }
    }

    // 更新状态
    const updatedState: AgentState = {
      ...currentState,
      ...updates,
      updatedAt: Date.now(),
    };

    // 如果状态发生变化，更新状态开始时间
    if (updates.status && updates.status !== currentState.status) {
      updatedState.statusStartedAt = Date.now();

      // 触发状态变更事件
      this.emitEvent('state:change', {
        agentId: this.agentId,
        sessionId,
        previousStatus: currentState.status,
        currentStatus: updatedState.status,
        reason: updates.metadata?.stateChangeReason || 'update',
        timestamp: Date.now(),
      } as AgentStateChangeEventData);
    }

    // 更新缓存
    this.stateCache.set(sessionId, updatedState);

    // 保存到文件
    await this.saveStateToFile(sessionId, updatedState);

    return updatedState;
  }

  /**
   * 转换会话状态
   * @param sessionId 会话ID
   * @param newStatus 新状态
   * @param reason 可选的状态转换原因
   * @returns 更新后的状态对象
   * @throws 如果会话不存在，将抛出错误
   */
  async transitionState(
    sessionId: string,
    newStatus: AgentStatus,
    reason?: string
  ): Promise<AgentState> {
    const currentState = await this.getState(sessionId);

    if (!currentState) {
      throw new Error(`Session ${sessionId} does not exist`);
    }

    // 检查状态转换，只记录非标准转换但不阻止
    if (!this.isValidTransition(currentState.status, newStatus)) {
      // 记录警告但不抛出错误
      console.warn(
        `警告: 状态转换 ${currentState.status} -> ${newStatus} 不符合标准规则（SessionId: ${sessionId}）`
      );

      // 发送非标准转换事件
      this.eventSystem.emit(EventType.STATE_CHANGED, {
        agentId: this.agentId,
        sessionId,
        previousStatus: currentState.status,
        currentStatus: newStatus,
        nonStandard: true,
        reason: 'non-standard-transition',
        timestamp: Date.now(),
      } as SessionEventData);
    }

    // 更新状态
    const updatedState: AgentState = {
      ...currentState,
      status: newStatus,
      updatedAt: Date.now(),
      statusStartedAt: Date.now(),
      metadata: {
        ...currentState.metadata,
        stateChangeReason: reason || 'transition',
      },
    };

    // 更新缓存
    this.stateCache.set(sessionId, updatedState);

    // 保存到文件
    await this.saveStateToFile(sessionId, updatedState);

    // 触发状态变更事件
    this.emitEvent('state:change', {
      agentId: this.agentId,
      sessionId,
      previousStatus: currentState.status,
      currentStatus: newStatus,
      reason: reason || 'transition',
      timestamp: Date.now(),
    } as AgentStateChangeEventData);

    return updatedState;
  }

  /**
   * 重置会话状态
   * @param sessionId 会话ID
   * @returns 重置后的状态对象
   * @throws 如果会话不存在，将抛出错误
   */
  async resetState(sessionId: string): Promise<AgentState> {
    const currentState = await this.getState(sessionId);

    if (!currentState) {
      throw new Error(`Session ${sessionId} does not exist`);
    }

    // 创建重置后的状态
    const resetState: AgentState = {
      ...currentState,
      status: AgentStatus.IDLE,
      updatedAt: Date.now(),
      statusStartedAt: Date.now(),
      metadata: {
        ...currentState.metadata,
        stateChangeReason: 'reset',
      },
    };

    // 更新缓存
    this.stateCache.set(sessionId, resetState);

    // 保存到文件
    await this.saveStateToFile(sessionId, resetState);

    // 触发状态重置事件
    this.emitEvent('state:reset', {
      agentId: this.agentId,
      sessionId,
      previousStatus: currentState.status,
      currentStatus: AgentStatus.IDLE,
      reason: 'reset',
      timestamp: Date.now(),
    } as AgentStateChangeEventData);

    return resetState;
  }

  /**
   * 删除会话状态
   * @param sessionId 会话ID
   * @returns 删除是否成功
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    // 从缓存移除
    this.stateCache.delete(sessionId);

    // 从文件系统删除
    try {
      const filePath = this.getStateFilePath(sessionId);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);

        return true;
      }
    } catch (error) {
      console.error(
        `Failed to delete state file for session ${sessionId}:`,
        error
      );

      return false;
    }

    return false;
  }

  /**
   * 获取所有会话ID
   * @returns 会话ID数组
   */
  async getAllSessionIds(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.storageDir);

      return files
        .filter(file => file.endsWith(this.fileExtension))
        .map(file => path.basename(file, this.fileExtension));
    } catch (error) {
      console.error('Failed to read storage directory:', error);

      return [];
    }
  }

  /**
   * 检查会话是否存在
   * @param sessionId 会话ID
   * @returns 会话是否存在
   */
  async hasSession(sessionId: string): Promise<boolean> {
    // 检查缓存
    if (this.stateCache.has(sessionId)) {
      return true;
    }

    // 检查文件系统
    const filePath = this.getStateFilePath(sessionId);

    return fs.existsSync(filePath);
  }

  /**
   * 序列化会话状态
   * @param sessionId 会话ID
   * @returns 序列化后的状态字符串
   * @throws 如果会话不存在，将抛出错误
   */
  async serializeState(sessionId: string): Promise<string> {
    const state = await this.getState(sessionId);

    if (!state) {
      throw new Error(`Session ${sessionId} does not exist`);
    }

    return JSON.stringify(state);
  }

  /**
   * 从序列化字符串恢复会话状态
   * @param sessionId 会话ID
   * @param serializedState 序列化状态字符串
   * @returns 恢复的状态对象
   */
  async deserializeState(
    sessionId: string,
    serializedState: string
  ): Promise<AgentState> {
    try {
      const state = JSON.parse(serializedState) as AgentState;

      // 更新缓存
      this.stateCache.set(sessionId, state);

      // 保存到文件
      await this.saveStateToFile(sessionId, state);

      return state;
    } catch (error) {
      throw new Error(
        `Failed to deserialize state: ${(error as Error).message}`
      );
    }
  }

  /**
   * 验证状态转换是否有效
   * @param currentStatus 当前状态
   * @param newStatus 新状态
   * @returns 转换是否有效
   */
  isValidTransition(
    currentStatus: AgentStatus,
    newStatus: AgentStatus
  ): boolean {
    const allowedTransitions = AGENT_STATE_TRANSITIONS[currentStatus];

    return allowedTransitions.includes(newStatus);
  }

  /**
   * 添加状态事件监听器
   * @param event 事件类型
   * @param listener 事件监听器
   * @returns 监听器ID，用于移除监听器
   */
  on(event: AgentStateEvent, listener: (...args: any[]) => void): string {
    const id = uuidv4();

    this.eventListeners.push({
      id,
      event,
      callback: listener,
    });

    return id;
  }

  /**
   * 移除状态事件监听器
   * @param listenerId 监听器ID
   * @returns 移除是否成功
   */
  off(listenerId: string): boolean {
    const initialLength = this.eventListeners.length;

    this.eventListeners = this.eventListeners.filter(
      listener => listener.id !== listenerId
    );

    return initialLength !== this.eventListeners.length;
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  private emitEvent(event: AgentStateEvent, data: any): void {
    if (!this.enableEvents) {
      return;
    }

    // 查找对应事件的监听器
    const listeners = this.eventListeners.filter(
      listener => listener.event === event
    );

    // 异步触发所有监听器
    setTimeout(() => {
      for (const listener of listeners) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      }
    }, 0);
  }

  /**
   * 检查状态是否超时
   * @param sessionId 会话ID
   * @returns 状态是否超时
   */
  async checkTimeout(sessionId: string): Promise<boolean> {
    const state = await this.getState(sessionId);

    if (!state || state.timeoutMs <= 0) {
      return false; // 无超时配置
    }

    const now = Date.now();
    const elapsed = now - state.statusStartedAt;

    if (elapsed >= state.timeoutMs) {
      // 状态已超时，触发超时事件
      this.emitEvent('state:timeout', {
        agentId: this.agentId,
        sessionId,
        status: state.status,
        startedAt: state.statusStartedAt,
        timeoutMs: state.timeoutMs,
        timestamp: now,
      } as AgentStateTimeoutEventData);

      // 如果状态不是IDLE或ERROR，转换为ERROR状态
      if (
        state.status !== AgentStatus.IDLE &&
        state.status !== AgentStatus.ERROR
      ) {
        try {
          await this.transitionState(sessionId, AgentStatus.ERROR, 'timeout');
        } catch (error) {
          console.error(
            `Failed to transition state to ERROR on timeout:`,
            error
          );
        }
      }

      return true;
    }

    return false;
  }

  /**
   * 启动超时检测
   * @returns 启动是否成功
   */
  startTimeoutDetection(): boolean {
    if (this.timeoutDetectionInterval !== null) {
      return false; // 已经启动
    }

    this.timeoutDetectionInterval = setInterval(async () => {
      try {
        const sessionIds = await this.getAllSessionIds();

        for (const sessionId of sessionIds) {
          try {
            await this.checkTimeout(sessionId);
          } catch (error) {
            console.error(
              `Error checking timeout for session ${sessionId}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error('Error in timeout detection interval:', error);
      }
    }, this.timeoutCheckIntervalMs);

    return true;
  }

  /**
   * 停止超时检测
   * @returns 停止是否成功
   */
  stopTimeoutDetection(): boolean {
    if (this.timeoutDetectionInterval === null) {
      return false; // 已经停止
    }

    clearInterval(this.timeoutDetectionInterval);
    this.timeoutDetectionInterval = null;

    return true;
  }

  /**
   * 获取状态文件路径
   * @param sessionId 会话ID
   * @returns 文件路径
   */
  private getStateFilePath(sessionId: string): string {
    // 防止路径注入
    const safeSessionId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');

    return path.join(this.storageDir, `${safeSessionId}${this.fileExtension}`);
  }

  /**
   * 保存状态到文件
   * @param sessionId 会话ID
   * @param state 状态对象
   */
  private async saveStateToFile(
    sessionId: string,
    state: AgentState
  ): Promise<void> {
    const filePath = this.getStateFilePath(sessionId);

    try {
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(state, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new Error(`Failed to save state file: ${(error as Error).message}`);
    }
  }

  /**
   * 从文件加载状态
   * @param sessionId 会话ID
   * @returns 状态对象，如果文件不存在则返回null
   */
  private async loadStateFromFile(
    sessionId: string
  ): Promise<AgentState | null> {
    const filePath = this.getStateFilePath(sessionId);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');

      return JSON.parse(fileContent) as AgentState;
    } catch (error) {
      throw new Error(`Failed to load state file: ${(error as Error).message}`);
    }
  }
}
