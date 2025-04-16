import { randomUuid } from '../factories';

/**
 * 等待指定时间
 *
 * @param ms 毫秒数
 * @returns Promise
 */
export function wait(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * 等待条件满足
 *
 * @param condition 条件函数
 * @param options 配置选项
 * @returns Promise
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options: {
    timeout?: number;
    interval?: number;
    message?: string;
  } = {}
): Promise<void> {
  const start = Date.now();
  const timeout = options.timeout ?? 5000;
  const interval = options.interval ?? 100;
  const message = options.message ?? '等待条件超时';

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }

    await wait(interval);
  }

  throw new Error(message);
}

/**
 * 重试函数
 *
 * @param fn 要重试的函数
 * @param options 配置选项
 * @returns 函数结果
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelay = options.delay ?? 300;
  const backoff = options.backoff ?? true;
  const shouldRetry = options.shouldRetry ?? (() => true);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (!shouldRetry(lastError) || attempt === maxRetries - 1) {
        throw lastError;
      }

      const delay = backoff
        ? initialDelay * Math.pow(2, attempt)
        : initialDelay;

      await wait(delay);
    }
  }

  // 这段代码不应该被执行到，但TypeScript需要有返回值
  throw lastError;
}

/**
 * 创建一个防抖函数
 *
 * @param fn 要防抖的函数
 * @param delay 延迟时间
 * @returns 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * 创建一个节流函数
 *
 * @param fn 要节流的函数
 * @param limit 时间限制
 * @returns 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const now = Date.now();

    if (now - lastCall >= limit) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      lastCall = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(
        () => {
          lastCall = Date.now();
          timeoutId = null;
          fn.apply(this, args);
        },
        limit - (now - lastCall)
      );
    }
  };
}

/**
 * 创建一个带有上下文的测试辅助工具
 *
 * @returns 测试上下文
 */
export function createTestContext<
  T extends Record<string, any> = Record<string, any>,
>() {
  const context: T = {} as T;
  const cleanupFns: Array<() => void | Promise<void>> = [];

  return {
    /**
     * 获取上下文
     */
    getContext(): T {
      return context;
    },

    /**
     * 设置上下文值
     *
     * @param key 键
     * @param value 值
     */
    set<K extends keyof T>(key: K, value: T[K]): void {
      context[key] = value;
    },

    /**
     * 获取上下文值
     *
     * @param key 键
     * @returns 值
     */
    get<K extends keyof T>(key: K): T[K] {
      return context[key];
    },

    /**
     * 添加清理函数
     *
     * @param fn 清理函数
     */
    addCleanup(fn: () => void | Promise<void>): void {
      cleanupFns.push(fn);
    },

    /**
     * 清理上下文
     */
    async cleanup(): Promise<void> {
      for (const fn of cleanupFns.reverse()) {
        await fn();
      }

      cleanupFns.length = 0;

      // 清空上下文对象
      Object.keys(context).forEach(key => {
        delete context[key as keyof T];
      });
    },
  };
}

/**
 * 测量函数执行时间
 *
 * @param fn 要测量的函数
 * @returns 执行结果和时间
 */
export async function measureTime<T>(
  fn: () => Promise<T> | T
): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;

  return { result, time };
}

/**
 * 创建一个沙盒环境
 *
 * @param props 初始属性
 * @returns 沙盒对象
 */
export function createSandbox<T extends Record<string, any>>(
  props: T = {} as T
) {
  const id = randomUuid()();
  const sandbox = { ...props, id };

  return {
    /**
     * 沙盒ID
     */
    id,

    /**
     * 获取沙盒属性
     *
     * @param key 属性键
     * @returns 属性值
     */
    get<K extends keyof typeof sandbox>(key: K): (typeof sandbox)[K] {
      return sandbox[key];
    },

    /**
     * 设置沙盒属性
     *
     * @param key 属性键
     * @param value 属性值
     */
    set<K extends keyof typeof sandbox>(
      key: K,
      value: (typeof sandbox)[K]
    ): void {
      sandbox[key] = value;
    },

    /**
     * 更新沙盒属性
     *
     * @param updates 更新对象
     */
    update(updates: Partial<typeof sandbox>): void {
      Object.assign(sandbox, updates);
    },

    /**
     * 获取所有沙盒属性
     *
     * @returns 所有属性
     */
    getAll(): typeof sandbox {
      return { ...sandbox };
    },

    /**
     * 重置沙盒
     *
     * @param newProps 新属性
     */
    reset(newProps: T = {} as T): void {
      Object.keys(sandbox).forEach(key => {
        if (key !== 'id') {
          delete sandbox[key];
        }
      });

      Object.assign(sandbox, newProps);
    },
  };
}

