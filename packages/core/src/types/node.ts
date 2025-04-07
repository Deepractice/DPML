/**
 * 节点类型枚举
 */
export enum NodeType {
  DOCUMENT = 'document',
  ELEMENT = 'element',
  CONTENT = 'content',
  REFERENCE = 'reference'
}

/**
 * 源码位置信息
 */
export interface SourcePosition {
  start: {
    line: number;
    column: number;
    offset: number;
  };
  end: {
    line: number;
    column: number;
    offset: number;
  };
}

/**
 * 基础节点接口
 */
export interface Node {
  type: string;
  position: SourcePosition;
}

/**
 * 文档节点接口
 */
export interface Document extends Node {
  type: NodeType.DOCUMENT;
  children: Node[];
}

/**
 * 元素节点接口
 */
export interface Element extends Node {
  type: NodeType.ELEMENT;
  tagName: string;
  attributes: Record<string, any>;
  children: Node[];
  /**
   * 元素元数据
   * 用于存储处理过程中生成的语义信息和其他元数据
   */
  metadata?: Record<string, any>;
  
  /**
   * 元素元数据信息
   * 用于转换和输出过程中的元数据处理
   */
  meta?: Record<string, any>;
}

/**
 * 内容节点接口
 */
export interface Content extends Node {
  type: NodeType.CONTENT;
  value: string;
  meta?: Record<string, any>;
}

/**
 * 引用节点接口
 */
export interface Reference extends Node {
  type: NodeType.REFERENCE;
  protocol: string;
  path: string;
  resolved?: any;
}

/**
 * 检查一个值是否为节点
 */
export function isNode(value: any): value is Node {
  return value !== null && 
         typeof value === 'object' && 
         typeof value.type === 'string' &&
         (
           value.type === NodeType.DOCUMENT ||
           value.type === NodeType.ELEMENT ||
           value.type === NodeType.CONTENT ||
           value.type === NodeType.REFERENCE
         ) &&
         value.position !== undefined;
}

/**
 * 检查一个值是否为文档节点
 */
export function isDocument(value: any): value is Document {
  return isNode(value) && 
         value.type === NodeType.DOCUMENT &&
         Array.isArray((value as any).children);
}

/**
 * 检查一个值是否为元素节点
 */
export function isElement(value: any): value is Element {
  return isNode(value) && 
         value.type === NodeType.ELEMENT &&
         typeof (value as any).tagName === 'string' &&
         typeof (value as any).attributes === 'object' &&
         Array.isArray((value as any).children) &&
         (
           (value as any).metadata === undefined || 
           typeof (value as any).metadata === 'object'
         );
}

/**
 * 检查一个值是否为内容节点
 */
export function isContent(value: any): value is Content {
  return isNode(value) && 
         value.type === NodeType.CONTENT &&
         typeof (value as any).value === 'string';
}

/**
 * 检查一个值是否为引用节点
 */
export function isReference(value: any): value is Reference {
  return isNode(value) && 
         value.type === NodeType.REFERENCE &&
         typeof (value as any).protocol === 'string' &&
         typeof (value as any).path === 'string';
} 