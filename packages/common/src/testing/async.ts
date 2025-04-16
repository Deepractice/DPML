/**
 * 异步测试辅助工具
 *
 * 提供异步操作的测试支持、等待和超时控制
 */

/**
 * 等待指定时间
 *
 * @param ms 等待的毫秒数
 * @returns 一个Promise，在指定时间后解决
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * 等待条件满足
 *
 * @param condition 条件函数
 * @param options 等待选项
 * @returns 一个Promise，当条件满足时解决
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options: {
    timeout?: number;
    interval?: number;
    timeoutMessage?: string;
  } = {}
): Promise<void> {
  const {
    timeout = 5000,
    interval = 100,
    timeoutMessage = '等待条件超时',
  } = options;

  const startTime = Date.now();

  while (true) {
    const result = await condition();

    if (result) {
      return;
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(timeoutMessage);
    }

    await sleep(interval);
  }
}

/**
 * 带超时的Promise包装
 *
 * @param promise 要包装的Promise
 * @param timeoutMs 超时时间（毫秒）
 * @param timeoutMessage 超时消息
 * @returns 包装后的Promise
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = '操作超时'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/**
 * 重试函数，直到成功或达到最大尝试次数
 *
 * @param fn 要重试的函数
 * @param options 重试选项
 * @returns 函数成功执行的结果
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
    onRetry?: (error: Error, attempt: number) => void | Promise<void>;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 100,
    backoff = true,
    onRetry = () => {},
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        await onRetry(lastError, attempt);

        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;

        await sleep(waitTime);
      }
    }
  }

  throw lastError;
}

/**
 * 并行执行函数的结果
 */
export interface ParallelResult<T> {
  /**
   * 成功的结果
   */
  successes: T[];

  /**
   * 失败的错误
   */
  errors: Error[];

  /**
   * 所有是否都成功
   */
  allSucceeded: boolean;

  /**
   * 至少有一个成功
   */
  someSucceeded: boolean;
}

/**
 * 并行执行多个异步函数，收集结果
 *
 * @param fns 要执行的函数数组
 * @returns 包含成功和失败信息的结果对象
 */
export async function parallel<T>(
  fns: Array<() => Promise<T>>
): Promise<ParallelResult<T>> {
  const results = await Promise.allSettled(fns.map(fn => fn()));

  const successes: T[] = [];
  const errors: Error[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      errors.push(result.reason);
    }
  }

  return {
    successes,
    errors,
    allSucceeded: errors.length === 0,
    someSucceeded: successes.length > 0,
  };
}

/**
 * 创建一个等待可观察事件的函数
 *
 * @param emitter 事件发射器
 * @param eventName 事件名称
 * @param options 等待选项
 * @returns 返回一个Promise，在事件触发时解决
 */
export function waitForEvent<
  T,
  E extends {
    on: (event: string, handler: (data: T) => void) => void;
    off: (event: string, handler: (data: T) => void) => void;
  },
>(
  emitter: E,
  eventName: string,
  options: {
    timeout?: number;
    timeoutMessage?: string;
    filter?: (data: T) => boolean;
  } = {}
): Promise<T> {
  const {
    timeout = 5000,
    timeoutMessage = `等待事件 "${eventName}" 超时`,
    filter = () => true,
  } = options;

  return new Promise<T>((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handler = (data: T) => {
      if (filter(data)) {
        cleanup();
        resolve(data);
      }
    };

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      emitter.off(eventName, handler);
    };

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(timeoutMessage));
      }, timeout);
    }

    emitter.on(eventName, handler);
  });
}

/**
 * 串行执行异步函数
 *
 * @param fns 要串行执行的函数数组
 * @returns 所有函数的结果数组
 */
export async function serial<T>(fns: Array<() => Promise<T>>): Promise<T[]> {
  const results: T[] = [];

  for (const fn of fns) {
    results.push(await fn());
  }

  return results;
}

/**
 * 创建一个可中断的Promise
 */
export interface CancellablePromise<T> {
  /**
   * Promise本身
   */
  promise: Promise<T>;

  /**
   * 取消函数
   */
  cancel: () => void;
}

/**
 * 创建一个可取消的Promise
 *
 * @param executor Promise执行器
 * @returns 可取消的Promise对象
 */
export function createCancellablePromise<T>(
  executor: (
    resolve: (value: T) => void,
    reject: (reason: any) => void,
    onCancel: (handler: () => void) => void
  ) => void
): CancellablePromise<T> {
  let cancelHandlers: Array<() => void> = [];
  let isCancelled = false;

  const registerCancelHandler = (handler: () => void) => {
    cancelHandlers.push(handler);
  };

  const promise = new Promise<T>((resolve, reject) => {
    executor(resolve, reject, registerCancelHandler);
  });

  const wrappedPromise = promise.catch(error => {
    if (isCancelled) {
      throw new Error('Promise已被取消');
    }

    throw error;
  });

  const cancel = () => {
    isCancelled = true;
    for (const handler of cancelHandlers) {
      handler();
    }

    cancelHandlers = [];
  };

  return {
    promise: wrappedPromise as Promise<T>,
    cancel,
  };
}
