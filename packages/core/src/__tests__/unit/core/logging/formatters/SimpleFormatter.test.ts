/**
 * SimpleFormatter单元测试
 *
 * 测试SimpleFormatter格式化器的功能
 */
import { describe, it, expect } from 'vitest';

import { SimpleFormatter } from '../../../../../core/logging/formatters/SimpleFormatter';
import { LogLevel } from '../../../../../types/log';
import { createLogEntryFixture } from '../../../../fixtures/logging/loggerFixtures';

describe('SimpleFormatter', () => {
  // 基本格式化测试
  it('应以简洁格式格式化日志条目', () => {
    // 准备
    const formatter = new SimpleFormatter();
    const entry = createLogEntryFixture({
      message: '这是一条测试消息'
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    expect(result).toBe('[INFO] 这是一条测试消息');
  });

  // 日志级别格式化测试
  it('应包含日志级别', () => {
    // 准备
    const formatter = new SimpleFormatter();

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
      const result = formatter.format(createLogEntryFixture({
        level,
        message: '测试消息'
      }));

      // 验证
      expect(result).toBe(`[${name}] 测试消息`);
    }
  });

  // 忽略其他字段测试
  it('应忽略时间戳、上下文、错误和调用位置信息', () => {
    // 准备
    const formatter = new SimpleFormatter();
    const entry = createLogEntryFixture({
      message: '简单消息',
      context: { key: 'value' },
      error: new Error('测试错误'),
      caller: {
        fileName: 'test.ts',
        functionName: 'testFunc',
        lineNumber: 42
      }
    });

    // 执行
    const result = formatter.format(entry);

    // 验证 - 只应包含级别和消息
    expect(result).toBe('[INFO] 简单消息');
    expect(result).not.toContain('key');
    expect(result).not.toContain('测试错误');
    expect(result).not.toContain('test.ts');
  });

  // 缺少字段处理测试
  it('应处理缺少消息的日志条目', () => {
    // 准备
    const formatter = new SimpleFormatter();
    const entry = createLogEntryFixture();

    // @ts-ignore - 故意删除消息以测试健壮性
    delete entry.message;

    // 执行
    const result = formatter.format(entry);

    // 验证 - 不应抛出错误，应返回只有级别的字符串
    expect(result).toBe('[INFO] ');
  });

  // 特殊字符处理测试
  it('应正确处理包含特殊字符的消息', () => {
    // 准备
    const formatter = new SimpleFormatter();
    const specialMessage = '包含特殊字符: \n\t\r\b\f\v\'\"\\';
    const entry = createLogEntryFixture({
      message: specialMessage
    });

    // 执行
    const result = formatter.format(entry);

    // 验证
    expect(result).toBe(`[INFO] ${specialMessage}`);
  });
});
