/**
 * 处理上下文实现
 */
import { Document, Element } from '../types/node';
import { ProcessingContext as ProcessingContextInterface, ResolvedReference } from './interfaces';

/**
 * 处理上下文类
 * 
 * 提供处理过程中所需的状态和上下文信息
 */
export class ProcessingContext implements ProcessingContextInterface {
  /** 当前正在处理的文档 */
  public document: Document;
  
  /** 当前文档的路径 */
  public currentPath: string;
  
  /** 已解析的引用缓存 */
  public resolvedReferences: Map<string, ResolvedReference>;
  
  /** 元素处理过程中的父元素栈 */
  public parentElements: Element[];
  
  /** 处理过程中的变量存储 */
  public variables: Record<string, any>;
  
  /**
   * 创建新的处理上下文
   * 
   * @param document 要处理的文档
   * @param currentPath 文档的路径
   */
  constructor(document: Document, currentPath: string) {
    this.document = document;
    this.currentPath = currentPath;
    this.resolvedReferences = new Map<string, ResolvedReference>();
    this.parentElements = [];
    this.variables = {};
  }
} 