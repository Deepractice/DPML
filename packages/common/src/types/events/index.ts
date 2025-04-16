/**
 * 事件相关类型定义
 *
 * 提供强类型的事件处理和发布订阅模式支持。
 */

/**
 * 事件监听器函数
 */
export type EventListener<T = any> = (event: T) => void | Promise<void>;

/**
 * 基础事件接口
 */
export interface Event {
  /** 事件类型 */
  type: string;
  /** 事件来源 */
  source?: any;
  /** 事件时间戳 */
  timestamp?: number;
}

/**
 * 可取消的事件接口
 */
export interface CancellableEvent extends Event {
  /** 取消事件 */
  cancel(): void;
  /** 事件是否已取消 */
  isCancelled(): boolean;
}

/**
 * 事件优先级
 */
export enum EventPriority {
  /** 最高优先级 */
  HIGHEST = 100,
  /** 高优先级 */
  HIGH = 75,
  /** 正常优先级 */
  NORMAL = 50,
  /** 低优先级 */
  LOW = 25,
  /** 最低优先级 */
  LOWEST = 0,
}

/**
 * 事件监听器选项
 */
export interface EventListenerOptions {
  /** 优先级 */
  priority?: EventPriority;
  /** 仅执行一次 */
  once?: boolean;
  /** 监听器上下文 */
  context?: any;
}

/**
 * 事件过滤器
 */
export interface EventFilter<T extends Event> {
  /**
   * 过滤事件
   * @param event 事件对象
   * @returns 是否接受事件
   */
  filter(event: T): boolean;
}

/**
 * 事件总线接口
 */
export interface EventBus {
  /**
   * 注册事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   * @param options 选项
   * @returns 监听器ID
   */
  on<T extends Event>(
    type: string,
    listener: EventListener<T>,
    options?: EventListenerOptions
  ): string;

  /**
   * 注册一次性事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   * @param options 选项
   * @returns 监听器ID
   */
  once<T extends Event>(
    type: string,
    listener: EventListener<T>,
    options?: Omit<EventListenerOptions, 'once'>
  ): string;

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listenerOrId 监听器函数或ID
   * @returns 是否成功移除
   */
  off(type: string, listenerOrId: EventListener | string): boolean;

  /**
   * 移除所有监听器
   * @param type 事件类型（可选，不提供则移除所有类型）
   */
  removeAllListeners(type?: string): void;

  /**
   * 发布事件
   * @param event 事件对象
   * @returns 如果是异步监听器，返回所有完成的Promise
   */
  emit<T extends Event>(event: T): Promise<void>;

  /**
   * 发布事件（同步版本）
   * @param event 事件对象
   */
  emitSync<T extends Event>(event: T): void;

  /**
   * 检查是否有监听器
   * @param type 事件类型
   * @returns 是否有监听器
   */
  hasListeners(type: string): boolean;

  /**
   * 获取监听器数量
   * @param type 事件类型（可选）
   * @returns 监听器数量
   */
  listenerCount(type?: string): number;
}

/**
 * 事件发布者接口
 */
export interface EventPublisher {
  /**
   * 发布事件
   * @param event 事件对象
   */
  publish<T extends Event>(event: T): Promise<void>;

  /**
   * 同步发布事件
   * @param event 事件对象
   */
  publishSync<T extends Event>(event: T): void;
}

/**
 * 事件订阅者接口
 */
export interface EventSubscriber {
  /**
   * 订阅事件
   * @param type 事件类型
   * @param listener 监听器函数
   * @param options 选项
   * @returns 订阅ID
   */
  subscribe<T extends Event>(
    type: string,
    listener: EventListener<T>,
    options?: EventListenerOptions
  ): string;

  /**
   * 取消订阅
   * @param subscriptionId 订阅ID
   */
  unsubscribe(subscriptionId: string): boolean;
}

/**
 * 事件处理器接口
 */
export interface EventHandler<T extends Event> {
  /**
   * 处理事件
   * @param event 事件对象
   */
  handle(event: T): void | Promise<void>;
}

/**
 * 强类型事件映射
 *
 * 用于创建具有特定事件类型的事件总线
 *
 * @example
 * ```typescript
 * interface MyEvents {
 *   'user:login': UserLoginEvent;
 *   'user:logout': UserLogoutEvent;
 * }
 *
 * const bus = createTypedEventBus<MyEvents>();
 * bus.on('user:login', (event) => {
 *   // event 类型为 UserLoginEvent
 * });
 * ```
 */
export interface TypedEventMap {
  [eventType: string]: Event;
}

/**
 * 强类型事件总线
 */
export interface TypedEventBus<T extends TypedEventMap> {
  /**
   * 注册事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   * @param options 选项
   * @returns 监听器ID
   */
  on<K extends keyof T>(
    type: K,
    listener: EventListener<T[K]>,
    options?: EventListenerOptions
  ): string;

  /**
   * 注册一次性事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   * @param options 选项
   * @returns 监听器ID
   */
  once<K extends keyof T>(
    type: K,
    listener: EventListener<T[K]>,
    options?: Omit<EventListenerOptions, 'once'>
  ): string;

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listenerOrId 监听器函数或ID
   * @returns 是否成功移除
   */
  off<K extends keyof T>(
    type: K,
    listenerOrId: EventListener<T[K]> | string
  ): boolean;

  /**
   * 移除所有监听器
   * @param type 事件类型（可选，不提供则移除所有类型）
   */
  removeAllListeners<K extends keyof T>(type?: K): void;

  /**
   * 发布事件
   * @param type 事件类型
   * @param event 事件对象
   * @returns 如果是异步监听器，返回所有完成的Promise
   */
  emit<K extends keyof T>(type: K, event: T[K]): Promise<void>;

  /**
   * 发布事件（同步版本）
   * @param type 事件类型
   * @param event 事件对象
   */
  emitSync<K extends keyof T>(type: K, event: T[K]): void;

  /**
   * 检查是否有监听器
   * @param type 事件类型
   * @returns 是否有监听器
   */
  hasListeners<K extends keyof T>(type: K): boolean;

  /**
   * 获取监听器数量
   * @param type 事件类型（可选）
   * @returns 监听器数量
   */
  listenerCount<K extends keyof T>(type?: K): number;
}

/**
 * 事件订阅
 */
export interface EventSubscription {
  /** 订阅ID */
  id: string;
  /** 事件类型 */
  type: string;
  /** 监听器函数 */
  listener: EventListener;
  /** 选项 */
  options: EventListenerOptions;
  /** 取消订阅 */
  unsubscribe(): void;
}
