/**
 * 简单格式化器
 *
 * 提供简洁的日志格式，只包含级别和消息
 * 格式: [级别] 消息
 */

import type { LogFormatter, LogEntry } from '../../../types/log';
import { LogLevel } from '../../../types/log';

/**
 * 简单格式化器，提供简洁的日志格式
 * 格式: [级别] 消息
 * 适用于空间受限场景或需要最小化日志输出的情况
 */
export class SimpleFormatter implements LogFormatter {
  /**
   * 将日志条目格式化为简洁字符串
   * @param entry 要格式化的日志条目
   * @returns 格式化后的字符串
   */
  public format(entry: LogEntry): string {
    // 提取日志级别和消息，使用默认值确保健壮性
    const level = entry.level !== undefined ? LogLevel[entry.level] : 'UNKNOWN';
    const message = entry.message || '';

    // 返回简洁格式: [级别] 消息
    return `[${level}] ${message}`;
  }
}
