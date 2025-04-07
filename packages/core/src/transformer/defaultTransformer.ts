import { ProcessedDocument } from '../processor/interfaces/processor';
import { isDocument, isElement, isContent, isReference } from '../types/node';
import { OutputAdapter } from './interfaces/outputAdapter';
import { Transformer } from './interfaces/transformer';
import { TransformContext } from './interfaces/transformContext';
import { TransformOptions } from './interfaces/transformOptions';
import { TransformerVisitor } from './interfaces/transformerVisitor';

/**
 * 默认转换器实现
 */
export class DefaultTransformer implements Transformer {
  /**
   * 访问者数组
   * @private
   */
  private visitors: TransformerVisitor[] = [];
  
  /**
   * 输出适配器
   * @private
   */
  private outputAdapter?: OutputAdapter;
  
  /**
   * 转换选项
   * @private
   */
  private options: TransformOptions = {};
  
  /**
   * 默认优先级
   * @private
   */
  private static readonly DEFAULT_PRIORITY = 0;
  
  /**
   * 注册访问者
   * @param visitor 访问者
   */
  registerVisitor(visitor: TransformerVisitor): void {
    this.visitors.push(visitor);
    // 注册后重新排序
    this.sortVisitors();
  }
  
  /**
   * 设置输出适配器
   * @param adapter 适配器
   */
  setOutputAdapter(adapter: OutputAdapter): void {
    this.outputAdapter = adapter;
  }
  
  /**
   * 转换文档
   * @param document 处理后的文档
   * @param options 转换选项
   * @returns 转换结果
   */
  transform(document: ProcessedDocument, options?: TransformOptions): any {
    // 合并选项
    const mergedOptions: TransformOptions = {
      ...this.options,
      ...(options || {})
    };
    
    // 确保访问者已排序
    this.sortVisitors();
    
    // 创建上下文
    const context: TransformContext = {
      output: {},
      document,
      options: mergedOptions,
      variables: {},
      path: [],
      parentResults: []
    };
    
    // 转换文档
    let result = this.transformNode(document, context);
    
    // 应用适配器(如果有)
    if (this.outputAdapter) {
      result = this.outputAdapter.adapt(result, context);
    }
    
    return result;
  }
  
  /**
   * 配置转换器
   * @param options 配置选项
   */
  configure(options: TransformOptions): void {
    this.options = { ...options };
  }
  
  /**
   * 排序访问者
   * 按优先级从高到低排序，优先级相同的保持注册顺序
   * @private
   */
  private sortVisitors(): void {
    // 使用稳定排序，保证同优先级的访问者保持注册顺序
    this.visitors.sort((a, b) => {
      const priorityA = a.priority ?? DefaultTransformer.DEFAULT_PRIORITY;
      const priorityB = b.priority ?? DefaultTransformer.DEFAULT_PRIORITY;
      return priorityB - priorityA; // 从高到低排序
    });
  }
  
  /**
   * 转换节点
   * @param node 节点
   * @param context 上下文
   * @returns 转换结果
   * @private
   */
  private transformNode(node: any, context: TransformContext): any {
    if (isDocument(node)) {
      return this.transformDocument(node, context);
    } else if (isElement(node)) {
      return this.transformElement(node, context);
    } else if (isContent(node)) {
      return this.transformContent(node, context);
    } else if (isReference(node)) {
      return this.transformReference(node, context);
    }
    
    // 不支持的节点类型，直接返回
    return null;
  }
  
  /**
   * 转换文档节点
   * @param document 文档节点
   * @param context 上下文
   * @returns 转换结果
   * @private
   */
  private transformDocument(document: ProcessedDocument, context: TransformContext): any {
    // 更新上下文路径
    const newContext = {
      ...context,
      path: [...context.path, 'document']
    };
    
    // 应用所有具有visitDocument方法的访问者
    let result = null;
    
    for (const visitor of this.visitors) {
      if (visitor.visitDocument) {
        const visitorResult = visitor.visitDocument(document, newContext);
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 第一个返回非空结果的访问者将决定结果
        }
      }
    }
    
    return result;
  }
  
  /**
   * 转换元素节点
   * @param element 元素节点
   * @param context 上下文
   * @returns 转换结果
   * @private
   */
  private transformElement(element: any, context: TransformContext): any {
    // 更新上下文路径
    const newContext = {
      ...context,
      path: [...context.path, `element[${element.tagName}]`]
    };
    
    // 应用所有具有visitElement方法的访问者
    let result = null;
    
    for (const visitor of this.visitors) {
      if (visitor.visitElement) {
        const visitorResult = visitor.visitElement(element, newContext);
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 第一个返回非空结果的访问者将决定结果
        }
      }
    }
    
    return result;
  }
  
  /**
   * 转换内容节点
   * @param content 内容节点
   * @param context 上下文
   * @returns 转换结果
   * @private
   */
  private transformContent(content: any, context: TransformContext): any {
    // 更新上下文路径
    const newContext = {
      ...context,
      path: [...context.path, 'content']
    };
    
    // 应用所有具有visitContent方法的访问者
    let result = null;
    
    for (const visitor of this.visitors) {
      if (visitor.visitContent) {
        const visitorResult = visitor.visitContent(content, newContext);
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 第一个返回非空结果的访问者将决定结果
        }
      }
    }
    
    return result;
  }
  
  /**
   * 转换引用节点
   * @param reference 引用节点
   * @param context 上下文
   * @returns 转换结果
   * @private
   */
  private transformReference(reference: any, context: TransformContext): any {
    // 更新上下文路径
    const newContext = {
      ...context,
      path: [...context.path, `reference[${reference.protocol}]`]
    };
    
    // 应用所有具有visitReference方法的访问者
    let result = null;
    
    for (const visitor of this.visitors) {
      if (visitor.visitReference) {
        const visitorResult = visitor.visitReference(reference, newContext);
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 第一个返回非空结果的访问者将决定结果
        }
      }
    }
    
    return result;
  }
} 