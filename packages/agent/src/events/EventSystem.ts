import { EventType, EventData } from './EventTypes';

/**
 * 事件监听器类型
 * 事件监听函数类型定义
 */
export type EventListener = (eventData: any) => void | Promise<void>;

/**
 * 代理事件系统接口
 * 定义事件系统的核心功能
 */
export interface EventSystem {
  /**
   * 注册事件监听器
   * @param eventType 事件类型
   * @param listener 事件监听器
   * @returns 监听器ID，用于后续移除
   */
  on(eventType: EventType, listener: EventListener): string;
  
  /**
   * 移除事件监听器
   * @param listenerId 监听器ID
   * @returns 是否成功移除
   */
  off(listenerId: string): boolean;
  
  /**
   * 触发事件
   * @param eventType 事件类型
   * @param eventData 事件数据
   */
  emit(eventType: EventType, eventData: EventData): void;
  
  /**
   * 异步触发事件并等待所有监听器完成
   * @param eventType 事件类型
   * @param eventData 事件数据
   * @returns Promise，所有监听器完成后解析
   */
  emitAsync(eventType: EventType, eventData: EventData): Promise<void>;
  
  /**
   * 检查是否有特定类型的事件监听器
   * @param eventType 事件类型
   * @returns 是否有该类型的监听器
   */
  hasListeners(eventType: EventType): boolean;
  
  /**
   * 获取特定类型事件的监听器数量
   * @param eventType 事件类型
   * @returns 监听器数量
   */
  getListenerCount(eventType: EventType): number;
  
  /**
   * 移除所有事件监听器
   * @param eventType 可选的事件类型，如果提供则只移除该类型的监听器
   */
  removeAllListeners(eventType?: EventType): void;
} 