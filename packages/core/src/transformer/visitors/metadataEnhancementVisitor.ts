import { BaseVisitor } from './baseVisitor';
import { ProcessedDocument } from '../../processor/interfaces/processor';
import { Element, Content, Reference, NodeType } from '../../types/node';
import { TransformContext } from '../interfaces/transformContext';

/**
 * 元数据提取和增强的转换变量名映射
 */
interface MetadataMappingOptions {
  /**
   * 上下文变量名映射到meta字段名
   * 例如：{ 'outputFormat': 'format' } 会将上下文变量outputFormat映射到meta.format
   */
  variablesToMeta?: Record<string, string>;
  
  /**
   * semantics字段映射到meta字段
   * 例如：{ 'format': 'outputFormat' } 会将semantics.format映射到meta.outputFormat
   */
  semanticsToMeta?: Record<string, string>;
  
  /**
   * 是否自动包含元素属性
   */
  includeElementAttributes?: boolean;
  
  /**
   * 是否添加生成时间戳
   */
  addTimestamp?: boolean;
  
  /**
   * 时间戳字段名
   */
  timestampField?: string;
}

/**
 * 元数据提取和增强访问者
 * 
 * 负责从文档和元素中提取元数据，并将其增强为结构化的meta数据
 */
export class MetadataEnhancementVisitor extends BaseVisitor {
  /**
   * 访问者名称
   */
  name: string = 'metadata-enhancement';
  
  /**
   * 配置选项
   * @private
   */
  private options: MetadataMappingOptions;
  
  /**
   * 构造函数
   * @param priority 优先级，默认为20
   * @param options 配置选项
   */
  constructor(priority: number = 20, options?: MetadataMappingOptions) {
    super(priority);
    
    this.options = {
      variablesToMeta: {
        'outputFormat': 'outputFormat',
        'language': 'language',
        'metaTitle': 'title'
      },
      semanticsToMeta: {
        'format': 'outputFormat'
      },
      includeElementAttributes: true,
      addTimestamp: true,
      timestampField: 'generatedAt',
      ...options
    };
  }
  
  /**
   * 访问文档节点，提取和增强元数据
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 增强了元数据的文档节点
   */
  visitDocument(document: ProcessedDocument, context: TransformContext): ProcessedDocument {
    // 创建新的meta对象，如果已经存在则复制
    if (!document.meta) {
      document.meta = {};
    }
    
    // 从元数据中提取信息
    if (document.metadata) {
      Object.assign(document.meta, document.metadata);
    }
    
    // 从semantics中提取信息
    if (document.semantics) {
      this.extractFromSemantics(document.semantics, document.meta);
    }
    
    // 从上下文变量中提取信息
    this.extractFromContextVariables(context, document.meta);
    
    // 添加时间戳
    if (this.options.addTimestamp) {
      document.meta[this.options.timestampField!] = new Date().toISOString();
    }
    
    // 递归处理子节点
    if (document.children && document.children.length > 0) {
      for (const child of document.children) {
        this.visit(child, context);
      }
    }
    
    return document;
  }
  
  /**
   * 访问元素节点，提取和增强元数据
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 增强了元数据的元素节点
   */
  visitElement(element: Element, context: TransformContext): Element {
    // 确保元素有meta对象
    if (!element.meta) {
      element.meta = {};
    }
    
    // 从元素元数据中提取信息
    if (element.metadata) {
      Object.assign(element.meta, element.metadata);
    }
    
    // 从元素属性中提取信息
    if (this.options.includeElementAttributes && element.attributes) {
      Object.assign(element.meta, element.attributes);
    }
    
    // 递归处理子节点
    if (element.children && element.children.length > 0) {
      for (const child of element.children) {
        this.visit(child, context);
      }
    }
    
    return element;
  }
  
  /**
   * 从semantics中提取信息
   * @param semantics 语义信息
   * @param meta 元数据对象
   * @private
   */
  private extractFromSemantics(semantics: Record<string, any>, meta: Record<string, any>): void {
    // 遍历semantics对象
    for (const [key, value] of Object.entries(semantics)) {
      // 检查是否有映射
      const mappedKey = this.options.semanticsToMeta && this.options.semanticsToMeta[key];
      if (mappedKey) {
        meta[mappedKey] = value;
      } else {
        // 没有映射时直接复制
        meta[key] = value;
      }
    }
  }
  
  /**
   * 从上下文变量中提取信息
   * @param context 转换上下文
   * @param meta 元数据对象
   * @private
   */
  private extractFromContextVariables(context: TransformContext, meta: Record<string, any>): void {
    if (!this.options.variablesToMeta) return;
    
    // 遍历变量映射
    for (const [varName, metaKey] of Object.entries(this.options.variablesToMeta)) {
      if (context.variables[varName] !== undefined) {
        meta[metaKey] = context.variables[varName];
      }
    }
  }
  
  /**
   * 访问内容节点
   * @param content 内容节点
   * @param context 转换上下文
   * @returns 原始内容节点
   */
  visitContent(content: Content, context: TransformContext): Content {
    // 内容节点不需要元数据处理
    return content;
  }
  
  /**
   * 访问引用节点
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 原始引用节点
   */
  visitReference(reference: Reference, context: TransformContext): Reference {
    // 引用节点不需要元数据处理
    return reference;
  }
} 