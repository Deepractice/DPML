/**
 * Logger API契约测试
 *
 * 这些测试确保Logger API的契约稳定性，防止意外的破坏性变更。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type {
  LoggerConfig
} from '../../../api/logger';
import {
  getDefaultLogger,
  getLogger,
  createLogger,
  setDefaultLogLevel,
  LogLevel
} from '../../../api/logger';
import { getDefaultLogger, getLogger, createLogger } from '../../../core/logging/loggingService';

// 模拟loggingService
vi.mock('../../../core/logging/loggingService', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn()
  };

  return {
    getDefaultLogger: vi.fn().mockReturnValue(mockLogger),
    getLogger: vi.fn().mockReturnValue(mockLogger),
    createLogger: vi.fn().mockReturnValue(mockLogger),
    setDefaultLogLevel: vi.fn()
  };
});

describe('Logger API契约测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // CT-API-LOG-01: getDefaultLogger API应维持类型签名
  it('CT-API-LOG-01: getDefaultLogger API应维持类型签名', () => {
    // 验证函数类型和签名
    expect(typeof getDefaultLogger).toBe('function');

    // 验证调用时不会出错 (参数和类型检查)
    expect(() => {
      getDefaultLogger();
    }).not.toThrow();
  });

  // CT-API-LOG-02: getLogger API应维持类型签名
  it('CT-API-LOG-02: getLogger API应维持类型签名', () => {
    // 验证函数类型和签名
    expect(typeof getLogger).toBe('function');

    // 验证调用时不会出错 (参数和类型检查)
    expect(() => {
      getLogger('test-logger');
    }).not.toThrow();
  });

  // CT-API-LOG-03: createLogger API应维持类型签名
  it('CT-API-LOG-03: createLogger API应维持类型签名', () => {
    // 验证函数类型和签名
    expect(typeof createLogger).toBe('function');

    // 验证调用时不会出错 (参数和类型检查)
    expect(() => {
      const config: LoggerConfig = { minLevel: LogLevel.INFO };

      createLogger('test-logger', config);
    }).not.toThrow();
  });

  // CT-API-LOG-04: setDefaultLogLevel API应维持类型签名
  it('CT-API-LOG-04: setDefaultLogLevel API应维持类型签名', () => {
    // 验证函数类型和签名
    expect(typeof setDefaultLogLevel).toBe('function');

    // 验证调用时不会出错 (参数和类型检查)
    expect(() => {
      setDefaultLogLevel(LogLevel.DEBUG);
      setDefaultLogLevel(LogLevel.INFO);
      setDefaultLogLevel(LogLevel.WARN);
      setDefaultLogLevel(LogLevel.ERROR);
      setDefaultLogLevel(LogLevel.FATAL);
    }).not.toThrow();
  });

  // CT-API-LOG-05: getDefaultLogger API应返回符合Logger接口的对象
  it('CT-API-LOG-05: getDefaultLogger API应返回符合Logger接口的对象', () => {
    // 调用API
    const logger = getDefaultLogger();

    // 验证返回的对象符合Logger接口
    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.fatal).toBe('function');

    // 验证委托调用
    expect(getDefaultLogger).toHaveBeenCalled();
  });

  // CT-API-LOG-06: getLogger API应返回符合Logger接口的对象
  it('CT-API-LOG-06: getLogger API应返回符合Logger接口的对象', () => {
    // 调用API
    const logger = getLogger('test');

    // 验证返回的对象符合Logger接口
    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.fatal).toBe('function');

    // 验证委托调用
    expect(getLogger).toHaveBeenCalledWith('test');
  });

  // CT-API-LOG-07: createLogger API应返回符合Logger接口的对象
  it('CT-API-LOG-07: createLogger API应返回符合Logger接口的对象', () => {
    // 准备测试数据
    const config: LoggerConfig = { minLevel: LogLevel.INFO };

    // 调用API
    const logger = createLogger('custom', config);

    // 验证返回的对象符合Logger接口
    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.fatal).toBe('function');

    // 验证委托调用
    expect(createLogger).toHaveBeenCalledWith('custom', config);
  });
});
