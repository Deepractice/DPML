import { TransformerVisitor } from '../interfaces/transformerVisitor';
import { TransformContext } from '../interfaces/transformContext';
import { Element, NodeType, Node } from '../../types/node';

/**
 * 元素特殊处理器类型
 * 用于处理特定标签的元素
 */
export type ElementProcessor = (
  element: Element, 
  context: TransformContext
) => Element | Promise<Element>;

/**
 * 属性转换器类型
 * 用于转换特定属性值
 */
export type AttributeConverter = (
  value: string, 
  attributeName: string, 
  element: Element
) => any;

/**
 * 元素访问者配置选项
 */
export interface ElementVisitorOptions {
  /**
   * 是否收集元数据
   * 当设置为true时，指定的属性会被收集到元素的meta对象中
   * 默认为false
   */
  collectMetadata?: boolean;

  /**
   * 要收集为元数据的属性列表
   */
  metadataAttributes?: string[];

  /**
   * 是否转换数值属性
   * 当设置为true时，指定的属性会被转换为数值类型
   * 默认为false
   */
  convertNumericAttributes?: boolean;

  /**
   * 数值类型属性列表
   */
  numericAttributes?: string[];

  /**
   * 是否转换布尔属性
   * 当设置为true时，指定的属性会被转换为布尔类型
   * 默认为false
   */
  convertBooleanAttributes?: boolean;

  /**
   * 布尔类型属性列表
   */
  booleanAttributes?: string[];

  /**
   * 属性转换器映射
   * 键为属性名，值为转换函数
   */
  attributeConverters?: Record<string, AttributeConverter>;

  /**
   * 特殊元素处理器映射
   * 键为标签名，值为处理函数
   */
  specialElements?: Record<string, ElementProcessor>;

  /**
   * 是否处理类名
   * 当设置为true时，class属性会被解析为classNames数组
   * 默认为false
   */
  processClassNames?: boolean;

  /**
   * 是否递归处理子元素
   * 默认为true
   */
  processChildren?: boolean;
}

/**
 * 元素访问者
 * 
 * 负责处理元素节点，包括属性转换、元数据收集等
 */
export class ElementVisitor implements TransformerVisitor {
  /**
   * 访问者名称
   */
  readonly name: string = 'element';
  
  /**
   * 访问者优先级
   */
  priority: number;
  
  /**
   * 配置选项
   */
  private options: ElementVisitorOptions;
  
