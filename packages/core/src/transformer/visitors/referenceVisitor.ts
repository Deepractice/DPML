import { TransformerVisitor } from '../interfaces/transformerVisitor';
import { TransformContext } from '../interfaces/transformContext';
import { NodeType, Reference } from '../../types/node';

/**
 * 引用格式化处理函数，用于将引用转换为特定格式
 */
export type ReferenceFormatter = (reference: Reference, context: TransformContext) => any;

/**
 * 引用访问者配置选项
 */
export interface ReferenceVisitorOptions {
  /**
   * 格式化规则，按照协议名称指定格式化函数
   */
  formatRules?: Record<string, ReferenceFormatter>;
  
  /**
   * 默认引用格式化函数，当没有找到特定协议的格式化函数时使用
   */
  defaultFormatter?: ReferenceFormatter;
  
  /**
   * 是否在链接上添加引用信息
   */
  addReferenceInfo?: boolean;
  
  /**
   * 是否递归处理嵌套引用
   */
  processNestedReferences?: boolean;
}

/**
 * 引用访问者
 * 
 * 负责处理已解析的引用，将其转换为适当的链接或其他格式。
 * 支持以下功能：
 * 1. 针对不同协议的引用应用不同的格式化规则
 * 2. 处理嵌套引用
 * 3. 处理未解析的引用
 * 4. 支持异步处理引用内容
 */
export class ReferenceVisitor implements TransformerVisitor {
  /**
   * 访问者名称
   */
  readonly name: string = 'reference';
  
  /**
   * 访问者优先级
   */
  priority: number;
  
  /**
   * 配置选项
   */
  private options: ReferenceVisitorOptions;
  
  /**
   * 格式化处理器映射
   */
  private formatters: Record<string, ReferenceFormatter>;
  
  /**
   * 构造函数
   * @param priority 优先级，默认为25，位于ElementVisitor(20)之后，ContentVisitor(30)之前
   * @param options 配置选项
   */
  constructor(priority: number = 25, options: ReferenceVisitorOptions = {}) {
    this.priority = priority;
    this.options = {
      formatRules: {},
      addReferenceInfo: true,
      processNestedReferences: true,
      ...options
    };
    
    // 初始化格式化器
    this.formatters = {
      // 内置格式化器
      'id': this.formatIdReference.bind(this),
      'file': this.formatFileReference.bind(this),
      'http': this.formatHttpReference.bind(this),
      'https': this.formatHttpsReference.bind(this),
      // 自定义格式化器
      ...this.options.formatRules
    };
  }
  
  /**
   * 获取访问者优先级
   * @returns 优先级数值
   */
  getPriority(): number {
    return this.priority;
  }
  
  /**
   * 访问节点（通用入口）
   * @param node 要访问的节点
   * @param context 转换上下文
   * @returns 处理后的节点
   */
  visit(node: any, context: TransformContext): any {
    if (!node) {
      return null;
    }
    
    // 只处理引用节点
    if (node.type === NodeType.REFERENCE) {
      return this.visitReference(node as Reference, context);
    }
    
    // 其他节点类型保持不变
    return node;
  }
  
  /**
   * 异步访问节点
   * @param node 要访问的节点
   * @param context 转换上下文
   * @returns 处理后的节点Promise
   */
  async visitAsync(node: any, context: TransformContext): Promise<any> {
    if (!node) {
      return null;
    }
    
    // 只处理引用节点
    if (node.type === NodeType.REFERENCE) {
      return this.visitReferenceAsync(node as Reference, context);
    }
    
    // 其他节点类型保持不变
    return node;
  }
  
  /**
   * 访问引用节点
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 格式化后的引用
   */
  visitReference(reference: Reference, context: TransformContext): any {
    // 处理未解析的引用
    if (!reference.resolved) {
      return this.handleUnresolvedReference(reference);
    }
    
    // 获取适当的格式化器
    const formatter = this.getFormatter(reference.protocol);
    
    // 格式化引用
    let result = formatter(reference, context);
    
    // 处理嵌套引用
    if (this.options.processNestedReferences) {
      result = this.processNestedReferences(result, context);
    }
    
    // 添加引用信息（如果配置了）
    if (this.options.addReferenceInfo) {
      result = this.addReferenceInfo(result, reference);
    }
    
    return result;
  }
  
