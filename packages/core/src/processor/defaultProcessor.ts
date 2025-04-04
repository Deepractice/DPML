/**
 * DefaultProcessor实现
 * 
 * 提供处理器的默认实现
 */

import { Document, isDocument, isElement, isContent, isReference } from '../types/node';
import { 
  NodeVisitor, 
  Processor, 
  ProcessorOptions, 
  ProcessedDocument,
  ProtocolHandler,
  ReferenceResolver,
  ProcessingContext
} from './interfaces';

/**
 * 默认处理器实现
 */
export class DefaultProcessor implements Processor {
  /**
   * 访问者列表
   */
  private visitors: NodeVisitor[] = [];
  
  /**
   * 协议处理器列表
   */
  private protocolHandlers: ProtocolHandler[] = [];
  
  /**
   * 引用解析器
   */
  private referenceResolver?: ReferenceResolver;
  
  /**
   * 标签注册表
   */
  private tagRegistry: any;
  
  /**
   * 错误处理器
   */
  private errorHandler: any;
  
  /**
   * 构造函数
   * @param options 处理器选项
   */
  constructor(options?: ProcessorOptions) {
    if (options) {
      this.configure(options);
    }
  }
  
  /**
   * 注册节点访问者
   * @param visitor 节点访问者
   */
  registerVisitor(visitor: NodeVisitor): void {
    this.visitors.push(visitor);
    // 按照优先级从高到低排序
    this.visitors.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  /**
   * 注册协议处理器
   * @param handler 协议处理器
   */
  registerProtocolHandler(handler: ProtocolHandler): void {
    this.protocolHandlers.push(handler);
  }
  
  /**
   * 设置引用解析器
   * @param resolver 引用解析器
   */
  setReferenceResolver(resolver: ReferenceResolver): void {
    this.referenceResolver = resolver;
  }
  
  /**
   * 处理文档
   * @param document 待处理的文档
   * @returns 处理后的文档
   */
  async process(document: Document): Promise<ProcessedDocument> {
    if (!isDocument(document)) {
      throw new Error('传入的文档不是有效的Document节点');
    }
    
    // 创建处理上下文
    const context: ProcessingContext = {
      document,
      currentPath: '',
      resolvedReferences: new Map(),
      parentElements: [],
      variables: {},
      idMap: new Map()
    };
    
    // 处理文档节点
    const processedDocument = await this.processNode(document, context) as Document;
    
    // 添加元数据
    const result: ProcessedDocument = {
      ...processedDocument,
      metadata: {
        processingTime: new Date().toISOString()
      }
    };
    
    return result;
  }
  
  /**
   * 配置处理器
   * @param options 配置选项
   */
  configure(options: ProcessorOptions): void {
    if (options.tagRegistry) {
      this.tagRegistry = options.tagRegistry;
    }
    
    if (options.errorHandler) {
      this.errorHandler = options.errorHandler;
    }
  }
  
  /**
   * 处理节点
   * @param node 待处理的节点
   * @param context 处理上下文
   * @returns 处理后的节点
   * @private
   */
  private async processNode(node: any, context: ProcessingContext): Promise<any> {
    try {
      let result = node;
      
      // 根据节点类型应用不同的访问者方法
      if (isDocument(node)) {
        // 处理文档节点
        for (const visitor of this.visitors) {
          if (visitor.visitDocument) {
            result = await visitor.visitDocument(result, context);
          }
        }
        
        // 递归处理子节点
        if (result.children && result.children.length > 0) {
          const newChildren = [];
          for (const child of result.children) {
            newChildren.push(await this.processNode(child, context));
          }
          result = {
            ...result,
            children: newChildren
          };
        }
      } else if (isElement(node)) {
        // 向上下文中添加当前元素作为父元素
        context.parentElements.push(node);
        
        // 处理元素节点
        for (const visitor of this.visitors) {
          if (visitor.visitElement) {
            result = await visitor.visitElement(result, context);
          }
        }
        
        // 递归处理子节点
        if (result.children && result.children.length > 0) {
          const newChildren = [];
          for (const child of result.children) {
            newChildren.push(await this.processNode(child, context));
          }
          result = {
            ...result,
            children: newChildren
          };
        }
        
        // 从父元素栈中移除当前元素
        context.parentElements.pop();
      } else if (isContent(node)) {
        // 处理内容节点
        for (const visitor of this.visitors) {
          if (visitor.visitContent) {
            result = await visitor.visitContent(result, context);
          }
        }
      } else if (isReference(node)) {
        // 处理引用节点
        for (const visitor of this.visitors) {
          if (visitor.visitReference) {
            result = await visitor.visitReference(result, context);
          }
        }
      }
      
      return result;
    } catch (error) {
      // 处理错误
      if (this.errorHandler) {
        this.errorHandler.handleError(error);
      }
      
      throw error;
    }
  }
} 