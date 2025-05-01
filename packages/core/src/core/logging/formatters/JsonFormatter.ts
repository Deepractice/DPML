/**
 * JSON格式化器
 *
 * 将日志条目转换为JSON格式，适用于结构化日志分析
 */

import type { LogFormatter, LogEntry } from '../../../types/log';
import { LogLevel } from '../../../types/log';

/**
 * JSON格式化器，将日志条目转换为JSON格式
 * 适用于结构化日志分析和机器处理
 */
export class JsonFormatter implements LogFormatter {
  /**
   * 将日志条目格式化为JSON字符串
   * @param entry 要格式化的日志条目
   * @returns 格式化后的JSON字符串
   */
  public format(entry: LogEntry): string {
    // 创建基本格式化对象
    const formatted: Record<string, unknown> = {
      timestamp: entry.timestamp ? entry.timestamp.toISOString() : null,
      level: entry.level !== undefined ? LogLevel[entry.level] : 'UNKNOWN',
      message: entry.message || ''
    };

    // 添加上下文（如果存在）
    if (entry.context) {
      formatted.context = entry.context;
    }

    // 处理错误对象（如果存在）
    if (entry.error) {
      formatted.error = {
        message: entry.error.message,
        stack: entry.error.stack
      };
    }

    // 添加调用位置（如果存在）
    if (entry.caller) {
      formatted.caller = entry.caller;
    }

    try {
      // 尝试序列化完整对象
      return JSON.stringify(formatted);
    } catch (err) {
      // 处理循环引用等序列化问题
      // 创建一个简化版本，确保能够序列化

      // 尝试提取上下文中的基本信息
      const safeContext: Record<string, unknown> = {};

      if (entry.context) {
        try {
          // 尝试复制上下文中的顶级属性
          for (const key of Object.keys(entry.context)) {
            try {
              // 尝试获取属性值的字符串表示
              const value = entry.context[key];

              if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                safeContext[key] = value;
              } else {
                safeContext[key] = '[复杂对象]';
              }
            } catch (e) {
              safeContext[key] = '[无法访问]';
            }
          }
        } catch (e) {
          // 如果连基本提取都失败，则忽略上下文
        }
      }

      return JSON.stringify({
        timestamp: formatted.timestamp,
        level: formatted.level,
        message: formatted.message,
        context: Object.keys(safeContext).length > 0 ? safeContext : undefined,
        error: `序列化失败`
      });
    }
  }
}
