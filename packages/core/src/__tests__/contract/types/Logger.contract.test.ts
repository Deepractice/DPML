/**
 * Logger接口契约测试
 *
 * 这些测试确保Logger接口的结构稳定性，防止意外的破坏性变更。
 */
import { describe, it, expect } from 'vitest';

import type { Logger } from '../../../types/log';

describe('Logger接口契约测试', () => {
  // CT-TYPE-LOG-01: Logger接口应维持结构稳定性
  it('CT-TYPE-LOG-01: Logger接口应维持结构稳定性', () => {
    // 创建一个符合Logger接口的对象
    const mockLogger: Logger = {
      debug: (message: string, context?: Record<string, unknown>, error?: Error) => {},
      info: (message: string, context?: Record<string, unknown>, error?: Error) => {},
      warn: (message: string, context?: Record<string, unknown>, error?: Error) => {},
      error: (message: string, context?: Record<string, unknown>, error?: Error) => {},
      fatal: (message: string, context?: Record<string, unknown>, error?: Error) => {},
    };

    // 验证Logger接口包含所有必需的方法
    expect(typeof mockLogger.debug).toBe('function');
    expect(typeof mockLogger.info).toBe('function');
    expect(typeof mockLogger.warn).toBe('function');
    expect(typeof mockLogger.error).toBe('function');
    expect(typeof mockLogger.fatal).toBe('function');
  });

  // CT-TYPE-LOG-02: Logger接口的日志方法应支持上下文和错误参数
  it('CT-TYPE-LOG-02: Logger接口的日志方法应支持上下文和错误参数', () => {
    // 创建一个符合Logger接口的对象，记录调用参数
    const calls: Array<{method: string, args: any[]}> = [];
    const mockLogger: Logger = {
      debug: (message: string, context?: Record<string, unknown>, error?: Error) => {
        calls.push({ method: 'debug', args: [message, context, error] });
      },
      info: (message: string, context?: Record<string, unknown>, error?: Error) => {
        calls.push({ method: 'info', args: [message, context, error] });
      },
      warn: (message: string, context?: Record<string, unknown>, error?: Error) => {
        calls.push({ method: 'warn', args: [message, context, error] });
      },
      error: (message: string, context?: Record<string, unknown>, error?: Error) => {
        calls.push({ method: 'error', args: [message, context, error] });
      },
      fatal: (message: string, context?: Record<string, unknown>, error?: Error) => {
        calls.push({ method: 'fatal', args: [message, context, error] });
      },
    };

    // 测试所有方法都支持三个参数
    const testMessage = 'Test message';
    const testContext = { module: 'test' };
    const testError = new Error('Test error');

    mockLogger.debug(testMessage, testContext, testError);
    mockLogger.info(testMessage, testContext, testError);
    mockLogger.warn(testMessage, testContext, testError);
    mockLogger.error(testMessage, testContext, testError);
    mockLogger.fatal(testMessage, testContext, testError);

    // 验证每个方法都接收了所有参数
    calls.forEach(call => {
      expect(call.args[0]).toBe(testMessage);
      expect(call.args[1]).toBe(testContext);
      expect(call.args[2]).toBe(testError);
    });

    // 验证方法也可以只接收消息参数
    calls.length = 0;
    mockLogger.debug(testMessage);
    expect(calls[0].args[0]).toBe(testMessage);
    expect(calls[0].args[1]).toBeUndefined();
    expect(calls[0].args[2]).toBeUndefined();
  });
});
