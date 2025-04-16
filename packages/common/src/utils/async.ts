/**
 * 异步操作工具模块
 *
 * 提供异步控制流、并发管理和异步任务处理工具函数。
 */

/**
 * 延迟执行一段时间
 * @param ms 延迟毫秒数
 * @returns Promise，在指定时间后解析
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数，直到成功或达到最大尝试次数
 * @param fn 要重试的异步函数
 * @param options 重试选项
 * @returns 函数执行结果
 * @throws 如果所有重试都失败，则抛出最后一次错误
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts: number; delay: number; backoff?: boolean; onRetry?: (attempt: number, error: Error) => void }
): Promise<T> {
  const { maxAttempts, delay, backoff = false, onRetry } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      if (attempt < maxAttempts) {
        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await sleep(waitTime);
      }
    }
  }

  throw lastError!;
}

/**
 * 并行执行任务，并限制最大并发数
 * @param tasks 任务函数数组
 * @param concurrency 最大并发数
 * @returns 所有任务的结果数组，顺序与输入任务相同
 */
export async function parallel<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let currentIndex = 0;

  async function runTask(taskIndex: number): Promise<void> {
    const result = await tasks[taskIndex]();
    results[taskIndex] = result;

    const nextIndex = currentIndex++;
    if (nextIndex < tasks.length) {
      await runTask(nextIndex);
    }
  }

  const initialWorkers: Promise<void>[] = [];
  const initialCount = Math.min(concurrency, tasks.length);

  for (let i = 0; i < initialCount; i++) {
    initialWorkers.push(runTask(currentIndex++));
  }

  await Promise.all(initialWorkers);
  return results;
}

/**
 * 带超时的Promise包装器
 * @param promise 原始Promise
 * @param timeoutMs 超时时间(毫秒)
 * @param timeoutError 超时时抛出的错误消息或错误对象
 * @returns 原始Promise结果或超时错误
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string | Error = new Error(`Operation timed out after ${timeoutMs}ms`)
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(typeof timeoutError === 'string' ? new Error(timeoutError) : timeoutError);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * 创建可取消的Promise
 * @returns 包含Promise和取消函数的对象
 */
export function createCancellablePromise<T>(): {
  promise: Promise<T>;
  cancel: (reason?: string) => void;
} {
  let cancelFn: (reason?: string) => void;

  const promise = new Promise<T>((resolve, reject) => {
    cancelFn = (reason = 'Promise was cancelled') => {
      reject(new Error(reason));
    };
  });

  return {
    promise,
    cancel: cancelFn!
  };
}

/**
 * 创建一个节流函数，限制函数在一定时间内只能执行一次
 * @param fn 要节流的函数
 * @param delay 节流延迟时间(毫秒)
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let lastResult: ReturnType<T>;

  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      lastResult = fn.apply(this, args);
    }

    return lastResult;
  };
}

/**
 * 创建一个防抖函数，延迟调用函数直到一定时间内没有再次调用
 * @param fn 要防抖的函数
 * @param delay 防抖延迟时间(毫秒)
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;

  return function(this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise(resolve => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const result = fn.apply(this, args);
        resolve(result);
      }, delay);
    });
  };
}

/**
 * 顺序执行多个异步任务
 * @param tasks 异步任务函数数组
 * @returns 所有任务结果的数组
 */
export async function sequence<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = [];

  for (const task of tasks) {
    results.push(await task());
  }

  return results;
}

/**
 * parallelLimit 函数，作为 parallel 的别名
 * @param tasks 任务函数数组
 * @param concurrency 最大并发数
 * @returns 所有任务的结果数组，顺序与输入任务相同
 */
export const parallelLimit = parallel;

/**
 * 导出asyncUtils对象，保持向后兼容
 */
export const asyncUtils = {
  sleep,
  retry,
  parallel,
  parallelLimit,
  withTimeout,
  createCancellablePromise,
  throttle,
  debounce,
  sequence
};