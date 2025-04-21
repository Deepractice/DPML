import { DPMLNode } from './DPMLNode';

/**
 * DPML文档类型
 * 表示完整DPML文档的纯数据结构
 */
export interface DPMLDocument {
  /** 文档根节点 */
  readonly rootNode: DPMLNode;
  
  /** 节点ID索引，用于快速访问 */
  readonly nodesById?: Map<string, DPMLNode>;
  
  /** 文档元数据 */
  readonly metadata: DocumentMetadata;
}

/**
 * 文档元数据类型
 */
export interface DocumentMetadata {
  /** 文档标题 */
  title?: string;
  
  /** 文档描述 */
  description?: string;
  
  /** 创建时间 */
  createdAt?: Date;
  
  /** 最后修改时间 */
  modifiedAt?: Date;
  
  /** 来源文件名 */
  sourceFileName?: string;
  
  /** 用户自定义元数据 */
  custom?: Record<string, unknown>;
} 