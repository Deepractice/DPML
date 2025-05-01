/**
 * 日志模块测试夹具
 *
 * 该文件包含用于测试DPML日志模块的各种夹具和模拟对象
 */

import type { LogEntry, LoggerConfig, LogFormatter, LogTransport, CallerInfo } from '../../../types/log';
import { LogLevel, Logger } from '../../../types/log';

/**
 * 创建日志条目夹具
 * @param overrides 要覆盖的字段
 * @returns 完整的日志条目对象
 */
export function createLogEntryFixture(overrides?: Partial<LogEntry>): LogEntry {
  return {
    timestamp: new Date(),
    level: LogLevel.INFO,
    message: "测试日志消息",
    context: { module: "test-module" },
    ...overrides
  };
}

/**
 * 创建调用位置信息夹具
 * @param overrides 要覆盖的字段
 * @returns 完整的调用位置信息对象
 */
export function createCallerInfoFixture(overrides?: Partial<CallerInfo>): CallerInfo {
  return {
    fileName: "TestFile.ts",
    functionName: "testFunction",
    lineNumber: 42,
    ...overrides
  };
}

/**
 * 创建日志器配置夹具
 * @param overrides 要覆盖的字段
 * @returns 完整的日志器配置对象
 */
export function createLoggerConfigFixture(overrides?: Partial<LoggerConfig>): LoggerConfig {
  return {
    minLevel: LogLevel.DEBUG,
    transports: [],
    ...overrides
  };
}

/**
 * 模拟传输器类
 * 用于测试日志记录功能
 */
export class MockTransport implements LogTransport {
  public entries: LogEntry[] = [];

  constructor(public throwError: boolean = false) {}

  write(entry: LogEntry): void {
    if (this.throwError) {
      throw new Error("模拟传输器错误");
    }

    this.entries.push({ ...entry });
  }

  clear(): void {
    this.entries = [];
  }

  getEntries(): LogEntry[] {
    return this.entries;
  }
}

/**
 * 模拟格式化器类
 * 用于测试日志格式化功能
 */
export class MockFormatter implements LogFormatter {
  constructor(public throwError: boolean = false) {}

  format(entry: LogEntry): string {
    if (this.throwError) {
      throw new Error("模拟格式化器错误");
    }

    return `[${LogLevel[entry.level]}] ${entry.message}`;
  }
}
