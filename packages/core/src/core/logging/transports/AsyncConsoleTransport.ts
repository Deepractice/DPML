/**
 * 异步控制台传输器
 *
 * 将日志异步输出到控制台，通过队列和批处理机制提高性能。
 * 适用于高频日志记录场景，减少对主线程的阻塞。
 */

import type { LogEntry, LogFormatter } from '../../../types/log';

import { BaseTransport } from './BaseTransport';
import { ConsoleTransport } from './ConsoleTransport';

/**
 * 异步控制台传输器
 *
 * 特点：
 * - 将日志条目添加到内存队列
 * - 定期批量处理队列中的日志
 * - 减少高频日志场景下对主线程的影响
 * - 提供手动刷新机制，确保关键日志立即输出
 */
export class AsyncConsoleTransport extends BaseTransport {
  /**
   * 日志队列
   */
  private queue: LogEntry[] = [];

  /**
   * 是否正在处理日志的标志
   */
  private isProcessing: boolean = false;

  /**
   * 刷新间隔（毫秒）
   */
  private flushInterval: number;

  /**
   * 控制台传输器实例，用于实际输出日志
   */
  private consoleTransport: ConsoleTransport;

  /**
   * 构造函数
   * @param flushIntervalMs 刷新间隔（毫秒），默认为1000ms
   * @param formatter 可选的日志格式化器
   */
  constructor(flushIntervalMs: number = 1000, formatter?: LogFormatter) {
    super(formatter);
    this.flushInterval = flushIntervalMs;
    this.consoleTransport = new ConsoleTransport(formatter);
  }

  /**
   * 将日志条目添加到队列
   * @param entry 原始日志条目
   * @param formatted 格式化后的日志字符串
   */
  protected writeEntry(entry: LogEntry, formatted: string): void {
    // 添加日志条目到队列
    this.queue.push({ ...entry }); // 复制日志条目以避免引用问题

    // 如果尚未启动处理循环，则启动
    if (!this.isProcessing) {
      this.isProcessing = true;
      setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * 刷新队列中的日志
   * @param sync 是否同步刷新，如果为true则立即处理所有日志
   * @returns 返回Promise以支持异步操作
   */
  public async flush(sync: boolean = false): Promise<void> {
    // 如果队列为空，不需要处理
    if (this.queue.length === 0) {
      this.isProcessing = false;

      return;
    }

    // 复制并清空队列
    const entries = [...this.queue];

    this.queue = [];

    // 处理所有日志条目
    for (const entry of entries) {
      try {
        this.consoleTransport.write(entry);
      } catch (err) {
        // 处理单条日志输出时的错误，但继续处理其他日志
        console.error(`异步日志处理失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 如果队列为空或要求同步刷新，则结束处理循环
    if (this.queue.length === 0 || sync) {
      this.isProcessing = false;
    } else {
      // 否则继续处理新添加的日志
      setTimeout(() => this.flush(), this.flushInterval);
    }
  }
}
