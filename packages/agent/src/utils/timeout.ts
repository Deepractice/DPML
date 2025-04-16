/**
 * 超时处理工具函数
 */

/**
 * 创建可被中断的超时Promise
 * @param timeoutMs 超时时间(毫秒)
 * @param errorMessage 超时错误消息
 * @param signal 可选的AbortSignal，用于取消超时
 * @returns 超时Promise，到达超时时间后会被reject
 */
export function createTimeoutPromise<T>(
  timeoutMs: number,
  errorMessage: string,
  signal?: AbortSignal
): Promise<T> {
  return new Promise<T>((_, reject) => {
    // 如果信号已经中止，立即返回
    if (signal?.aborted) {
      reject(new Error(signal.reason || 'Promise aborted'));

      return;
    }

    // 创建超时定时器
    const timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    // 如果提供了信号，添加中止监听器
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeoutId);
          reject(new Error(signal.reason || 'Promise aborted'));
        },
        { once: true }
      );
    }
  });
}

/**
 * 创建超时控制器
 * @param timeoutMs 超时时间(毫秒)
 * @returns 包含AbortController和AbortSignal的对象
 */
export function createTimeoutController(timeoutMs: number): {
  controller: AbortController;
  signal: AbortSignal;
  clear: () => void;
} {
  const controller = new AbortController();
  const signal = controller.signal;

  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Timeout after ${timeoutMs}ms`));
  }, timeoutMs);

  const clear = () => {
    clearTimeout(timeoutId);
  };

  return { controller, signal, clear };
}
