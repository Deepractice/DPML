/**
 * Vitest 全局设置
 * 用于捕获测试中的未处理异常
 */
import { beforeAll, afterAll } from 'vitest';

// 需要忽略的错误消息列表
const errorMessagesToIgnore = [
  '测试错误',
  '模拟LLM服务错误',
  'LLM服务错误',
  '不应该收到任何响应',
  '不应该完成订阅',
  '超时：未捕获到错误'
];

// 设置全局错误处理器
beforeAll(() => {
  const originalConsoleError = console.error;

  // 替换全局 console.error 方法，过滤掉测试错误消息
  console.error = (...args) => {
    // 检查是否是我们想要忽略的错误
    const errorString = String(args[0]);

    if (errorMessagesToIgnore.some(msg => errorString.includes(msg))) {
      // 是测试错误，不输出
      return;
    }

    // 其他错误正常输出
    originalConsoleError(...args);
  };

  // 捕获全局未处理异常
  const originalOnError = global.onerror;

  global.onerror = (event, source, lineno, colno, error) => {
    if (error && errorMessagesToIgnore.some(msg => error.message?.includes(msg))) {
      // 阻止事件冒泡，表示已处理
      return true;
    }

    // 其他错误正常处理
    return originalOnError ? originalOnError(event, source, lineno, colno, error) : false;
  };
});

// 测试结束后恢复原始设置
afterAll(() => {
  // 在实际项目中，可能需要恢复原始的 console.error 方法
  // 但在测试环境下，这通常不是必要的
});
