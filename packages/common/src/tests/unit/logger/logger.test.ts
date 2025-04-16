import { describe, test, expect, beforeEach, vi } from 'vitest';

import { Logger, LogLevel } from '../../../logger/core';
import { TextFormatter } from '../../../logger/formatters';
import { MemoryTransport } from '../../../logger/transports';

import type { LoggerOptions } from '../../../logger/core';

describe('UT-LOG-001: Logger', () => {
  let logger: Logger;
  let memoryTransport: MemoryTransport;
  let options: LoggerOptions;

  beforeEach(() => {
    memoryTransport = new MemoryTransport();
    options = {
      packageName: 'test-package',
      level: LogLevel.DEBUG,
      transports: [memoryTransport],
    };
    logger = new Logger(options);
  });

  describe('日志级别控制', () => {
    test('应遵循日志级别过滤', () => {
      // 设置为INFO级别
      logger.setLevel(LogLevel.INFO);

      // 记录不同级别的日志
      logger.debug('此消息不应被记录');
      logger.info('信息消息');
      logger.warn('警告消息');
      logger.error('错误消息');

      // 获取记录的日志
      const logs = memoryTransport.getLogs();

      // 应该只有3条日志(INFO, WARN, ERROR)，而非4条
      expect(logs.length).toBe(3);

      // 检查没有DEBUG级别的日志
      const debugLogs = memoryTransport.getLogsByLevel(LogLevel.DEBUG);

      expect(debugLogs.length).toBe(0);
    });

    test('应正确获取和设置日志级别', () => {
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);

      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('日志方法', () => {
    test('debug方法应记录调试级别日志', () => {
      logger.debug('调试信息');

      const logs = memoryTransport.getLogs();

      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });

    test('info方法应记录信息级别日志', () => {
      logger.info('普通信息');

      const logs = memoryTransport.getLogs();

      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
    });

    test('warn方法应记录警告级别日志', () => {
      logger.warn('警告信息');

      const logs = memoryTransport.getLogs();

      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    test('error方法应记录错误级别日志', () => {
      logger.error('错误信息');

      const logs = memoryTransport.getLogs();

      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });
  });

  describe('格式化器和传输通道', () => {
    test('应正确使用格式化器', () => {
      const formatter = new TextFormatter({
        template: '[{level}] {message}',
      });

      logger.setFormatter(formatter);
      logger.info('测试消息');

      const logs = memoryTransport.getLogs();

      expect(logs[0].message).toContain('[INFO] 测试消息');
    });

    test('应正确添加传输通道', () => {
      const additionalTransport = new MemoryTransport();

      logger.addTransport(additionalTransport);

      logger.info('测试多通道');

      expect(memoryTransport.getLogs().length).toBe(1);
      expect(additionalTransport.getLogs().length).toBe(1);
    });
  });

  describe('元数据处理', () => {
    test('应包含包名称', () => {
      logger.info('测试包名称');

      const logs = memoryTransport.getLogs();

      expect(logs[0].meta.packageName).toBe('test-package');
    });

    test('应包含时间戳', () => {
      logger.info('测试时间戳');

      const logs = memoryTransport.getLogs();

      expect(logs[0].meta.timestamp).toBeTruthy();
      expect(new Date(logs[0].meta.timestamp).getTime()).not.toBeNaN();
    });

    test('应包含自定义元数据', () => {
      const loggerWithMeta = new Logger({
        ...options,
        meta: { customField: 'custom-value' },
      });

      loggerWithMeta.info('测试自定义元数据');

      const logs = memoryTransport.getLogs();

      expect(logs[0].meta.customField).toBe('custom-value');
    });
  });
});
