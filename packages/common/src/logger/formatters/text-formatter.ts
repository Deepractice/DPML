import { LogLevelNames } from '../core/types';

import type { LogFormatter, LogLevel, LogMeta } from '../core/types';

/**
 * 文本格式化器选项
 */
export interface TextFormatterOptions {
  /**
   * 显示时间戳
   * @default true
   */
  showTimestamp?: boolean;

  /**
   * 显示包名称
   * @default true
   */
  showPackageName?: boolean;

  /**
   * 自定义日期格式化函数
   */
  timestampFormatter?: (date: Date) => string;

  /**
   * 日志模板
   * 可用变量: {timestamp}, {level}, {packageName}, {message}
   * @default '[{timestamp}] [{packageName}] [{level}] {message}'
   */
  template?: string;
}

/**
 * 文本格式化器
 * 将日志格式化为可读的文本格式
 */
export class TextFormatter implements LogFormatter {
  private showTimestamp: boolean;
  private showPackageName: boolean;
  private timestampFormatter: (date: Date) => string;
  private template: string;

  /**
   * 创建文本格式化器
   */
  constructor(options: TextFormatterOptions = {}) {
    this.showTimestamp = options.showTimestamp !== false;
    this.showPackageName = options.showPackageName !== false;
    this.timestampFormatter =
      options.timestampFormatter || (date => date.toISOString());
    this.template =
      options.template || '[{timestamp}] [{packageName}] [{level}] {message}';
  }

  /**
   * 格式化日志消息
   */
  format(level: LogLevel, message: string, meta: LogMeta): string {
    const timestamp = this.showTimestamp
      ? this.formatTimestamp(meta.timestamp)
      : '';
    const packageName = this.showPackageName ? meta.packageName : '';
    const levelStr = LogLevelNames[level];

    const result = this.template
      .replace('{timestamp}', timestamp)
      .replace('{packageName}', packageName)
      .replace('{level}', levelStr)
      .replace('{message}', message);

    return result;
  }

  /**
   * 格式化时间戳
   */
  private formatTimestamp(timestamp: string): string {
    try {
      return this.timestampFormatter(new Date(timestamp));
    } catch (e) {
      return timestamp;
    }
  }
}
