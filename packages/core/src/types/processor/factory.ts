/**
 * 处理器工厂类型定义
 */

import type { ProcessorOptions } from './processor';

/**
 * 处理器工厂选项
 */
export interface ProcessorFactoryOptions extends ProcessorOptions {
  /**
   * 是否注册基础访问者
   */
  registerBaseVisitors?: boolean;

  /**
   * 是否注册基础协议处理器
   */
  registerBaseProtocolHandlers?: boolean;

  /**
   * 是否注册标签处理器访问者
   */
  registerTagProcessorVisitor?: boolean;

  /**
   * 是否使用严格模式
   */
  strictMode?: boolean;
} 