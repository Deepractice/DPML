/**
 * @dpml/agent 事件系统
 * 提供代理事件注册、触发和管理功能
 */

// 导出事件类型和数据接口
import { EventType } from './EventTypes';
import type {
  EventData,
  AgentEventData,
  SessionEventData,
  ErrorEventData
} from './EventTypes';

export { EventType };
export type {
  EventData,
  AgentEventData,
  SessionEventData,
  ErrorEventData
};

// 导出事件系统接口和监听器类型
import type { EventSystem, EventListener } from './EventSystem';

export type { EventSystem, EventListener };

// 导出默认事件系统实现
import { DefaultEventSystem } from './DefaultEventSystem';
export { DefaultEventSystem };

// 便捷函数：创建一个新的事件系统实例
export function createEventSystem(): EventSystem {
  return new DefaultEventSystem();
}

// 全局事件系统单例
let globalEventSystem: EventSystem | null = null;

/**
 * 获取全局事件系统单例
 * 如果不存在会自动创建一个
 * @returns 全局事件系统实例
 */
export function getGlobalEventSystem(): EventSystem {
  if (!globalEventSystem) {
    globalEventSystem = createEventSystem();
  }
  return globalEventSystem;
}

/**
 * 重置全局事件系统
 * 主要用于测试场景
 */
export function resetGlobalEventSystem(): void {
  if (globalEventSystem) {
    globalEventSystem.removeAllListeners();
    globalEventSystem = null;
  }
}