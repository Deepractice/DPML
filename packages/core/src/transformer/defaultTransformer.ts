import { ProcessedDocument } from '../processor/interfaces/processor';
import { isDocument, isElement, isContent, isReference } from '../types/node';
import { OutputAdapter } from './interfaces/outputAdapter';
import { Transformer } from './interfaces/transformer';
import { TransformContext } from './interfaces/transformContext';
import { TransformOptions } from './interfaces/transformOptions';
import { TransformerVisitor } from './interfaces/transformerVisitor';
import { ContextManager } from './context/contextManager';
import { Node, Document, Element, Content, Reference } from '../types/node';
// 导入模式配置功能
import { getModeConfig, handleModeError, ModeConfigOptions } from './utils/modeConfig';
// 导入变量配置功能
import { getVariables, resolveVariables, applyVariablesToContext } from './utils/variableConfig';
import { VisitorManager } from './visitor/visitorManager';
import { TransformerOptions } from './interfaces/transformerOptions';
import { DefaultOutputProcessor } from './processors/defaultOutputProcessor';
import { OutputProcessor } from './interfaces/outputProcessor';

// 定义节点类型枚举
enum NodeType {
  DOCUMENT = 'document',
  ELEMENT = 'element',
  CONTENT = 'content',
  REFERENCE = 'reference'
}

// 缓存项定义
interface CacheItem {
  /**
   * 节点标识符
   */
  nodeId: string;
  
  /**
   * 内容哈希，用于验证内容是否变更
   */
  contentHash?: string;
  
  /**
   * 缓存的转换结果
   */
  result: any;
  
  /**
   * 缓存时间
   */
  timestamp?: number;
}

/**
 * 默认转换器实现
 */
export class DefaultTransformer implements Transformer {
  /**
   * 访问者数组
   * 按照优先级排序，优先级高的先被调用
   * @private
   */
  private _visitorManager: VisitorManager;
  
  /**
   * 获取访问者管理器
   * @returns 访问者管理器实例
   */
  get visitorManager(): VisitorManager {
    return this._visitorManager;
  }
  
  /**
   * 输出适配器
   * @private
   */
  private outputAdapter: OutputAdapter;
  
  /**
   * 输出处理器
   * @private
   */
  private outputProcessor: OutputProcessor;
  
  /**
   * 上下文管理器
   * @private
   */
  private contextManager: ContextManager;
  
  /**
   * 选项
   * @private
   */
  private options: TransformerOptions;
  
  /**
   * 模式配置
   * @private
   */
  private modeConfig: any;
  
  /**
   * 缓存映射
   * @private
   */
  private cache: Map<string, CacheItem> = new Map();
  
  /**
   * 构造函数
   * @param options 转换器选项
   */
  constructor(options: TransformerOptions = { mode: 'strict', maxErrorCount: 10 }) {
    this._visitorManager = new VisitorManager(3);
    this.outputAdapter = new DefaultOutputAdapter();
    this.outputProcessor = new DefaultOutputProcessor();
    this.contextManager = new ContextManager();
    this.options = options;
    
    // 初始化模式配置
    this.modeConfig = getModeConfig(this.options);
  }
  