  /**
   * 异步访问引用节点
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 格式化后的引用Promise
   */
  async visitReferenceAsync(reference: Reference, context: TransformContext): Promise<any> {
    // 处理未解析的引用
    if (!reference.resolved) {
      return this.handleUnresolvedReference(reference);
    }
    
    // 获取适当的格式化器
    const formatter = this.getFormatter(reference.protocol);
    
    // 格式化引用
    let result = formatter(reference, context);
    
    // 处理异步数据
    result = await this.processAsyncData(result);
    
    // 处理嵌套引用
    if (this.options.processNestedReferences) {
      result = await this.processNestedReferencesAsync(result, context);
    }
    
    // 添加引用信息（如果配置了）
    if (this.options.addReferenceInfo) {
      result = this.addReferenceInfo(result, reference);
    }
    
    return result;
  }
  
  /**
   * 获取特定协议的格式化器
   * @param protocol 协议名称
   * @returns 格式化函数
   */
  private getFormatter(protocol: string): ReferenceFormatter {
    // 获取指定协议的格式化器，如果没有则使用默认格式化器
    return this.formatters[protocol] || 
           this.options.defaultFormatter || 
           this.formatDefaultReference.bind(this);
  }
  
  /**
   * 处理嵌套引用（同步）
   * @param content 内容对象
   * @param context 转换上下文
   * @returns 处理后的内容
   */
  private processNestedReferences(content: any, context: TransformContext): any {
    if (!content || typeof content !== 'object') {
      return content;
    }
    
    // 处理数组
    if (Array.isArray(content)) {
      return content.map(item => this.processNestedReferences(item, context));
    }
    
    // 处理对象中的引用数组
    if (content.references && Array.isArray(content.references)) {
      content.references = content.references.map((ref: any) => {
        if (ref && ref.type === NodeType.REFERENCE) {
          return this.visitReference(ref, context);
        }
        return ref;
      });
    }
    
    // 处理对象的其他属性
    const result = { ...content };
    for (const key in result) {
      if (key !== 'references' && typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.processNestedReferences(result[key], context);
      }
    }
    
    return result;
  }
  
  /**
   * 处理嵌套引用（异步）
   * @param content 内容对象
   * @param context 转换上下文
   * @returns 处理后的内容Promise
   */
  private async processNestedReferencesAsync(content: any, context: TransformContext): Promise<any> {
    if (!content || typeof content !== 'object') {
      return content;
    }
    
    // 处理数组
    if (Array.isArray(content)) {
      return Promise.all(content.map(item => this.processNestedReferencesAsync(item, context)));
    }
    
    // 处理对象中的引用数组
    if (content.references && Array.isArray(content.references)) {
      content.references = await Promise.all(content.references.map(async (ref: any) => {
        if (ref && ref.type === NodeType.REFERENCE) {
          return this.visitReferenceAsync(ref, context);
        }
        return ref;
      }));
    }
    
    // 处理对象的其他属性
    const result = { ...content };
    for (const key in result) {
      if (key !== 'references' && typeof result[key] === 'object' && result[key] !== null) {
        result[key] = await this.processNestedReferencesAsync(result[key], context);
      }
    }
    
    return result;
  }
  
