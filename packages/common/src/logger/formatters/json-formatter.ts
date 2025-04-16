import { LogLevelNames } from '../core/types';

import type { LogFormatter, LogLevel, LogMeta } from '../core/types';

/**
 * JSON格式化器选项
 */
export interface JsonFormatterOptions {
  /**
   * 是否美化输出的JSON
   * @default false
   */
  pretty?: boolean;

  /**
   * 美化输出时的缩进空格数
   * @default 2
   */
  indent?: number;

  /**
   * 包含元数据
   * @default true
   */
  includeMeta?: boolean;
}

/**
 * JSON格式化器
 * 将日志格式化为JSON格式
 */
export class JsonFormatter implements LogFormatter {
  private pretty: boolean;
  private indent: number;
  private includeMeta: boolean;

  /**
   * 创建JSON格式化器
   */
  constructor(options: JsonFormatterOptions = {}) {
    this.pretty = options.pretty || false;
    this.indent = options.indent || 2;
    this.includeMeta = options.includeMeta !== false;
  }

  /**
   * 格式化日志消息
   */
  format(level: LogLevel, message: string, meta: LogMeta): string {
    const logObject: Record<string, any> = {
      level: LogLevelNames[level],
      message,
    };

    if (this.includeMeta) {
      // 添加元数据，但排除已包含的字段
      Object.entries(meta).forEach(([key, value]) => {
        if (key !== 'level' && key !== 'message') {
          logObject[key] = value;
        }
      });
    }

    return this.pretty
      ? JSON.stringify(logObject, null, this.indent)
      : JSON.stringify(logObject);
  }
}
