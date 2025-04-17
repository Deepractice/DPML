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
   * 显示代码位置信息（文件名、行号）
   * @default true
   */
  showCodeLocation?: boolean;

  /**
   * 显示函数名
   * @default true
   */
  showFunctionName?: boolean;

  /**
   * 自定义日期格式化函数
   */
  timestampFormatter?: (date: Date) => string;

  /**
   * 日志模板
   * 可用变量: {timestamp}, {level}, {packageName}, {fileName}, {lineNumber}, {functionName}, {message}
   * @default '[{timestamp}] [{packageName}] [{level}] [{fileName}:{lineNumber}] [{functionName}] {message}'
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
  private showCodeLocation: boolean;
  private showFunctionName: boolean;
  private timestampFormatter: (date: Date) => string;
  private template: string;

  /**
   * 创建文本格式化器
   */
  constructor(options: TextFormatterOptions = {}) {
    this.showTimestamp = options.showTimestamp !== false;
    this.showPackageName = options.showPackageName !== false;
    this.showCodeLocation = options.showCodeLocation !== false;
    this.showFunctionName = options.showFunctionName !== false;
    this.timestampFormatter =
      options.timestampFormatter || (date => date.toISOString());
    this.template =
      options.template || 
      '[{timestamp}] [{packageName}] [{level}] [{fileName}:{lineNumber}] [{functionName}] {message}';
  }

  /**
   * 格式化日志消息
   */
  format(level: LogLevel, message: string, meta: LogMeta): string {
    const timestamp = this.showTimestamp
      ? this.formatTimestamp(meta.timestamp)
      : '';
    const packageName = this.showPackageName ? meta.packageName : '';
    const fileName = this.showCodeLocation && meta.fileName 
      ? this.formatFileName(meta.fileName) 
      : '';
    const lineNumber = this.showCodeLocation && meta.lineNumber 
      ? String(meta.lineNumber) 
      : '';
    const functionName = this.showFunctionName && meta.functionName 
      ? meta.functionName 
      : '';
    const levelStr = LogLevelNames[level];

    let result = this.template
      .replace('{timestamp}', timestamp)
      .replace('{packageName}', packageName)
      .replace('{level}', levelStr)
      .replace('{fileName}', fileName)
      .replace('{lineNumber}', lineNumber)
      .replace('{functionName}', functionName)
      .replace('{message}', message);

    // 清理可能出现的空中括号 [] 
    result = result.replace(/\[\s*\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

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

  /**
   * 格式化文件名（仅保留最后部分，去除路径）
   */
  private formatFileName(fileName: string): string {
    const parts = fileName.split(/[/\\]/);
    return parts[parts.length - 1] || fileName;
  }
}
