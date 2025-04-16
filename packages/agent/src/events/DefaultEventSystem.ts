import { v4 as uuidv4 } from 'uuid';

import type { EventSystem, EventListener } from './EventSystem';
import type { EventType, EventData } from './EventTypes';

/**
 * 注册的事件监听器接口
 */
interface RegisteredEventListener {
  /** 监听器ID */
  id: string;

  /** 事件类型 */
  eventType: EventType;

  /** 监听器回调函数 */
  listener: EventListener;
}

/**
 * 默认事件系统实现
 * 提供事件注册、触发和管理功能
 */
export class DefaultEventSystem implements EventSystem {
  /** 事件监听器映射，按事件类型分组 */
  private listeners: Map<EventType, RegisteredEventListener[]>;

  /** 所有监听器映射，按ID索引 */
  private listenersById: Map<string, RegisteredEventListener>;

  /** 日志标签 */
  private readonly logTag = 'DefaultEventSystem';

  /**
   * 构造函数
   */
  constructor() {
    this.listeners = new Map();
    this.listenersById = new Map();
  }

  /**
   * 注册事件监听器
   * @param eventType 事件类型
   * @param listener 事件监听器
   * @returns 监听器ID
   */
  on(eventType: EventType, listener: EventListener): string {
    const id = uuidv4();

    const registeredListener: RegisteredEventListener = {
      id,
      eventType,
      listener,
    };

    // 添加到类型映射
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(registeredListener);

    // 添加到ID映射
    this.listenersById.set(id, registeredListener);

    return id;
  }

  /**
   * 移除事件监听器
   * @param listenerId 监听器ID
   * @returns 是否成功移除
   */
  off(listenerId: string): boolean {
    const listener = this.listenersById.get(listenerId);

    if (!listener) {
      return false;
    }

    // 从类型映射中移除
    const eventType = listener.eventType;
    const listenersOfType = this.listeners.get(eventType);

    if (listenersOfType) {
      const index = listenersOfType.findIndex(l => l.id === listenerId);

      if (index !== -1) {
        listenersOfType.splice(index, 1);

        // 如果类型没有监听器了，移除整个类型
        if (listenersOfType.length === 0) {
          this.listeners.delete(eventType);
        }
      }
    }

    // 从ID映射中移除
    this.listenersById.delete(listenerId);

    return true;
  }

  /**
   * 触发事件
   * @param eventType 事件类型
   * @param eventData 事件数据
   */
  emit(eventType: EventType, eventData: EventData): void {
    // 确保事件数据包含时间戳
    const data = {
      ...eventData,
      timestamp: eventData.timestamp || Date.now(),
    };

    const listenersOfType = this.listeners.get(eventType) || [];

    // 异步触发所有监听器，捕获并记录错误
    for (const { listener } of listenersOfType) {
      // 使用setTimeout实现异步非阻塞调用
      setTimeout(() => {
        try {
          listener(data);
        } catch (error) {
          console.error(
            `[${this.logTag}] Error in event listener for ${eventType}:`,
            error
          );
        }
      }, 0);
    }
  }

  /**
   * 异步触发事件并等待所有监听器完成
   * @param eventType 事件类型
   * @param eventData 事件数据
   * @returns Promise，所有监听器完成后解析
   */
  async emitAsync(eventType: EventType, eventData: EventData): Promise<void> {
    // 确保事件数据包含时间戳
    const data = {
      ...eventData,
      timestamp: eventData.timestamp || Date.now(),
    };

    const listenersOfType = this.listeners.get(eventType) || [];

    const promises = listenersOfType.map(async ({ listener }) => {
      try {
        // 等待异步监听器完成
        const result = listener(data);

        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        console.error(
          `[${this.logTag}] Error in async event listener for ${eventType}:`,
          error
        );
      }
    });

    await Promise.all(promises);
  }

  /**
   * 检查是否有特定类型的事件监听器
   * @param eventType 事件类型
   * @returns 是否有该类型的监听器
   */
  hasListeners(eventType: EventType): boolean {
    const listenersOfType = this.listeners.get(eventType);

    return !!listenersOfType && listenersOfType.length > 0;
  }

  /**
   * 获取特定类型事件的监听器数量
   * @param eventType 事件类型
   * @returns 监听器数量
   */
  getListenerCount(eventType: EventType): number {
    const listenersOfType = this.listeners.get(eventType);

    return listenersOfType ? listenersOfType.length : 0;
  }

  /**
   * 移除所有事件监听器
   * @param eventType 可选的事件类型，如果提供则只移除该类型的监听器
   */
  removeAllListeners(eventType?: EventType): void {
    if (eventType) {
      // 移除特定类型的所有监听器
      const listenersOfType = this.listeners.get(eventType) || [];

      // 从ID映射中移除
      for (const listener of listenersOfType) {
        this.listenersById.delete(listener.id);
      }

      // 清空类型映射
      this.listeners.delete(eventType);
    } else {
      // 移除所有监听器
      this.listeners.clear();
      this.listenersById.clear();
    }
  }
}
