/**
 * DefaultLogger单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { DefaultLogger } from '../../../../core/logging/DefaultLogger';
import { LogLevel } from '../../../../types/log';
import { createLoggerConfigFixture, MockTransport, createCallerInfoFixture } from '../../../fixtures/logging/loggerFixtures';

describe('DefaultLogger', () => {
  let mockTransport: MockTransport;

  beforeEach(() => {
    mockTransport = new MockTransport();
    // 模拟Error.captureStackTrace以控制调用栈
    vi.spyOn(Error, 'captureStackTrace').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 测试 UT-DEFLOG-01: debug方法应在DEBUG级别启用时记录日志
  it('debug方法应在DEBUG级别启用时记录日志', () => {
    // 设置
    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.DEBUG,
      transports: [mockTransport]
    }));

    // 执行
    logger.debug('调试消息');

    // 验证
    expect(mockTransport.entries.length).toBe(1);
    expect(mockTransport.entries[0].level).toBe(LogLevel.DEBUG);
    expect(mockTransport.entries[0].message).toBe('调试消息');
  });

  // 测试 UT-DEFLOG-02: info方法应在INFO级别启用时记录日志
  it('info方法应在INFO级别启用时记录日志', () => {
    // 设置
    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.INFO,
      transports: [mockTransport]
    }));

    // 执行
    logger.info('信息消息');

    // 验证
    expect(mockTransport.entries.length).toBe(1);
    expect(mockTransport.entries[0].level).toBe(LogLevel.INFO);
    expect(mockTransport.entries[0].message).toBe('信息消息');
  });

  // 测试 UT-DEFLOG-03: warn方法应在WARN级别启用时记录日志
  it('warn方法应在WARN级别启用时记录日志', () => {
    // 设置
    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.WARN,
      transports: [mockTransport]
    }));

    // 执行
    logger.warn('警告消息');

    // 验证
    expect(mockTransport.entries.length).toBe(1);
    expect(mockTransport.entries[0].level).toBe(LogLevel.WARN);
    expect(mockTransport.entries[0].message).toBe('警告消息');
  });

  // 测试 UT-DEFLOG-04: error方法应在ERROR级别启用时记录日志
  it('error方法应在ERROR级别启用时记录日志', () => {
    // 设置
    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.ERROR,
      transports: [mockTransport]
    }));

    // 执行
    logger.error('错误消息');

    // 验证
    expect(mockTransport.entries.length).toBe(1);
    expect(mockTransport.entries[0].level).toBe(LogLevel.ERROR);
    expect(mockTransport.entries[0].message).toBe('错误消息');
  });

  // 测试 UT-DEFLOG-05: fatal方法应在任何级别都记录日志
  it('fatal方法应在任何级别都记录日志', () => {
    // 设置 - 即使minLevel设置为最高级别，fatal日志也应该被记录
    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.FATAL,
      transports: [mockTransport]
    }));

    // 执行
    logger.fatal('致命错误消息');

    // 验证
    expect(mockTransport.entries.length).toBe(1);
    expect(mockTransport.entries[0].level).toBe(LogLevel.FATAL);
    expect(mockTransport.entries[0].message).toBe('致命错误消息');
  });

  // 测试 UT-DEFLOG-06: log方法应将日志条目传递给所有传输器
  it('log方法应将日志条目传递给所有传输器', () => {
    // 设置
    const mockTransport1 = new MockTransport();
    const mockTransport2 = new MockTransport();

    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.INFO,
      transports: [mockTransport1, mockTransport2]
    }));

    // 执行
    logger.info('测试多传输器');

    // 验证
    expect(mockTransport1.entries.length).toBe(1);
    expect(mockTransport2.entries.length).toBe(1);
    expect(mockTransport1.entries[0].message).toBe('测试多传输器');
    expect(mockTransport2.entries[0].message).toBe('测试多传输器');
  });

  // 测试 UT-DEFLOG-07: log方法应在启用调用位置捕获时添加位置信息
  it('log方法应在启用调用位置捕获时添加位置信息', () => {
    // 模拟getCaller方法返回固定的调用位置
    const mockCallerInfo = createCallerInfoFixture();

    vi.spyOn(DefaultLogger.prototype as any, 'getCaller').mockReturnValue(mockCallerInfo);

    // 设置
    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.INFO,
      transports: [mockTransport],
      callSiteCapture: {
        enabled: true
      }
    }));

    // 执行
    logger.info('带调用位置的消息');

    // 验证
    expect(mockTransport.entries.length).toBe(1);
    expect(mockTransport.entries[0].caller).toBeDefined();
    expect(mockTransport.entries[0].caller).toEqual(mockCallerInfo);
  });

  // 测试 UT-DEFLOG-08: log方法应仅为配置的级别捕获调用位置
  it('log方法应仅为配置的级别捕获调用位置', () => {
    // 模拟getCaller方法返回固定的调用位置
    const mockCallerInfo = createCallerInfoFixture();

    vi.spyOn(DefaultLogger.prototype as any, 'getCaller').mockReturnValue(mockCallerInfo);

    // 设置 - 只为ERROR级别启用调用位置捕获
    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.DEBUG,
      transports: [mockTransport],
      callSiteCapture: {
        enabled: true,
        forLevels: [LogLevel.ERROR]
      }
    }));

    // 执行
    logger.info('INFO消息');
    logger.error('ERROR消息');

    // 验证
    expect(mockTransport.entries.length).toBe(2);
    expect(mockTransport.entries[0].caller).toBeUndefined(); // INFO级别不应有调用位置
    expect(mockTransport.entries[1].caller).toEqual(mockCallerInfo); // ERROR级别应有调用位置
  });

  // 测试 UT-DEFLOG-NEG-01: debug方法应在高于DEBUG级别时不记录日志
  it('debug方法应在高于DEBUG级别时不记录日志', () => {
    // 设置
    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.INFO, // 高于DEBUG
      transports: [mockTransport]
    }));

    // 执行
    logger.debug('这条消息不应被记录');

    // 验证
    expect(mockTransport.entries.length).toBe(0);
  });

  // 测试 UT-DEFLOG-NEG-02: log方法应处理传输器抛出的错误
  it('log方法应处理传输器抛出的错误', () => {
    // 设置 - 创建一个会抛出错误的传输器
    const errorTransport = new MockTransport(true);
    const normalTransport = new MockTransport();

    // 模拟console.error以验证错误被处理
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = new DefaultLogger(createLoggerConfigFixture({
      minLevel: LogLevel.INFO,
      transports: [errorTransport, normalTransport]
    }));

    // 执行 - 不应抛出错误
    expect(() => logger.info('测试错误处理')).not.toThrow();

    // 验证
    expect(consoleErrorSpy).toHaveBeenCalled(); // 错误被记录到控制台
    expect(normalTransport.entries.length).toBe(1); // 正常传输器仍然接收到日志
  });
});
