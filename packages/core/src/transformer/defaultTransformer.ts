import { ProcessedDocument } from '../processor/interfaces/processor';
import { isDocument, isElement, isContent, isReference } from '../types/node';
import { OutputAdapter } from './interfaces/outputAdapter';
import { Transformer } from './interfaces/transformer';
import { TransformContext } from './interfaces/transformContext';
import { TransformOptions } from './interfaces/transformOptions';
import { TransformerVisitor } from './interfaces/transformerVisitor';
import { ContextManager } from './context/contextManager';

/**
 * 节点缓存项
 */
interface CacheItem {
  /**
   * 节点的唯一标识符
   */
  nodeId: string;
  
  /**
   * 节点的哈希值或内容签名
   */
  contentHash?: string;
  
  /**
   * 缓存的转换结果
   */
  result: any;
}

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
   * 缓存映射
   * @private
   */
  private cache: Map<string, CacheItem> = new Map();
  
  /**
   * 上下文管理器
   * @private
   */
  private contextManager: ContextManager = new ContextManager();
  
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
    
    // 创建根上下文
    const context = this.contextManager.createRootContext(document, mergedOptions);
    
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
    
    // 如果禁用缓存，清除缓存
    if (options.enableCache === false) {
      this.clearCache();
    }
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
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
   */
  transformNode(node: any, context: TransformContext): any {
    // 检查是否启用缓存
    const enableCache = context.options.enableCache === true;
    
    if (enableCache) {
      // 尝试从缓存获取结果
      const cachedResult = this.getCachedResult(node);
      if (cachedResult !== undefined) {
        return cachedResult;
      }
    }
    
    // 没有缓存或缓存未命中，执行转换
    let result: any;
    
    if (isDocument(node)) {
      result = this.transformDocument(node, context);
    } else if (isElement(node)) {
      result = this.transformElement(node, context);
    } else if (isContent(node)) {
      result = this.transformContent(node, context);
    } else if (isReference(node)) {
      result = this.transformReference(node, context);
    } else {
      // 不支持的节点类型，直接返回
      return null;
    }
    
    // 如果启用缓存，将结果存入缓存
    if (enableCache && result !== null && result !== undefined) {
      this.cacheResult(node, result);
    }
    
    return result;
  }
  
  /**
   * 获取节点的缓存键
   * @param node 节点
   * @returns 缓存键
   * @private
   */
  private getCacheKey(node: any): string | undefined {
    // 如果节点有ID，直接使用
    if (node.id) {
      return `id:${node.id}`;
    }
    
    // 生成内容哈希作为键
    // 简单实现，实际中可能需要更复杂的哈希算法
    return this.generateContentHash(node);
  }
  
  /**
   * 生成节点内容哈希
   * @param node 节点
   * @returns 内容哈希
   * @private
   */
  private generateContentHash(node: any): string | undefined {
    if (!node) return undefined;
    
    // 根据节点类型和内容生成简单哈希
    let hashParts: string[] = [];
    
    // 添加节点类型
    hashParts.push(`type:${node.type}`);
    
    // 添加标签名（如果是元素）
    if (node.tagName) {
      hashParts.push(`tag:${node.tagName}`);
    }
    
    // 添加内容（如果有）
    if (node.content) {
      hashParts.push(`content:${node.content}`);
    }
    
    // 添加引用协议（如果是引用）
    if (node.protocol) {
      hashParts.push(`protocol:${node.protocol}`);
    }
    
    // 添加位置信息
    if (node.position) {
      hashParts.push(`pos:${node.position.start.line}-${node.position.end.line}`);
    }
    
    // 添加元数据的版本信息（如果有）
    if (node.meta && node.meta.version) {
      hashParts.push(`ver:${node.meta.version}`);
    }
    
    // 合并所有部分
    return hashParts.join('|');
  }
  
  /**
   * 从缓存获取结果
   * @param node 节点
   * @returns 缓存的结果或undefined（未命中）
   * @private
   */
  private getCachedResult(node: any): any {
    const cacheKey = this.getCacheKey(node);
    if (!cacheKey) return undefined;
    
    const cachedItem = this.cache.get(cacheKey);
    if (!cachedItem) return undefined;
    
    // 检查内容哈希是否匹配（确保节点内容未变）
    const currentContentHash = this.generateContentHash(node);
    if (cachedItem.contentHash && cachedItem.contentHash !== currentContentHash) {
      // 内容已变更，缓存无效
      this.cache.delete(cacheKey);
      return undefined;
    }
    
    return cachedItem.result;
  }
  
  /**
   * 缓存转换结果
   * @param node 节点
   * @param result 转换结果
   * @private
   */
  private cacheResult(node: any, result: any): void {
    const cacheKey = this.getCacheKey(node);
    if (!cacheKey) return;
    
    const contentHash = this.generateContentHash(node);
    
    // 存储缓存项
    this.cache.set(cacheKey, {
      nodeId: cacheKey,
      contentHash,
      result
    });
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
    const newContext = this.contextManager.createChildContext(
      context,
      'document'
    );
    
    // 应用所有具有visitDocument方法的访问者
    let result = null;
    
    for (const visitor of this.visitors) {
      if (visitor.visitDocument) {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        const visitorResult = visitor.visitDocument(document, visitorContext);
        
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 第一个返回非空结果的访问者将决定结果
        }
      }
    }
    
    // 如果有结果，则处理子节点
    if (result !== null && document.children && document.children.length > 0) {
      // 创建包含当前节点结果的上下文
      const childContext = this.contextManager.addResult(newContext, result);
      
      // 处理子节点，存储结果
      const childResults = document.children.map((child: any) => 
        this.transformNode(child, childContext)
      ).filter((childResult: any) => childResult !== null && childResult !== undefined);
      
      // 如果有子节点结果，并且结果对象有children属性，则添加子节点结果
      if (childResults.length > 0 && typeof result === 'object') {
        result.children = childResults;
      }
    }
    // 如果没有访问者处理文档节点，但有子节点
    else if (result === null && document.children && document.children.length > 0) {
      // 处理子节点
      const childResults = document.children.map((child: any) => 
        this.transformNode(child, newContext)
      ).filter((childResult: any) => childResult !== null && childResult !== undefined);
      
      // 如果子节点有结果，创建默认文档结果
      if (childResults.length > 0) {
        result = {
          type: 'document',
          children: childResults
        };
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
    const newContext = this.contextManager.createChildContext(
      context,
      `element[${element.tagName}]`
    );
    
    // 应用所有具有visitElement方法的访问者
    let result = null;
    
    for (const visitor of this.visitors) {
      if (visitor.visitElement) {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        const visitorResult = visitor.visitElement(element, visitorContext);
        
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 第一个返回非空结果的访问者将决定结果
        }
      }
    }
    
    // 如果有结果，则处理子节点
    if (result !== null && element.children && element.children.length > 0) {
      // 创建包含当前节点结果的上下文
      const childContext = this.contextManager.addResult(newContext, result);
      
      // 处理子节点，存储结果
      const childResults = element.children.map((child: any) => 
        this.transformNode(child, childContext)
      ).filter((childResult: any) => childResult !== null && childResult !== undefined);
      
      // 如果有子节点结果，并且结果对象有children属性，则添加子节点结果
      if (childResults.length > 0 && typeof result === 'object') {
        result.children = childResults;
      }
    }
    // 如果没有访问者处理元素节点，但有子节点
    else if (result === null && element.children && element.children.length > 0) {
      // 处理子节点
      const childResults = element.children.map((child: any) => 
        this.transformNode(child, newContext)
      ).filter((childResult: any) => childResult !== null && childResult !== undefined);
      
      // 如果子节点有结果，创建默认元素结果
      if (childResults.length > 0) {
        result = {
          type: 'element',
          tagName: element.tagName,
          children: childResults
        };
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
    const newContext = this.contextManager.createChildContext(
      context,
      'content'
    );
    
    // 应用所有具有visitContent方法的访问者
    let result = null;
    
    for (const visitor of this.visitors) {
      if (visitor.visitContent) {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        const visitorResult = visitor.visitContent(content, visitorContext);
        
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          // 注意：内容节点没有子节点，不需要更新父结果链
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
    const newContext = this.contextManager.createChildContext(
      context,
      `reference[${reference.protocol}]`
    );
    
    // 应用所有具有visitReference方法的访问者
    let result = null;
    
    for (const visitor of this.visitors) {
      if (visitor.visitReference) {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        const visitorResult = visitor.visitReference(reference, visitorContext);
        
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          // 注意：引用节点没有子节点，不需要更新父结果链
          break; // 第一个返回非空结果的访问者将决定结果
        }
      }
    }
    
    return result;
  }
  
  /**
   * 处理节点的子节点
   * 将子节点的转换结果作为数组返回
   * @param node 包含子节点的节点
   * @param context 上下文
   * @returns 子节点转换结果数组
   * @private
   */
  processChildren(node: any, context: TransformContext): any[] {
    if (!node.children || node.children.length === 0) {
      return [];
    }
    
    return node.children.map((child: any) => 
      this.transformNode(child, context)
    ).filter((result: any) => result !== null && result !== undefined);
  }
} 