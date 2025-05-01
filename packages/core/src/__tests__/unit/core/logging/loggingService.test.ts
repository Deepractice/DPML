/**
 * loggingService模块单元测试
 * 测试日志服务模块的功能
 */

import type { Mock } from 'vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { LoggerRegistry } from '../../../../core/logging/LoggerRegistry';
import { getDefaultLogger, getLogger, createLogger, setDefaultLogLevel } from '../../../../core/logging/loggingService';
import type { LoggerConfig } from '../../../../types/log';
import { LogLevel } from '../../../../types/log';

// 模拟依赖组件
vi.mock('../../../../core/logging/LoggerRegistry', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn()
  };

  return {
    LoggerRegistry: {
      getInstance: vi.fn().mockReturnValue({
        getLogger: vi.fn().mockReturnValue(mockLogger),
        createLogger: vi.fn().mockReturnValue(mockLogger),
        registerLogger: vi.fn()
      })
    }
  };
});

// 模拟ConsoleTransport和DefaultFormatter
vi.mock('../../../../core/logging/transports/ConsoleTransport', () => {
  return {
    ConsoleTransport: class MockConsoleTransport {
      constructor(formatter: unknown) {
        // 简单的模拟构造函数
      }
    }
  };
});

vi.mock('../../../../core/logging/formatters/DefaultFormatter', () => {
  return {
    DefaultFormatter: class MockDefaultFormatter {
      constructor() {
        // 简单的模拟构造函数
      }
    }
  };
});

describe('loggingService', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getDefaultLogger', () => {
    it('UT-LOGSVC-01: 应委托给LoggerRegistry', () => {
      // 调用测试方法
      const logger = getDefaultLogger();

      // 验证委托调用
      expect(LoggerRegistry.getInstance).toHaveBeenCalled();
      expect(LoggerRegistry.getInstance().getLogger).toHaveBeenCalledWith('default');
      expect(logger).toBeDefined();
    });
  });

  describe('getLogger', () => {
    it('UT-LOGSVC-02: 应委托给LoggerRegistry', () => {
      // 调用测试方法
      const logger = getLogger('test-logger');

      // 验证委托调用
      expect(LoggerRegistry.getInstance).toHaveBeenCalled();
      expect(LoggerRegistry.getInstance().getLogger).toHaveBeenCalledWith('test-logger');
      expect(logger).toBeDefined();
    });
  });

  describe('createLogger', () => {
    it('UT-LOGSVC-03: 应使用增强配置委托给LoggerRegistry', () => {
      // 准备测试数据
      const config: LoggerConfig = { minLevel: LogLevel.DEBUG };

      // 调用测试方法
      const logger = createLogger('new-logger', config);

      // 验证委托调用
      expect(LoggerRegistry.getInstance).toHaveBeenCalled();
      expect(LoggerRegistry.getInstance().createLogger).toHaveBeenCalled();

      // 检查传递给createLogger的参数
      const createLoggerCall = (LoggerRegistry.getInstance().createLogger as Mock).mock.calls[0];

      expect(createLoggerCall[0]).toBe('new-logger'); // 名称应一致

      // 配置应包含原始配置和默认增强
      const passedConfig = createLoggerCall[1];

      expect(passedConfig.minLevel).toBe(LogLevel.DEBUG); // 用户配置
      expect(passedConfig.formatter).toBeDefined(); // 默认格式化器
      expect(passedConfig.transports).toBeDefined(); // 默认传输器
      expect(passedConfig.transports?.length).toBeGreaterThan(0);

      expect(logger).toBeDefined();
    });
  });

  describe('setDefaultLogLevel', () => {
    it('UT-LOGSVC-04: 应更新默认日志级别', () => {
      // 调用测试方法
      setDefaultLogLevel(LogLevel.ERROR);

      // 验证委托调用
      expect(LoggerRegistry.getInstance).toHaveBeenCalled();
      expect(LoggerRegistry.getInstance().createLogger).toHaveBeenCalled();
      expect(LoggerRegistry.getInstance().registerLogger).toHaveBeenCalledWith('default', expect.anything());

      // 验证传递给createLogger的配置包含了正确的日志级别
      const mockCreateLogger = LoggerRegistry.getInstance().createLogger as Mock;
      const callArgs = mockCreateLogger.mock.calls[0];

      expect(callArgs[0]).toBe('default');
      expect(callArgs[1].minLevel).toBe(LogLevel.ERROR);
    });
  });

  describe('loadLoggerConfig', () => {
    it('UT-LOGSVC-NEG-01: 应处理环境变量配置', () => {
      // 设置环境变量
      process.env.LOG_LEVEL = 'DEBUG';
      process.env.LOG_CAPTURE_CALLSITE = 'true';

      // 调用setDefaultLogLevel会间接调用loadLoggerConfig
      setDefaultLogLevel(LogLevel.WARN);

      // 验证环境变量被正确处理
      const mockCreateLogger = LoggerRegistry.getInstance().createLogger as Mock;
      const callArgs = mockCreateLogger.mock.calls[0];

      expect(callArgs[1].minLevel).toBe(LogLevel.WARN); // 传入的级别应覆盖环境变量
      expect(callArgs[1].callSiteCapture).toEqual({ enabled: true });
    });

    it('应在环境变量缺失时使用默认配置', () => {
      // 清除环境变量
      delete process.env.LOG_LEVEL;
      delete process.env.LOG_CAPTURE_CALLSITE;

      // 调用setDefaultLogLevel会间接调用loadLoggerConfig
      setDefaultLogLevel(LogLevel.WARN);

      // 验证使用了默认配置
      const mockCreateLogger = LoggerRegistry.getInstance().createLogger as Mock;
      const callArgs = mockCreateLogger.mock.calls[0];

      expect(callArgs[1].minLevel).toBe(LogLevel.WARN);
      expect(callArgs[1].callSiteCapture).toBeUndefined();
    });

    it('应处理无效的环境变量', () => {
      // 设置无效的环境变量
      process.env.LOG_LEVEL = 'INVALID_LEVEL';

      // 调用setDefaultLogLevel会间接调用loadLoggerConfig
      setDefaultLogLevel(LogLevel.WARN);

      // 验证使用了传入的级别而非无效环境变量
      const mockCreateLogger = LoggerRegistry.getInstance().createLogger as Mock;
      const callArgs = mockCreateLogger.mock.calls[0];

      expect(callArgs[1].minLevel).toBe(LogLevel.WARN);
    });
  });
});
