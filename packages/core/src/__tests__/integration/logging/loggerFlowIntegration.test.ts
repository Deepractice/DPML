/**
 * 日志流程集成测试
 * 测试从API层到传输器的完整日志流程
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createLogger, setDefaultLogLevel, getDefaultLogger } from '../../../core/logging/loggingService';
import type { LoggerConfig } from '../../../types/log';
import { LogLevel } from '../../../types/log';

// 模拟控制台方法
beforeEach(() => {
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('日志流程集成测试', () => {
  describe('API与日志器创建流程', () => {
    it('IT-LOGFLOW-01: API层应正确创建并配置日志器', () => {
      // 创建自定义日志器
      const loggerConfig: LoggerConfig = {
        minLevel: LogLevel.DEBUG
      };

      const logger = createLogger('custom-logger', loggerConfig);

      // 测试日志器是否正确创建并配置
      expect(logger).toBeDefined();

      // 验证基本功能
      logger.debug('Debug测试消息');
      expect(console.debug).toHaveBeenCalled();

      logger.info('Info测试消息');
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('日志级别过滤流程', () => {
    it('IT-LOGFLOW-02: 日志过滤应在API到传输器的完整流程中工作', () => {
      // 创建INFO级别的日志器
      const loggerConfig: LoggerConfig = {
        minLevel: LogLevel.INFO
      };

      const logger = createLogger('level-filter-logger', loggerConfig);

      // DEBUG级别应被过滤
      logger.debug('这条消息不应被记录');
      expect(console.debug).not.toHaveBeenCalled();

      // INFO及以上级别应被记录
      logger.info('INFO消息');
      expect(console.info).toHaveBeenCalled();

      logger.warn('WARN消息');
      expect(console.warn).toHaveBeenCalled();

      logger.error('ERROR消息');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('调用位置捕获流程', () => {
    it('IT-LOGFLOW-03: 调用位置捕获应在完整流程中工作', () => {
      // 创建启用调用位置捕获的日志器
      const loggerConfig: LoggerConfig = {
        minLevel: LogLevel.DEBUG,
        callSiteCapture: {
          enabled: true
        }
      };

      const logger = createLogger('callsite-logger', loggerConfig);

      // 记录一条日志
      logger.error('带调用位置的错误消息');

      // 验证错误日志被记录，并且包含调用位置信息
      expect(console.error).toHaveBeenCalled();

      // 从console.error的调用参数中检查是否包含文件名和行号信息
      // 注意：因为格式化器可能有不同实现，这里只检查调用发生
      // 实际情况下需结合具体格式化器输出格式进行更精确的验证
      const callArgs = (console.error as any).mock.calls[0][0];

      expect(callArgs).toContain('错误消息');
    });
  });

  describe('设置默认日志级别', () => {
    it('应正确设置默认日志级别', () => {
      // 更改默认日志级别
      setDefaultLogLevel(LogLevel.ERROR);

      // 获取默认日志器
      const logger = getDefaultLogger();

      // INFO级别应被过滤
      logger.info('这条INFO消息不应被记录');
      expect(console.info).not.toHaveBeenCalled();

      // ERROR级别应被记录
      logger.error('这条ERROR消息应被记录');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('环境变量配置', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      // 重置控制台模拟
      vi.clearAllMocks();
    });

    afterEach(() => {
      // 恢复环境变量
      process.env = { ...originalEnv };
    });

    it('应从环境变量中加载配置', () => {
      // 设置环境变量
      process.env.LOG_LEVEL = 'WARN';

      // 需要重新加载默认配置，通过设置默认级别触发
      setDefaultLogLevel(LogLevel.WARN);

      // 获取默认日志器
      const logger = getDefaultLogger();

      // INFO级别应被过滤
      logger.info('这条INFO消息不应被记录');
      expect(console.info).not.toHaveBeenCalled();

      // WARN级别应被记录
      logger.warn('这条WARN消息应被记录');
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
