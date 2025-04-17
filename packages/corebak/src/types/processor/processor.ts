/**
 * Processor接口
 *
 * 定义文档处理器的接口
 */

import type { NodeVisitor } from './nodeVisitor';
import type { ProtocolHandler } from './protocolHandler';
import type { ReferenceResolver } from './referenceResolver';
import type { TagProcessor } from './tagProcessor';
import type { TagProcessorRegistry } from './tagProcessorRegistry';
import type { Document } from '../node';

/**
 * 处理器选项接口
 */
export interface ProcessorOptions {
  /**
   * 标签处理器注册表
   * 用于注册和管理标签处理器
   */
  tagProcessorRegistry?: TagProcessorRegistry;

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
   * 文档级元数据
   * 包含处理过程中收集的所有文档级信息
   * 例如：文档类型、版本、处理统计信息、全局配置等
   */
  metadata?: Record<string, any>;

  /**
   * 语义结构
   * 包含经过语义处理后提取的结构化信息
   * 例如：从prompt文档中提取的模型配置、从agent文档中提取的工具定义等
   */
  semantics?: Record<string, any>;

  /**
   * 元数据
   * 用于存储文档的元数据信息，如标题、作者、创建日期等
   * 在转换和输出过程中可能会被使用
   */
  meta?: Record<string, any>;
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
   * 注册标签处理器
   * @param tagName 标签名
   * @param processor 标签处理器
   */
  registerTagProcessor(tagName: string, processor: TagProcessor): void;

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