/**
 * 监视对象属性变化
 *
 * @param object 目标对象
 * @param property 属性名
 * @param callback 回调函数
 * @returns 取消监视函数
 */
export function watchProperty<T, K extends keyof T>(
  object: T,
  property: K,
  callback: (newValue: T[K], oldValue: T[K]) => void
): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(object, property);

  if (
    !descriptor ||
    (!descriptor.configurable &&
      (!descriptor.writable || descriptor.get || descriptor.set))
  ) {
    throw new Error(`属性 ${String(property)} 不可监视`);
  }

  let value = object[property];

  Object.defineProperty(object, property, {
    configurable: true,
    enumerable: descriptor ? descriptor.enumerable : true,
    get() {
      return value;
    },
    set(newValue) {
      const oldValue = value;

      value = newValue;
      callback(newValue, oldValue);
    },
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(object, property, descriptor);
    } else {
      delete object[property];
      object[property] = value;
    }
  };
}

/**
 * 记录函数调用
 *
 * @param fn 要记录的函数
 * @returns 记录包装函数
 */
export function recordCalls<T extends (...args: any[]) => any>(
  fn: T
): {
  fn: (...args: Parameters<T>) => ReturnType<T>;
  calls: Array<{ args: Parameters<T>; result: ReturnType<T>; time: number }>;
  reset: () => void;
} {
  const calls: Array<{
    args: Parameters<T>;
    result: ReturnType<T>;
    time: number;
  }> = [];

  const wrapper = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = fn.apply(this, args);
    const time = performance.now() - start;

    calls.push({ args, result, time });

    return result;
  };

  return {
    fn: wrapper,
    calls,
    reset: () => (calls.length = 0),
  };
}

/**
 * 缓存函数结果
 *
 * @param fn 要缓存的函数
 * @param keyFn 键生成函数
 * @returns 缓存函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = fn.apply(this, args);

    cache.set(key, result);

    return result;
  } as T;
}

/**
 * 创建一个批量执行函数
 *
 * @param fn 要批量执行的函数
 * @param options 配置选项
 * @returns 批量函数
 */
export function batch<T, R>(
  fn: (items: T[]) => Promise<R[]>,
  options: {
    maxBatchSize?: number;
    maxWaitTime?: number;
  } = {}
): (item: T) => Promise<R> {
  const maxBatchSize = options.maxBatchSize ?? 100;
  const maxWaitTime = options.maxWaitTime ?? 50;

  let items: T[] = [];
  let pendingPromises: Array<{
    resolve: (value: R) => void;
    reject: (reason: any) => void;
  }> = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const processBatch = async () => {
    timeoutId = null;

    if (items.length === 0) {
      return;
    }

    const batchItems = [...items];
    const batchPromises = [...pendingPromises];

    items = [];
    pendingPromises = [];

    try {
      const results = await fn(batchItems);

      if (results.length !== batchItems.length) {
        throw new Error('批量处理函数返回结果数量与输入不符');
      }

      results.forEach((result, index) => {
        batchPromises[index].resolve(result);
      });
    } catch (error) {
      batchPromises.forEach(({ reject }) => {
        reject(error);
      });
    }
  };

  return (item: T): Promise<R> => {
    return new Promise<R>((resolve, reject) => {
      items.push(item);
      pendingPromises.push({ resolve, reject });

      if (items.length >= maxBatchSize) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        processBatch();
      } else if (!timeoutId) {
        timeoutId = setTimeout(processBatch, maxWaitTime);
      }
    });
  };
}
