/**
 * JsonFormatter单元测试
 *
 * 测试JsonFormatter格式化器的功能
 */
import { describe, it, expect } from 'vitest';

import { JsonFormatter } from '../../../../../core/logging/formatters/JsonFormatter';
import { LogLevel } from '../../../../../types/log';
import { createLogEntryFixture, createCallerInfoFixture } from '../../../../fixtures/logging/loggerFixtures';

describe('JsonFormatter', () => {
  // 基本格式化测试
  it('应将日志条目格式化为有效的JSON字符串', () => {
    // 准备
    const formatter = new JsonFormatter();
    const entry = createLogEntryFixture({
      message: '这是一条测试消息'
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);

    expect(parsed.message).toBe('这是一条测试消息');
    expect(parsed.level).toBe('INFO');
  });

  // 时间戳格式化测试
  it('应正确格式化时间戳', () => {
    // 准备
    const formatter = new JsonFormatter();
    const timestamp = new Date('2023-01-01T12:00:00Z');
    const entry = createLogEntryFixture({
      timestamp
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2023-01-01T12:00:00.000Z');
  });

  // 日志级别格式化测试
  it('应将日志级别转换为字符串名称', () => {
    // 准备
    const formatter = new JsonFormatter();

    // 测试所有日志级别
    const levels = [
      { level: LogLevel.DEBUG, name: 'DEBUG' },
      { level: LogLevel.INFO, name: 'INFO' },
      { level: LogLevel.WARN, name: 'WARN' },
      { level: LogLevel.ERROR, name: 'ERROR' },
      { level: LogLevel.FATAL, name: 'FATAL' }
    ];

    for (const { level, name } of levels) {
      // 执行
      const result = formatter.format(createLogEntryFixture({ level }));

      // 验证
      const parsed = JSON.parse(result);

      expect(parsed.level).toBe(name);
    }
  });

  // 上下文格式化测试
  it('应包含上下文信息', () => {
    // 准备
    const formatter = new JsonFormatter();
    const context = { userId: '12345', action: 'login', status: 'success' };
    const entry = createLogEntryFixture({
      context
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    const parsed = JSON.parse(result);

    expect(parsed.context).toEqual(context);
  });

  // 错误信息格式化测试
  it('应正确格式化错误信息', () => {
    // 准备
    const formatter = new JsonFormatter();
    const error = new Error('测试错误');
    const entry = createLogEntryFixture({
      error
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    const parsed = JSON.parse(result);

    expect(parsed.error).toBeDefined();
    expect(parsed.error.message).toBe('测试错误');
    expect(parsed.error.stack).toBeDefined();
  });

  // 调用位置信息格式化测试
  it('应包含调用位置信息', () => {
    // 准备
    const formatter = new JsonFormatter();
    const caller = createCallerInfoFixture({
      fileName: 'TestFile.ts',
      functionName: 'testFunction',
      lineNumber: 42,
      className: 'TestClass'
    });

    const entry = createLogEntryFixture({
      caller
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    const parsed = JSON.parse(result);

    expect(parsed.caller).toEqual(caller);
  });

  // 循环引用处理测试
  it('应处理循环引用', () => {
    // 准备
    const formatter = new JsonFormatter();

    // 创建带循环引用的上下文
    const circularContext: Record<string, any> = {
      name: '循环引用测试'
    };

    circularContext.self = circularContext; // 创建循环引用

    const entry = createLogEntryFixture({
      context: circularContext
    });

    // 执行
    const result = formatter.format(entry);

    // 验证 - 不应抛出错误，应返回降级的JSON
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);

    expect(parsed.message).toBe('测试日志消息');
    expect(parsed.level).toBe('INFO');
    expect(parsed.error).toBeDefined();
    expect(parsed.error).toContain('序列化失败');
  });

  // 缺少字段处理测试
  it('应处理缺少字段的日志条目', () => {
    // 准备
    const formatter = new JsonFormatter();
    const entry = createLogEntryFixture();

    // @ts-ignore - 故意删除必需字段以测试健壮性
    delete entry.timestamp;
    delete entry.message;

    // 执行
    const result = formatter.format(entry);

    // 验证 - 不应抛出错误，应返回有效的JSON
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);

    expect(parsed.level).toBe('INFO');
  });
});
