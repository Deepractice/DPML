/**
 * DefaultFormatter单元测试
 *
 * 测试DefaultFormatter格式化器的功能
 */
import { describe, it, expect } from 'vitest';

import { DefaultFormatter } from '../../../../../core/logging/formatters/DefaultFormatter';
import { LogLevel } from '../../../../../types/log';
import { createLogEntryFixture, createCallerInfoFixture } from '../../../../fixtures/logging/loggerFixtures';

describe('DefaultFormatter', () => {
  // UT-DEFFRM-01: format应格式化基本日志条目
  it('UT-DEFFRM-01: format应格式化基本日志条目', () => {
    // 准备
    const formatter = new DefaultFormatter();
    const entry = createLogEntryFixture({
      message: '这是一条测试消息'
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    expect(result).toContain('这是一条测试消息');
    expect(result).toContain('[INFO]');
  });

  // UT-DEFFRM-02: format应包含时间戳
  it('UT-DEFFRM-02: format应包含时间戳', () => {
    // 准备
    const formatter = new DefaultFormatter();
    const timestamp = new Date('2023-01-01T12:00:00Z');
    const entry = createLogEntryFixture({
      timestamp
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    expect(result).toContain('2023-01-01T12:00:00.000Z');
  });

  // UT-DEFFRM-03: format应包含日志级别
  it('UT-DEFFRM-03: format应包含日志级别', () => {
    // 准备
    const formatter = new DefaultFormatter();

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
      expect(result).toContain(`[${name}]`);
    }
  });

  // UT-DEFFRM-04: format应包含上下文信息
  it('UT-DEFFRM-04: format应包含上下文信息', () => {
    // 准备
    const formatter = new DefaultFormatter();
    const context = { userId: '12345', action: 'login', status: 'success' };
    const entry = createLogEntryFixture({
      context
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    expect(result).toContain('"userId":"12345"');
    expect(result).toContain('"action":"login"');
    expect(result).toContain('"status":"success"');
  });

  // UT-DEFFRM-05: format应包含错误信息
  it('UT-DEFFRM-05: format应包含错误信息', () => {
    // 准备
    const formatter = new DefaultFormatter();
    const error = new Error('测试错误');
    const entry = createLogEntryFixture({
      error
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    expect(result).toContain('Error: 测试错误');
    // 错误堆栈应该包含在输出中
    if (error.stack) {
      // 只检查堆栈的第一行，避免测试环境差异
      const firstStackLine = error.stack.split('\n')[0];

      expect(result).toContain(firstStackLine);
    }
  });

  // UT-DEFFRM-06: format应包含调用位置信息
  it('UT-DEFFRM-06: format应包含调用位置信息', () => {
    // 准备
    const formatter = new DefaultFormatter();
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
    expect(result).toContain('TestFile.ts:42');
    expect(result).toContain('TestClass.testFunction');
  });

  // UT-DEFFRM-NEG-01: format应处理缺少时间戳的条目
  it('UT-DEFFRM-NEG-01: format应处理缺少时间戳的条目', () => {
    // 准备
    const formatter = new DefaultFormatter();
    const entry = createLogEntryFixture();

    // @ts-ignore - 故意删除时间戳以测试健壮性
    delete entry.timestamp;

    // 执行
    const result = formatter.format(entry);

    // 验证 - 不应抛出错误，应返回合理的字符串
    expect(result).toContain('[INFO]');
    expect(result).toContain('测试日志消息');
  });

  // UT-DEFFRM-NEG-02: format应处理复杂嵌套上下文
  it('UT-DEFFRM-NEG-02: format应处理复杂嵌套上下文', () => {
    // 准备
    const formatter = new DefaultFormatter();

    // 创建复杂的嵌套上下文
    const complexContext = {
      user: {
        id: '12345',
        profile: {
          name: '测试用户',
          settings: {
            theme: 'dark',
            notifications: true
          }
        }
      },
      session: {
        id: 'sess-123',
        startTime: new Date(),
        data: {
          lastAction: 'update',
          items: [1, 2, 3, 4, 5]
        }
      }
    };

    const entry = createLogEntryFixture({
      context: complexContext
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    expect(result).toContain('"user"');
    expect(result).toContain('"profile"');
    expect(result).toContain('"测试用户"');
    expect(result).toContain('"session"');
    expect(result).toContain('"items"');
  });

  // 额外测试: format应处理循环引用上下文
  it('format应处理循环引用上下文', () => {
    // 准备
    const formatter = new DefaultFormatter();

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

    // 验证 - 不应抛出错误，应包含错误处理信息
    expect(result).toContain('循环引用测试');
    expect(result).toContain('上下文序列化失败');
  });
});
