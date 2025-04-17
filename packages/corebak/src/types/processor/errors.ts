/**
 * 处理器错误类型定义
 */

import type { SourcePosition } from '../node';

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
  FATAL = 'fatal',
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
 * 错误处理配置选项
 */
export interface ErrorHandlerOptions {
  /**
   * 是否启用严格模式
   * 默认: false
   */
  strictMode?: boolean;

  /**
   * 是否启用错误恢复
   * 默认: false
   */
  errorRecovery?: boolean;

  /**
   * 错误回调函数
   */
  onError?: (error: any) => void;

  /**
   * 警告回调函数
   */
  onWarning?: (warning: any) => void;
}
