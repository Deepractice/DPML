/**
 * DefaultProcessor实现
 * 
 * 提供处理器的默认实现
 */

import { Document, Element, Content, Reference, Node, NodeType } from '../types/node';
import { 
  NodeVisitor, 
  Processor, 
  ProcessorOptions, 
  ProcessedDocument,
  ProtocolHandler,
  ReferenceResolver,
  ProcessingContext
} from './interfaces';
import { ProcessingContext as ProcessingContextImpl } from './processingContext';

/**
 * 默认处理器实现
 * 
 * 负责协调所有访问者的执行，以及文档处理流程
 */
export class DefaultProcessor implements Processor {
  /**
   * 注册的访问者列表
   */
  private visitors: NodeVisitor[] = [];
  
  /**
   * 注册的协议处理器列表
   */
  private protocolHandlers: ProtocolHandler[] = [];
  
  /**
   * 引用解析器
   */
  private referenceResolver: ReferenceResolver | null = null;
  
  /**
   * 处理上下文
   */
  private context: ProcessingContext | null = null;
  
  /**
   * 处理选项
   */
  private options: ProcessorOptions = {
    strict: true as any
  };
  
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
   * 配置处理器
   * @param options 配置选项
   */
  configure(options: ProcessorOptions): void {
    this.options = { ...this.options, ...options };
    
    if (options.tagRegistry) {
      this.tagRegistry = options.tagRegistry;
    }
    
    if (options.errorHandler) {
      this.errorHandler = options.errorHandler;
    }
  }
  
  /**
   * 处理文档
   * @param document 待处理的文档
   * @param path 文档路径
   * @returns 处理后的文档
   */
  async process(document: Document, path: string): Promise<Document> {
    // 初始化处理上下文
    this.context = new ProcessingContextImpl(document, path);
    
    // 按优先级排序访问者（从高到低）
    this.sortVisitors();
    
    // 处理文档
    const processedDocument = await this.visitDocument(document, this.context);
    
    return processedDocument;
  }
  
  /**
   * 对访问者进行排序（按优先级从高到低）
   */
  private sortVisitors(): void {
    this.visitors.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  /**
   * 使用所有访问者访问文档
   * @param document 要处理的文档
   * @param context 处理上下文
   * @returns 处理后的文档
   */
  private async visitDocument(document: Document, context: ProcessingContext): Promise<Document> {
    // 使用所有访问者依次处理文档
    let result = document;
    
    for (const visitor of this.visitors) {
      if (visitor.visitDocument) {
        result = await visitor.visitDocument(result, context);
      }
    }
    
    // 处理文档的子节点
    if (result.children && result.children.length > 0) {
      const newChildren = [];
      
      for (const child of result.children) {
        const processedChild = await this.visitNode(child, context);
        if (processedChild) {
          newChildren.push(processedChild);
        }
      }
      
      result = {
        ...result,
        children: newChildren
      };
    }
    
    return result;
  }
  
  /**
   * 处理元素
   * @param element 要处理的元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  private async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
    // 将当前元素添加到父元素栈
    context.parentElements.push(element);
    
    // 使用所有访问者依次处理元素
    let result = element;
    
    for (const visitor of this.visitors) {
      if (visitor.visitElement) {
        result = await visitor.visitElement(result, context);
      }
    }
    
    // 处理元素的子节点
    if (result.children && result.children.length > 0) {
      const newChildren = [];
      
      for (const child of result.children) {
        const processedChild = await this.visitNode(child, context);
        if (processedChild) {
          newChildren.push(processedChild);
        }
      }
      
      result = {
        ...result,
        children: newChildren
      };
    }
    
    // 从父元素栈中移除当前元素
    context.parentElements.pop();
    
    return result;
  }
  
  /**
   * 处理内容节点
   * @param content 要处理的内容节点
   * @param context 处理上下文
   * @returns 处理后的内容节点
   */
  private async visitContent(content: Content, context: ProcessingContext): Promise<Content> {
    // 使用所有访问者依次处理内容节点
    let result = content;
    
    for (const visitor of this.visitors) {
      if (visitor.visitContent) {
        result = await visitor.visitContent(result, context);
      }
    }
    
    return result;
  }
  
  /**
   * 处理引用节点
   * @param reference 要处理的引用节点
   * @param context 处理上下文
   * @returns 处理后的引用节点
   */
  private async visitReference(reference: Reference, context: ProcessingContext): Promise<Reference> {
    // 使用所有访问者依次处理引用节点
    let result = reference;
    
    for (const visitor of this.visitors) {
      if (visitor.visitReference) {
        result = await visitor.visitReference(result, context);
      }
    }
    
    return result;
  }
  
  /**
   * 根据节点类型分发到对应的访问方法
   * @param node 要处理的节点
   * @param context 处理上下文
   * @returns 处理后的节点
   */
  private async visitNode(node: Node, context: ProcessingContext): Promise<Node> {
    switch (node.type) {
      case NodeType.ELEMENT:
        return this.visitElement(node as Element, context);
      case NodeType.CONTENT:
        return this.visitContent(node as Content, context);
      case NodeType.REFERENCE:
        return this.visitReference(node as Reference, context);
      default:
        return node;
    }
  }
} 