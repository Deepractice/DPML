/**
 * 基础传输器抽象类
 *
 * 提供日志传输器共用功能，包括格式化和错误处理。
 * 所有具体传输器类应继承此类并实现特定的输出逻辑。
 */

import type { LogEntry, LogFormatter, LogTransport } from '../../../types/log';

/**
 * 基础传输器抽象类
 * 实现LogTransport接口，并提供通用的格式化和错误处理功能。
 * 子类只需实现writeEntry方法，定义如何将格式化后的日志写入到目标位置。
 */
export abstract class BaseTransport implements LogTransport {
  /**
   * 格式化器，用于将日志条目转换为字符串
   */
  protected formatter?: LogFormatter;

  /**
   * 构造函数
   * @param formatter 可选的日志格式化器
   */
  constructor(formatter?: LogFormatter) {
    this.formatter = formatter;
  }

  /**
   * 写入日志条目
   * 实现LogTransport接口的write方法
   * @param entry 要写入的日志条目
   */
  public write(entry: LogEntry): void {
    try {
      // 使用格式化器将日志条目转换为字符串
      let formatted: string;

      if (this.formatter) {
        formatted = this.formatter.format(entry);
      } else {
        // 如果没有格式化器，使用默认的简单格式
        formatted = `[${new Date().toISOString()}] [${this.getLevelName(entry.level)}] ${entry.message}`;
      }

      // 调用子类实现的writeEntry方法
      this.writeEntry(entry, formatted);
    } catch (err) {
      // 处理错误，避免传输器问题影响应用程序
      console.error(`日志传输失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * 获取日志级别的字符串表示
   * @param level 日志级别数值
   * @returns 日志级别名称
   */
  protected getLevelName(level: number): string {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

    return levels[level] || 'UNKNOWN';
  }

  /**
   * 抽象方法，由子类实现将格式化后的日志写入目标位置
   * @param entry 原始日志条目
   * @param formatted 格式化后的日志字符串
   */
  protected abstract writeEntry(entry: LogEntry, formatted: string): void;
}
