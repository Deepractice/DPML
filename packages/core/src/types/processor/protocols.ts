/**
 * 协议处理器类型定义
 */

import type { ProcessingContext } from './processingContext';

/**
 * ID协议处理器上下文
 */
export interface IdProtocolHandlerContext {
  /**
   * 处理上下文
   */
  processingContext: ProcessingContext;
}

/**
 * 文件协议处理器选项
 */
export interface FileProtocolHandlerOptions {
  /**
   * 基础目录，用于解析相对路径
   */
  baseDir?: string;
}

/**
 * HTTP协议处理器选项
 */
export interface HttpProtocolHandlerOptions {
  /**
   * 请求超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 是否允许不安全的HTTPS连接
   */
  allowInsecure?: boolean;
}

/**
 * 默认引用解析器选项
 */
export interface DefaultReferenceResolverOptions {
  /**
   * 默认协议处理器
   */
  defaultProtocolHandlers?: any[];

  /**
   * 是否使用缓存
   */
  useCache?: boolean;
} 