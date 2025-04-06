/**
 * Processor接口
 * 
 * 定义文档处理器的接口
 */

import { Document } from '../../types/node';
import { NodeVisitor } from './nodeVisitor';
import { ProtocolHandler } from './protocolHandler';
import { ReferenceResolver } from './referenceResolver';

/**
 * 处理器选项接口
 */
export interface ProcessorOptions {
  /**
   * 标签注册表
   */
  tagRegistry?: any; // 后续会替换为实际的TagRegistry类型
  
  /**
   * 错误处理器
   */
  errorHandler?: any; // 后续会替换为实际的ErrorHandler类型
  
  /**
   * 是否启用严格模式
   * 默认: false
   */
  strictMode?: boolean;
  
  /**
   * 是否启用错误恢复
   * 默认: false
   * 
   * 当启用错误恢复时，处理器会尽量继续处理文档，
   * 即使遇到非致命错误。
   */
  errorRecovery?: boolean;
  
  /**
   * 错误回调函数
   */
  onError?: (error: Error) => void;
  
  /**
   * 警告回调函数
   */
  onWarning?: (warning: string) => void;
}

/**
 * 已处理文档接口
 * 扩展自基础Document，添加处理后的额外信息
 */
export interface ProcessedDocument extends Document {
  /**
   * 处理元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 处理器接口
 * 负责处理文档的主要组件
 */
export interface Processor {
  /**
   * 注册节点访问者
   * @param visitor 节点访问者
   */
  registerVisitor(visitor: NodeVisitor): void;
  
  /**
   * 注册协议处理器
   * @param handler 协议处理器
   */
  registerProtocolHandler(handler: ProtocolHandler): void;
  
  /**
   * 设置引用解析器
   * @param resolver 引用解析器
   */
  setReferenceResolver(resolver: ReferenceResolver): void;
  
  /**
   * 处理文档
   * @param document 待处理的文档
   * @param path 文档路径，可选
   * @returns 处理后的文档
   */
  process(document: Document, path?: string): Promise<ProcessedDocument>;
  
  /**
   * 配置处理器
   * @param options 配置选项
   */
  configure(options: ProcessorOptions): void;
} 