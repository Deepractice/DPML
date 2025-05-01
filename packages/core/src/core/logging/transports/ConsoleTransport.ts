/**
 * 控制台传输器
 *
 * 将日志输出到控制台，根据日志级别使用不同的控制台方法。
 * 支持所有日志级别，并提供错误处理。
 */

import type { LogEntry, LogFormatter } from '../../../types/log';
import { LogLevel } from '../../../types/log';

import { BaseTransport } from './BaseTransport';

/**
 * 控制台传输器
 *
 * 将日志输出到控制台，根据日志级别使用不同的console方法：
 * - DEBUG: console.debug
 * - INFO: console.info
 * - WARN: console.warn
 * - ERROR/FATAL: console.error
 * - 其他: console.log
 */
export class ConsoleTransport extends BaseTransport {
  /**
   * 构造函数
   * @param formatter 可选的日志格式化器
   */
  constructor(formatter?: LogFormatter) {
    super(formatter);
  }

  /**
   * 将格式化后的日志写入控制台
   * @param entry 原始日志条目
   * @param formatted 格式化后的日志字符串
   */
  protected writeEntry(entry: LogEntry, formatted: string): void {
    try {
      // 根据日志级别选择适当的控制台方法
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formatted);
          break;
        default:
          console.log(formatted);
      }
    } catch (err) {
      // 处理控制台方法可能抛出的错误
      console.error(`控制台日志输出失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