  /**
   * 注册访问者
   * @param visitor 转换访问者
   */
  registerVisitor(visitor: TransformerVisitor): void {
    if (!visitor) {
      console.warn('尝试注册空访问者');
      return;
    }
    
    this._visitorManager.registerVisitor(visitor);
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
   * @param document 文档
   * @param options 转换选项
   * @returns 转换结果
   */
  transform(document: Document, options?: TransformOptions): any {
    // 合并选项
    const mergedOptions = { ...this.options, ...options };
    
    // 检查缓存
    if (mergedOptions.enableCache !== false) {
      const cacheKey = this.getCacheKey(document);
      if (cacheKey) {
        const cachedItem = this.cache.get(cacheKey);
        
        if (cachedItem) {
          // 检查内容哈希是否匹配（确保节点内容未变）
          const currentContentHash = this.generateContentHash(document);
          if (cachedItem.contentHash && cachedItem.contentHash !== currentContentHash) {
            // 内容已变更，缓存无效
            this.cache.delete(cacheKey);
          } else {
            return cachedItem.result;
          }
        }
      }
    }
    
    try {
      // 创建根上下文
      const context = this.contextManager.createRootContext(document, mergedOptions);
      
      // 转换文档
      const result = this.transformNode(document, context);
      
      // 应用适配器
      const adaptedResult = this.applyAdapter(result, context);
      
      // 缓存结果
      if (mergedOptions.enableCache !== false) {
        const cacheKey = this.getCacheKey(document);
        if (cacheKey) {
          const contentHash = this.generateContentHash(document);
          this.cache.set(cacheKey, {
            nodeId: cacheKey,
            contentHash,
            result: adaptedResult,
            timestamp: Date.now()
          });
        }
      }
      
      return adaptedResult;
    } catch (error) {
      // 处理错误
      this.handleTransformError(error, mergedOptions);
      
      // 在严格模式下抛出错误
      if (mergedOptions.mode === 'strict') {
        throw error;
      }
      
      // 在非严格模式下返回尽可能好的结果
      return { error, partial: true };
    }
  }
  
  /**
   * 配置转换器
   * @param options 转换选项
   */
  configure(options: TransformOptions): void {
    this.options = { ...this.options, ...options };
    
    // 更新模式配置
    this.modeConfig = getModeConfig(this.options);
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * 转换节点
   * @param node 节点
   * @param context 上下文
   * @returns 转换结果
   */
  private transformNode(node: any, context: TransformContext): any {
    if (!node) return null;
    
    let transformResult;
    
    // 根据节点类型调用不同的转换方法
    switch (node.type) {
      case 'document':
        transformResult = this.transformDocument(node as Document, context);
        break;
      case 'element':
        transformResult = this.transformElement(node as Element, context);
        break;
      case 'content':
        transformResult = this.transformContent(node as Content, context);
        break;
      case 'reference':
        transformResult = this.transformReference(node as Reference, context);
        break;
      default:
        transformResult = null;
    }
    
    return transformResult;
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
    const hashParts: string[] = [];
    
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
  private transformDocument(document: Document, context: TransformContext): any {
    // 更新上下文路径
    const newContext = this.contextManager.createChildContext(
      context,
      'document'
    );
    
    // 应用所有具有visitDocument方法的访问者
    let result = document;
    const results: any[] = []; // 存储所有访问者的返回值
    
    // 获取具有visitDocument方法的访问者
    const documentVisitors = this._visitorManager.getVisitorsByMethod('visitDocument');
    
    for (const visitor of documentVisitors) {
      try {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        const visitorResult = visitor.visitDocument?.(result, visitorContext);
        
        // 访问者成功执行，重置错误计数
        if (visitor.name) {
          this._visitorManager.resetErrorCount(visitor.name);
        }
        
        if (visitorResult !== null && visitorResult !== undefined) {
          if (context.options.mergeReturnValues) {
            // 收集所有返回值
            results.push(visitorResult);
          } else {
            result = visitorResult;
          }
        }
      } catch (error) {
        this.handleVisitorError(error, visitor, 'document', document.position);
      }
    }
    
    // 处理子节点
    if (result.children && result.children.length > 0) {
      const childResults = result.children.map(child => 
        this.transformNode(child, this.contextManager.createChildContext(newContext, child.type))
      );
      
      // 更新子节点结果
      result = {
        ...result,
        children: childResults.filter(Boolean)
      };
      
      // 合并结果
      if (context.options.mergeReturnValues && results.length > 0) {
        return results;
      }
    }
    
    // 如果使用mergeReturnValues并且有结果，则返回结果数组
    if (context.options.mergeReturnValues && results.length > 0) {
      return results;
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
  private transformElement(element: Element, context: TransformContext): any {
    // 更新上下文路径
    const pathSegment = element.tagName || 'element';
    const newContext = this.contextManager.createChildContext(
      context,
      pathSegment
    );
    
    // 应用所有具有visitElement方法的访问者
    let result = element; // 默认结果为原始元素
    
    // 获取具有visitElement方法的访问者，按照优先级从高到低排序
    const elementVisitors = this._visitorManager.getVisitorsByMethod('visitElement');
    
    // 确保按优先级顺序调用访问者
    for (const visitor of elementVisitors) {
      try {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        
        // 调用访问者的visitElement方法
        const visitorResult = visitor.visitElement?.(result, visitorContext);
        
        // 访问者成功执行，重置错误计数
        if (visitor.name) {
          this._visitorManager.resetErrorCount(visitor.name);
        }
        
        // 如果访问者返回了结果，则更新结果
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
        }
      } catch (error) {
        this.handleVisitorError(error, visitor, 'element', element.position);
      }
    }
    
    // 如果有子节点，递归处理子节点
    if (result.children && result.children.length > 0) {
      const childResults = result.children.map(child => 
        this.transformNode(child, this.contextManager.createChildContext(newContext, child.type))
      );
      
      // 更新子节点结果
      result = {
        ...result,
        children: childResults.filter(Boolean)
      };
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
  private transformContent(content: Content, context: TransformContext): any {
    // 更新上下文路径
    const newContext = this.contextManager.createChildContext(
      context,
      'content'
    );
    
    // 应用所有具有visitContent方法的访问者
    let result = null;
    
    // 获取具有visitContent方法的访问者
    const contentVisitors = this._visitorManager.getVisitorsByMethod('visitContent');
    
    for (const visitor of contentVisitors) {
      try {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        const visitorResult = visitor.visitContent?.(content, visitorContext);
        
        // 访问者成功执行，重置错误计数
        if (visitor.name) {
          this._visitorManager.resetErrorCount(visitor.name);
        }
        
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 使用第一个非空结果
        }
      } catch (error) {
        this.handleVisitorError(error, visitor, 'content', content.position);
      }
    }
    
    return result || content;
  }
  
  /**
   * 转换引用节点
   * @param reference 引用节点
   * @param context 上下文
   * @returns 转换结果
   * @private
   */
  private transformReference(reference: Reference, context: TransformContext): any {
    // 更新上下文路径
    const newContext = this.contextManager.createChildContext(
      context,
      'reference'
    );
    
    // 应用所有具有visitReference方法的访问者
    let result = null;
    
    // 获取具有visitReference方法的访问者
    const referenceVisitors = this._visitorManager.getVisitorsByMethod('visitReference');
    
    for (const visitor of referenceVisitors) {
      try {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        const visitorResult = visitor.visitReference?.(reference, visitorContext);
        
        // 访问者成功执行，重置错误计数
        if (visitor.name) {
          this._visitorManager.resetErrorCount(visitor.name);
        }
        
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 使用第一个非空结果
        }
      } catch (error) {
        this.handleVisitorError(error, visitor, 'reference', reference.position);
      }
    }
    
    return result || reference;
  }
  
  /**
   * 应用输出适配器
   * @param result 转换结果
   * @param context 转换上下文
   * @returns 适配后的结果
   * @private
   */
  private applyAdapter(result: any, context: TransformContext): any {
    if (!this.outputAdapter) {
      return result;
    }
    
    try {
      return this.outputAdapter.adapt(result, context);
    } catch (error) {
      console.error('输出适配器错误:', error);
      
      // 在严格模式下抛出错误
      if (context.options.mode === 'strict') {
        throw error;
      }
      
      // 在非严格模式下返回原始结果
      return result;
    }
  }
  
  /**
   * 处理访问者错误
   * @param error 错误
   * @param visitor 访问者
   * @param nodeType 节点类型
   * @param position 位置信息
   * @private
   */
  private handleVisitorError(
    error: any, 
    visitor: TransformerVisitor, 
    nodeType: string, 
    position?: any
  ): void {
    const visitorName = visitor.name || 'anonymous';
    
    // 增强错误信息
    const enhancedError = this.enhanceError(error, {
      visitorName, 
      nodeType, 
      nodePosition: position
    });
    
    // 增加访问者错误计数
    if (visitor.name) {
      const errorCount = this._visitorManager.incrementErrorCount(visitor.name);
      console.warn(`访问者 ${visitorName} 错误计数: ${errorCount}/${this.modeConfig.errorThreshold}`);
    }
    
    // 记录错误
    console.error(`转换错误: 访问者 ${visitorName} 处理 ${nodeType} 节点时出错:`, enhancedError.message, enhancedError);
  }
  
  /**
   * 处理转换错误
   * @param error 错误
   * @param options 转换选项
   * @private
   */
  private handleTransformError(error: any, options: TransformOptions): void {
    console.error('转换过程中发生错误:', error);
  }
  
  /**
   * 增强错误信息
   * @param error 原始错误
   * @param info 附加信息
   * @returns 增强后的错误
   * @private
   */
  private enhanceError(error: any, info: any): Error {
    if (error instanceof Error) {
      (error as any).visitorInfo = info;
      return error;
    }
    
    const newError = new Error(error?.message || String(error));
    (newError as any).visitorInfo = info;
    (newError as any).originalError = error;
    
    return newError;
  }
  
  /**
   * 生成缓存键
   * @param document 文档
   * @param options 选项
   * @returns 缓存键
   * @private
   */
  private generateCacheKey(document: any, options: TransformOptions): string {
    // 首先尝试使用节点的缓存键
    const nodeKey = this.getCacheKey(document);
    if (nodeKey) {
      return nodeKey;
    }
    
    // 如果没有节点缓存键，使用简单的会话键
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * 禁用指定名称的访问者
   * @param visitorName 访问者名称
   * @returns 是否成功禁用
   */
  disableVisitorByName(visitorName: string): boolean {
    if (!this._visitorManager) {
      console.warn('访问者管理器未初始化');
      return false;
    }
    return this._visitorManager.disableVisitor(visitorName);
  }
  
  /**
   * 启用指定名称的访问者
   * @param visitorName 访问者名称
   * @returns 是否成功启用
   */
  enableVisitorByName(visitorName: string): boolean {
    if (!this._visitorManager) {
      console.warn('访问者管理器未初始化');
      return false;
    }
    return this._visitorManager.enableVisitor(visitorName);
  }

  /**
   * 异步转换文档
   * @param document 文档
   * @param options 转换选项
   * @returns 转换结果的Promise
   */
  async transformAsync(document: Document, options?: TransformOptions): Promise<any> {
    // 合并选项
    const mergedOptions = { ...this.options, ...options };
    
    // 检查缓存
    if (mergedOptions.enableCache !== false) {
      const cacheKey = this.getCacheKey(document);
      if (cacheKey) {
        const cachedItem = this.cache.get(cacheKey);
        
        if (cachedItem) {
          // 检查内容哈希是否匹配（确保节点内容未变）
          const currentContentHash = this.generateContentHash(document);
          if (cachedItem.contentHash && cachedItem.contentHash !== currentContentHash) {
            // 内容已变更，缓存无效
            this.cache.delete(cacheKey);
          } else {
            return cachedItem.result;
          }
        }
      }
    }
    
    try {
      // 创建根上下文
      const context = this.contextManager.createRootContext(document, mergedOptions);
      
      // 转换文档
      const result = await this.transformNodeAsync(document, context);
      
      // 应用适配器
      const adaptedResult = this.applyAdapter(result, context);
      
      // 缓存结果
      if (mergedOptions.enableCache !== false) {
        const cacheKey = this.getCacheKey(document);
        if (cacheKey) {
          const contentHash = this.generateContentHash(document);
          this.cache.set(cacheKey, {
            nodeId: cacheKey,
            contentHash,
            result: adaptedResult,
            timestamp: Date.now()
          });
        }
      }
      
      return adaptedResult;
    } catch (error) {
      // 处理错误
      this.handleTransformError(error, mergedOptions);
      
      // 在严格模式下抛出错误
      if (mergedOptions.mode === 'strict') {
        throw error;
      }
      
      // 在非严格模式下返回尽可能好的结果
      return { error, partial: true };
    }
  }

  /**
   * 异步转换节点
   * @param node 节点
   * @param context 上下文
   * @returns 转换结果的Promise
   * @private
   */
  private async transformNodeAsync(node: any, context: TransformContext): Promise<any> {
    if (!node) return null;
    
    let transformResult;
    
    // 根据节点类型调用不同的转换方法
    switch (node.type) {
      case NodeType.DOCUMENT:
        transformResult = await this.transformDocumentAsync(node as Document, context);
        break;
      case NodeType.ELEMENT:
        transformResult = await this.transformElementAsync(node as Element, context);
        break;
      case NodeType.CONTENT:
        transformResult = await this.transformContentAsync(node as Content, context);
        break;
      case NodeType.REFERENCE:
        transformResult = await this.transformReferenceAsync(node as Reference, context);
        break;
      default:
        transformResult = null;
    }
    
    return transformResult;
  }

  /**
   * 异步转换文档节点
   * @param document 文档节点
   * @param context 上下文
   * @returns 转换结果的Promise
   * @private
   */
  private async transformDocumentAsync(document: Document, context: TransformContext): Promise<any> {
    // 更新上下文路径
    const newContext = this.contextManager.createChildContext(
      context,
      'document'
    );
    
    // 应用所有具有visitDocument方法的访问者
    let result = null;
    const results: any[] = []; // 存储所有访问者的返回值
    
    // 获取具有visitDocument方法的访问者
    const documentVisitors = this._visitorManager.getVisitorsByMethod('visitDocument');
    
    for (const visitor of documentVisitors) {
      try {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        let visitorResult = visitor.visitDocument?.(document, visitorContext);
        
        if (visitorResult instanceof Promise) {
          visitorResult = await visitorResult;
        }
        
        // 访问者成功执行，重置错误计数
        if (visitor.name) {
          this._visitorManager.resetErrorCount(visitor.name);
        }
        
        if (visitorResult !== null && visitorResult !== undefined) {
          if (context.options.mergeReturnValues) {
            // 收集所有返回值
            results.push(visitorResult);
          } else {
            // 不合并，使用第一个非空结果
            result = visitorResult;
            break;
          }
        }
      } catch (error) {
        this.handleVisitorError(error, visitor, 'document', document.position);
      }
    }
    
    // 处理子节点
    if (document.children && document.children.length > 0) {
      const childPromises = document.children.map(child => 
        this.transformNodeAsync(child, this.contextManager.createChildContext(newContext, child.type))
      );
      
      const childResults = await Promise.all(childPromises);
      
      // 合并结果
      if (context.options.mergeReturnValues) {
        return [...results, ...childResults.filter(Boolean)];
      }
    }
    
    return result || document;
  }

  /**
   * 异步转换元素节点
   * @param element 元素节点
   * @param context 上下文
   * @returns 转换结果的Promise
   * @private
   */
  private async transformElementAsync(element: Element, context: TransformContext): Promise<any> {
    // 更新上下文路径
    const pathSegment = element.tagName || 'element';
    const newContext = this.contextManager.createChildContext(
      context,
      pathSegment
    );
    
    // 应用所有具有visitElement方法的访问者
    let result = element; // 默认结果为原始元素
    
    // 获取具有visitElement方法的访问者
    const elementVisitors = this._visitorManager.getVisitorsByMethod('visitElement');
    
    for (const visitor of elementVisitors) {
      try {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        let visitorResult = visitor.visitElement?.(result, visitorContext);
        
        if (visitorResult instanceof Promise) {
          visitorResult = await visitorResult;
        }
        
        // 访问者成功执行，重置错误计数
        if (visitor.name) {
          this._visitorManager.resetErrorCount(visitor.name);
        }
        
        if (visitorResult !== null && visitorResult !== undefined) {
          // 更新结果为访问者返回的结果，传递给下一个访问者
          result = visitorResult;
        }
      } catch (error) {
        this.handleVisitorError(error, visitor, 'element', element.position);
      }
    }
    
    // 处理子节点
    if (result.children && result.children.length > 0) {
      const childPromises = result.children.map(child => 
        this.transformNodeAsync(child, this.contextManager.createChildContext(newContext, child.type))
      );
      
      const childResults = await Promise.all(childPromises);
      
      // 更新子节点结果
      result = {
        ...result,
        children: childResults.filter(Boolean)
      };
    }
    
    return result;
  }

  /**
   * 异步转换内容节点
   * @param content 内容节点
   * @param context 上下文
   * @returns 转换结果的Promise
   * @private
   */
  private async transformContentAsync(content: Content, context: TransformContext): Promise<any> {
    // 更新上下文路径
    const newContext = this.contextManager.createChildContext(
      context,
      'content'
    );
    
    // 应用所有具有visitContent方法的访问者
    let result = null;
    
    // 获取具有visitContent方法的访问者
    const contentVisitors = this._visitorManager.getVisitorsByMethod('visitContent');
    
    for (const visitor of contentVisitors) {
      try {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        let visitorResult = visitor.visitContent?.(content, visitorContext);
        
        if (visitorResult instanceof Promise) {
          visitorResult = await visitorResult;
        }
        
        // 访问者成功执行，重置错误计数
        if (visitor.name) {
          this._visitorManager.resetErrorCount(visitor.name);
        }
        
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 使用第一个非空结果
        }
      } catch (error) {
        this.handleVisitorError(error, visitor, 'content', content.position);
      }
    }
    
    return result || content;
  }

  /**
   * 异步转换引用节点
   * @param reference 引用节点
   * @param context 上下文
   * @returns 转换结果的Promise
   * @private
   */
  private async transformReferenceAsync(reference: Reference, context: TransformContext): Promise<any> {
    // 更新上下文路径
    const newContext = this.contextManager.createChildContext(
      context,
      'reference'
    );
    
    // 应用所有具有visitReference方法的访问者
    let result = null;
    
    // 获取具有visitReference方法的访问者
    const referenceVisitors = this._visitorManager.getVisitorsByMethod('visitReference');
    
    for (const visitor of referenceVisitors) {
      try {
        // 复制上下文，避免干扰其他访问者
        const visitorContext = this.contextManager.cloneContext(newContext);
        let visitorResult = visitor.visitReference?.(reference, visitorContext);
        
        if (visitorResult instanceof Promise) {
          visitorResult = await visitorResult;
        }
        
        // 访问者成功执行，重置错误计数
        if (visitor.name) {
          this._visitorManager.resetErrorCount(visitor.name);
        }
        
        if (visitorResult !== null && visitorResult !== undefined) {
          result = visitorResult;
          break; // 使用第一个非空结果
        }
      } catch (error) {
        this.handleVisitorError(error, visitor, 'reference', reference.position);
      }
    }
    
    return result || reference;
  }
} 