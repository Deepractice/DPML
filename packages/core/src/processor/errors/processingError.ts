/**
 * 处理错误基类
 * 
 * 提供处理过程中统一的错误类型
 */

import { SourcePosition } from '../../types/node';

/**
 * 处理错误严重级别
 */
export enum ErrorSeverity {
  /**
   * 警告 - 不会中断处理流程
   */
  WARNING = 'warning',
  
  /**
   * 错误 - 在严格模式下会中断处理
   */
  ERROR = 'error',
  
  /**
   * 致命错误 - 总是中断处理流程
   */
  FATAL = 'fatal'
}

/**
 * 处理错误选项
 */
export interface ProcessingErrorOptions {
  /**
   * 错误消息
   */
  message: string;
  
  /**
   * 错误位置
   */
  position?: SourcePosition;
  
  /**
   * 文件路径
   */
  filePath?: string;
  
  /**
   * 错误严重级别
   */
  severity?: ErrorSeverity;
  
  /**
   * 错误码
   */
  code?: string;
  
  /**
   * 原始错误
   */
  cause?: Error;
}

/**
 * 处理错误类
 * 
 * 用于统一表示处理过程中的错误，包含位置和文件路径信息
 */
export class ProcessingError extends Error {
  /**
   * 错误位置
   */
  public position?: SourcePosition;
  
  /**
   * 文件路径
   */
  public filePath?: string;
  
  /**
   * 错误严重级别
   */
  public severity: ErrorSeverity;
  
  /**
   * 错误码
   */
  public code?: string;
  
  /**
   * 原始错误
   */
  public cause?: Error;
  
  /**
   * 构造函数
   * @param options 错误选项
   */
  constructor(options: ProcessingErrorOptions) {
    // 构造基础错误消息
    super(options.message);
    
    // 设置错误名称
    this.name = 'ProcessingError';
    
    // 设置错误属性
    this.position = options.position;
    this.filePath = options.filePath;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.code = options.code;
    this.cause = options.cause;
    
    // 捕获堆栈跟踪
    // Node.js 特性，浏览器环境可能不支持
    // @ts-ignore
    if (Error.captureStackTrace) {
      // @ts-ignore
      Error.captureStackTrace(this, ProcessingError);
    }
  }
  
  /**
   * 获取格式化的错误信息
   * 包含位置和文件信息
   */
  public getFormattedMessage(): string {
    // 基础错误信息
    let message = this.message;
    
    // 添加文件信息
    if (this.filePath) {
      message = `${message} (文件: ${this.filePath})`;
    }
    
    // 添加位置信息
    if (this.position) {
      message = `${message} (位置: 第${this.position.start.line}行, 第${this.position.start.column}列)`;
    }
    
    // 添加错误码
    if (this.code) {
      message = `[${this.code}] ${message}`;
    }
    
    // 添加严重级别
    message = `${this.severity.toUpperCase()}: ${message}`;
    
    return message;
  }
  
  /**
   * 判断错误是否为致命错误
   */
  public isFatal(): boolean {
    return this.severity === ErrorSeverity.FATAL;
  }
  
  /**
   * 转换为警告级别错误
   */
  public asWarning(): ProcessingError {
    this.severity = ErrorSeverity.WARNING;
    return this;
  }
  
  /**
   * 转换为错误级别
   */
  public asError(): ProcessingError {
    this.severity = ErrorSeverity.ERROR;
    return this;
  }
  
  /**
   * 转换为致命错误级别
   */
  public asFatal(): ProcessingError {
    this.severity = ErrorSeverity.FATAL;
    return this;
  }
} 