import { LogLevel, LogMeta, LogTransport } from '../core/types';

/**
 * 内存日志条目结构
 */
export interface MemoryLogEntry {
  level: LogLevel;
  message: string;
  meta: LogMeta;
  timestamp: string;
}

/**
 * 内存传输选项
 */
export interface MemoryTransportOptions {
  /**
   * 最大记录条数
   * @default 100
   */
  maxSize?: number;
}

/**
 * 内存传输实现
 * 将日志存储在内存中，主要用于测试或需要程序内访问日志的场景
 */
export class MemoryTransport implements LogTransport {
  private logs: MemoryLogEntry[] = [];
  private maxSize: number;
  
  /**
   * 创建内存传输
   */
  constructor(options: MemoryTransportOptions = {}) {
    this.maxSize = options.maxSize || 100;
  }
  
  /**
   * 记录日志到内存
   */
  log(level: LogLevel, message: string, meta: LogMeta): void {
    const entry: MemoryLogEntry = {
      level,
      message,
      meta: { ...meta },
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(entry);
    
    // 如果超过最大容量，移除最旧的记录
    if (this.logs.length > this.maxSize) {
      this.logs.shift();
    }
  }
  
  /**
   * 返回此传输是否异步
   */
  isAsync(): boolean {
    return false;
  }
  
  /**
   * 获取所有日志记录
   */
  getLogs(): MemoryLogEntry[] {
    return [...this.logs];
  }
  
  /**
   * 获取特定级别的日志记录
   */
  getLogsByLevel(level: LogLevel): MemoryLogEntry[] {
    return this.logs.filter(entry => entry.level === level);
  }
  
  /**
   * 清空日志记录
   */
  clear(): void {
    this.logs = [];
  }
} 