  /**
   * 构造函数
   * @param priority 优先级，默认为20
   * @param options 配置选项
   */
  constructor(
    priority: number = 20,
    options: ElementVisitorOptions = {}
  ) {
    this.priority = priority;
    this.options = {
      collectMetadata: false,
      metadataAttributes: [],
      convertNumericAttributes: false,
      numericAttributes: [],
      convertBooleanAttributes: false,
      booleanAttributes: [],
      attributeConverters: {},
      specialElements: {},
      processClassNames: false,
      processChildren: true,
      ...options
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
   * 通用访问方法
   * @param node 要访问的节点
   * @param context 转换上下文
   * @returns 处理后的节点
   */
  visit(node: any, context: TransformContext): any {
    if (!node) {
      return null;
    }
    
    if (node.type === NodeType.DOCUMENT) {
      return this.visitDocument(node, context);
    } else if (node.type === NodeType.ELEMENT) {
      return this.visitElement(node, context);
    }
    
    // 其他类型节点原样返回
    return node;
  }
  
  /**
   * 异步通用访问方法
   * @param node 要访问的节点
   * @param context 转换上下文
   * @returns 处理后的节点Promise
   */
  async visitAsync(node: any, context: TransformContext): Promise<any> {
    return this.visit(node, context);
  }
  
  /**
   * 访问文档节点
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 处理后的文档节点
   */
  async visitDocument(document: any, context: TransformContext): Promise<any> {
    // 文档节点自身不需处理，但需递归处理其子节点
    if (document.children && document.children.length > 0) {
      for (let i = 0; i < document.children.length; i++) {
        const child = document.children[i];
        document.children[i] = await this.visit(child, context);
      }
    }
    
    return document;
  }
  
  /**
   * 访问元素节点
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 处理后的元素节点
   */
  async visitElement(element: Element, context: TransformContext): Promise<Element> {
    // 先深拷贝元素，避免修改原始数据
    let processedElement = { ...element };
    
    // 处理属性转换
    processedElement = this.processAttributes(processedElement);
    
    // 收集元数据
    if (this.options.collectMetadata) {
      processedElement = this.collectMetadata(processedElement);
    }
    
    // 处理类名
    if (this.options.processClassNames) {
      processedElement = this.processClassNames(processedElement);
    }
    
    // 应用特殊元素处理器
    if (this.options.specialElements && this.options.specialElements[element.tagName]) {
      try {
        const processor = this.options.specialElements[element.tagName];
        const result = processor(processedElement, context);
        
        if (result instanceof Promise) {
          processedElement = await result;
        } else {
          processedElement = result;
        }
      } catch (error) {
        console.error(`Error processing element ${element.tagName}:`, error);
      }
    }
    
    // 递归处理子元素
    if (this.options.processChildren && processedElement.children) {
      for (let i = 0; i < processedElement.children.length; i++) {
        const child = processedElement.children[i];
        if (child.type === NodeType.ELEMENT) {
          const processedChild = await this.visitElement(child as Element, context);
          processedElement.children[i] = processedChild;
        }
      }
    }
    
    return processedElement;
  }
  
  /**
   * 处理元素属性
   * @param element 元素
   * @returns 处理后的元素
   * @private
   */
  private processAttributes(element: Element): Element {
    if (!element.attributes) {
      return element;
    }
    
    const attributes = { ...element.attributes };
    
    // 转换数值属性
    if (this.options.convertNumericAttributes && this.options.numericAttributes) {
      for (const attrName of this.options.numericAttributes) {
        if (attrName in attributes && attributes[attrName]) {
          const value = attributes[attrName];
          if (typeof value === 'string') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              attributes[attrName] = numValue;
            }
          }
        }
      }
    }
    
    // 转换布尔属性
    if (this.options.convertBooleanAttributes && this.options.booleanAttributes) {
      for (const attrName of this.options.booleanAttributes) {
        if (attrName in attributes) {
          const value = attributes[attrName];
          if (value === '' || value === null) {
            // 空属性视为true
            attributes[attrName] = true;
          } else if (typeof value === 'string') {
            // 只有当值是"true"或"false"时才转换，其他字符串值保持不变
            if (value.toLowerCase() === 'true') {
              attributes[attrName] = true;
            } else if (value.toLowerCase() === 'false') {
              attributes[attrName] = false;
            }
          }
        }
      }
    }
    
    // 应用自定义属性转换器
    if (this.options.attributeConverters) {
      for (const [attrName, converter] of Object.entries(this.options.attributeConverters)) {
        if (attrName in attributes && typeof attributes[attrName] === 'string') {
          try {
            attributes[attrName] = converter(
              attributes[attrName] as string, 
              attrName, 
              element
            );
          } catch (error) {
            console.error(`Error converting attribute ${attrName}:`, error);
          }
        }
      }
    }
    
    // 返回处理后的元素
    return {
      ...element,
      attributes
    };
  }
  
  /**
   * 收集元素元数据
   * @param element 元素
   * @returns 处理后的元素
   * @private
   */
  private collectMetadata(element: Element): Element {
    if (!element.attributes || !this.options.metadataAttributes || this.options.metadataAttributes.length === 0) {
      return element;
    }
    
    const meta = element.meta || {};
    
    // 从属性中收集元数据
    for (const attrName of this.options.metadataAttributes) {
      if (attrName in element.attributes) {
        meta[attrName] = element.attributes[attrName];
      }
    }
    
    // 返回处理后的元素
    return {
      ...element,
      meta
    };
  }
  
  /**
   * 处理类名属性
   * @param element 元素
   * @returns 处理后的元素
   * @private
   */
  private processClassNames(element: Element): Element {
    if (!element.attributes || !element.attributes.class) {
      return element;
    }
    
    const classValue = element.attributes.class;
    if (typeof classValue !== 'string') {
      return element;
    }
    
    const classNames = classValue.split(/\s+/).filter(Boolean);
    
    const meta = element.meta || {};
    meta.classNames = classNames;
    
    // 返回处理后的元素
    return {
      ...element,
      meta
    };
  }
} 