  /**
   * 处理异步数据
   * @param content 内容对象
   * @returns 处理后的内容Promise
   */
  private async processAsyncData(content: any): Promise<any> {
    if (!content || typeof content !== 'object') {
      return content;
    }
    
    // 处理数组
    if (Array.isArray(content)) {
      return Promise.all(content.map(item => this.processAsyncData(item)));
    }
    
    // 处理对象的各个属性
    const result = { ...content };
    const asyncKeys: string[] = [];
    
    // 找出所有包含Promise的属性
    for (const key in result) {
      if (result[key] instanceof Promise) {
        asyncKeys.push(key);
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = await this.processAsyncData(result[key]);
      }
    }
    
    // 等待所有Promise解析完成
    if (asyncKeys.length > 0) {
      const resolvedValues = await Promise.all(asyncKeys.map(key => result[key]));
      asyncKeys.forEach((key, index) => {
        // 将Promise的解析结果合并到结果对象中
        if (typeof resolvedValues[index] === 'object' && resolvedValues[index] !== null) {
          result[key] = resolvedValues[index];
          // 展开解析后的对象，将其属性添加到顶层
          if (!(resolvedValues[index] instanceof Array)) {
            Object.assign(result, resolvedValues[index]);
          }
        } else {
          result[key] = resolvedValues[index];
        }
      });
    }
    
    return result;
  }
  
  /**
   * 添加引用信息
   * @param content 内容对象
   * @param reference 原始引用
   * @returns 添加了引用信息的内容
   */
  private addReferenceInfo(content: any, reference: Reference): any {
    if (!content || typeof content !== 'object') {
      return content;
    }
    
    // 添加引用信息
    return {
      ...content,
      isReference: true,
      referenceProtocol: reference.protocol,
      referencePath: reference.path
    };
  }
  
  /**
   * 处理未解析的引用
   * @param reference 未解析的引用
   * @returns 处理结果
   */
  private handleUnresolvedReference(reference: Reference): any {
    // 创建一个带有错误标记的链接
    return {
      type: 'link',
      href: this.formatHref(reference.protocol, reference.path),
      unresolved: true,
      error: 'Reference not resolved',
      protocol: reference.protocol,
      path: reference.path
    };
  }
  
  /**
   * 格式化引用链接
   * @param protocol 协议
   * @param path 路径
   * @returns 格式化后的链接
   */
  private formatHref(protocol: string, path: string): string {
    switch (protocol) {
      case 'id':
        return `#${path}`;
      case 'file':
        return path;
      case 'http':
        return `http://${path}`;
      case 'https':
        return `https://${path}`;
      default:
        return `${protocol}:${path}`;
    }
  }
  
  /**
   * 格式化ID类型引用
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 格式化后的引用
   */
  private formatIdReference(reference: Reference, context: TransformContext): any {
    const { resolved } = reference;
    
    return {
      type: 'link',
      href: `#${reference.path}`,
      content: resolved?.content || '',
      title: resolved?.title || '',
      isInternal: true,
      ...resolved
    };
  }
  
  /**
   * 格式化文件类型引用
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 格式化后的引用
   */
  private formatFileReference(reference: Reference, context: TransformContext): any {
    const { resolved } = reference;
    
    return {
      type: 'link',
      href: reference.path,
      content: resolved?.content || '',
      title: resolved?.title || '',
      isExternal: true,
      isFile: true,
      ...resolved
    };
  }
  
  /**
   * 格式化HTTP类型引用
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 格式化后的引用
   */
  private formatHttpReference(reference: Reference, context: TransformContext): any {
    const { resolved } = reference;
    
    return {
      type: 'link',
      href: `http://${reference.path}`,
      content: resolved?.content || '',
      title: resolved?.title || '',
      isExternal: true,
      isRemote: true,
      ...resolved
    };
  }
  
  /**
   * 格式化HTTPS类型引用
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 格式化后的引用
   */
  private formatHttpsReference(reference: Reference, context: TransformContext): any {
    const { resolved } = reference;
    
    return {
      type: 'link',
      href: `https://${reference.path}`,
      content: resolved?.content || '',
      title: resolved?.title || '',
      isExternal: true,
      isRemote: true,
      isSecure: true,
      ...resolved
    };
  }
  
  /**
   * 默认引用格式化
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 格式化后的引用
   */
  private formatDefaultReference(reference: Reference, context: TransformContext): any {
    const { resolved } = reference;
    
    return {
      type: 'link',
      href: `${reference.protocol}:${reference.path}`,
      content: resolved?.content || '',
      title: resolved?.title || '',
      protocol: reference.protocol,
      ...resolved
    };
  }
} 