/**
 * 默认格式化器
 *
 * 提供人类可读的日志格式，包含时间戳、级别、消息、上下文、错误和调用位置信息
 * 格式: [时间] [级别] 消息 {上下文} Error: 错误信息\n堆栈 (at 文件:行 in 类.函数)
 */

import type { LogFormatter, LogEntry } from '../../../types/log';
import { LogLevel } from '../../../types/log';

/**
 * 默认格式化器，提供人类可读的日志格式
 * 格式: [时间] [级别] 消息 {上下文} (位置信息)
 */
export class DefaultFormatter implements LogFormatter {
  /**
   * 将日志条目格式化为字符串
   * @param entry 要格式化的日志条目
   * @returns 格式化后的字符串
   */
  public format(entry: LogEntry): string {
    // 提取日志条目字段，使用可选链和默认值确保健壮性
    const timestamp = entry.timestamp ? entry.timestamp.toISOString() : 'N/A';
    const level = entry.level !== undefined ? LogLevel[entry.level] : 'UNKNOWN';
    const message = entry.message || '';

    // 基础格式: [时间] [级别] 消息
    let result = `[${timestamp}] [${level}] ${message}`;

    // 添加上下文信息
    if (entry.context && Object.keys(entry.context).length > 0) {
      try {
        // 尝试序列化上下文
        result += ` ${JSON.stringify(entry.context)}`;
      } catch (err) {
        // 处理循环引用等JSON序列化问题
        // 直接将上下文中的内容转为字符串形式
        let contextStr = '';

        try {
          // 尝试获取上下文的字符串表示
          contextStr = Object.entries(entry.context)
            .map(([key, value]) => {
              try {
                return `${key}: ${String(value)}`;
              } catch {
                return `${key}: [?]`;
              }
            })
            .join(', ');
          result += ` {${contextStr}} {上下文序列化失败: ${err instanceof Error ? err.message : String(err)}}`;
        } catch (e) {
          // 如果连基本提取都失败，则只显示错误信息
          result += ` {上下文序列化失败: ${err instanceof Error ? err.message : String(err)}}`;
        }
      }
    }

    // 添加错误信息
    if (entry.error) {
      result += ` Error: ${entry.error.message}`;
      if (entry.error.stack) {
        result += `\n${entry.error.stack}`;
      }
    }

    // 添加调用位置信息
    if (entry.caller) {
      result += ` (at ${entry.caller.fileName}:${entry.caller.lineNumber}`;
      if (entry.caller.className && entry.caller.functionName) {
        result += ` in ${entry.caller.className}.${entry.caller.functionName}`;
      } else if (entry.caller.functionName) {
        result += ` in ${entry.caller.functionName}`;
      }

      result += ')';
    }

    return result;
  }
}
