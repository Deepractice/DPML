/**
 * 安全日志记录器
 * 
 * 提供安全的日志记录功能，确保日志中不包含敏感信息
 */

import { InputSanitizer } from './InputSanitizer';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * 日志选项
 */
export interface LogOptions {
  /**
   * 是否开启日志
   */
  enabled?: boolean;
  
  /**
   * 最低日志级别
   */
  minLevel?: LogLevel;
  
  /**
   * 是否检查敏感信息
   */
  checkSensitiveData?: boolean;
  
  /**
   * 自定义日志输出函数
   */
  logFn?: (level: LogLevel, message: string, meta?: any) => void;
}

/**
 * 安全日志记录器类
 */
export class SecureLogger {
  /**
   * 默认选项
   */
  private readonly options: LogOptions;
  
  /**
   * 构造函数
   * @param options 日志选项
   */
  constructor(options: LogOptions = {}) {
    this.options = {
      enabled: true,
      minLevel: LogLevel.INFO,
      checkSensitiveData: true,
      logFn: undefined,
      ...options
    };
  }
  
  /**
   * 记录调试级别的日志
   * @param message 日志消息
   * @param meta 元数据
   */
  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, message, meta);
  }
  
  /**
   * 记录信息级别的日志
   * @param message 日志消息
   * @param meta 元数据
   */
  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }
  
  /**
   * 记录警告级别的日志
   * @param message 日志消息
   * @param meta 元数据
   */
  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }
  
  /**
   * 记录错误级别的日志
   * @param message 日志消息
   * @param meta 元数据
   */
  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta);
  }
  
  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param meta 元数据
   */
  log(level: LogLevel, message: string, meta?: any): void {
    // 检查是否启用日志
    if (!this.options.enabled) {
      return;
    }
    
    // 检查日志级别
    if (!this.shouldLog(level)) {
      return;
    }
    
    // 清理消息中的敏感信息
    const safeMessage = this.sanitizeLogMessage(message);
    
    // 清理元数据中的敏感信息
    const safeMeta = meta ? this.sanitizeLogMetadata(meta) : undefined;
    
    // 使用指定的日志函数或默认函数
    if (this.options.logFn) {
      this.options.logFn(level, safeMessage, safeMeta);
    } else {
      this.defaultLogFunction(level, safeMessage, safeMeta);
    }
  }
  
  /**
   * 检查是否应该记录指定级别的日志
   * @param level 日志级别
   * @returns 是否应该记录
   */
  private shouldLog(level: LogLevel): boolean {
    const levelOrder = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3
    };
    
    return levelOrder[level] >= levelOrder[this.options.minLevel as LogLevel];
  }
  
  /**
   * 默认日志输出函数
   * @param level 日志级别
   * @param message 日志消息
   * @param meta 元数据
   */
  private defaultLogFunction(level: LogLevel, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    
    // 根据级别选择控制台方法
    let consoleFn: (...args: any[]) => void;
    switch (level) {
      case LogLevel.DEBUG:
        consoleFn = console.debug;
        break;
      case LogLevel.INFO:
        consoleFn = console.info;
        break;
      case LogLevel.WARN:
        consoleFn = console.warn;
        break;
      case LogLevel.ERROR:
        consoleFn = console.error;
        break;
      default:
        consoleFn = console.log;
    }
    
    // 输出日志
    if (meta) {
      consoleFn(`[${timestamp}] [${level.toUpperCase()}]`, message, meta);
    } else {
      consoleFn(`[${timestamp}] [${level.toUpperCase()}]`, message);
    }
  }
  
  /**
   * 净化日志消息
   * @param message 日志消息
   * @returns 安全的日志消息
   */
  private sanitizeLogMessage(message: string): string {
    if (!message) {
      return '';
    }
    
    // 如果启用了敏感信息检查，移除敏感信息
    if (this.options.checkSensitiveData) {
      return InputSanitizer.removeSensitiveData(message);
    }
    
    return message;
  }
  
  /**
   * 净化日志元数据
   * @param meta 元数据
   * @returns 安全的元数据
   */
  private sanitizeLogMetadata(meta: any): any {
    if (!meta) {
      return undefined;
    }
    
    // 如果不是对象，直接返回
    if (typeof meta !== 'object') {
      return meta;
    }
    
    // 如果是数组，递归处理每个元素
    if (Array.isArray(meta)) {
      return meta.map(item => this.sanitizeLogMetadata(item));
    }
    
    // 深度复制对象
    const result: any = {};
    
    for (const key in meta) {
      // 跳过敏感字段
      if (this.isSensitiveKey(key)) {
        result[key] = '********';
        continue;
      }
      
      const value = meta[key];
      
      // 递归处理嵌套对象
      if (typeof value === 'object' && value !== null) {
        result[key] = this.sanitizeLogMetadata(value);
      } 
      // 处理字符串值
      else if (typeof value === 'string' && this.options.checkSensitiveData) {
        result[key] = InputSanitizer.removeSensitiveData(value);
      } 
      // 其他类型保持不变
      else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * 检查键名是否敏感
   * @param key 键名
   * @returns 是否敏感
   */
  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      /^api.?key$/i,
      /^auth.?token$/i,
      /^access.?token$/i,
      /^secret$/i,
      /^password$/i,
      /^credential/i,
      /^private.?key$/i
    ];
    
    return sensitiveKeys.some(pattern => pattern.test(key));
  }
} 