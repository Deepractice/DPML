/**
 * 抽象标签处理器
 * 
 * 提供统一的属性处理和元数据生成的基类
 * 简化TagProcessor实现，确保一致的元数据结构和命名约定
 */

import { Element } from '@core/types/node';
import { ProcessingContext, TagProcessor } from '@core/processor/interfaces';
import { ValidationError, ValidationWarning } from '@core/errors/types';

/**
 * 标签处理器抽象基类
 * 
 * 实现通用的标签处理逻辑，提供模板方法设计模式
 * 子类只需实现特定的属性处理和验证逻辑
 */
export abstract class AbstractTagProcessor implements TagProcessor {
  /**
   * 处理器优先级，子类可覆盖
   */
  priority = 0;
  
  /**
   * 处理器名称，子类必须实现
   */
  abstract readonly processorName: string;
  
  /**
   * 标签名称，子类必须实现
   */
  abstract readonly tagName: string;
  
  /**
   * 判断是否可以处理指定元素
   * 默认基于tagName匹配，子类可覆盖添加额外判断
   */
  canProcess(element: Element): boolean {
    return element.tagName === this.tagName;
  }
  
  /**
   * 处理元素
   * 模板方法，定义标准处理流程
   * @param element 待处理的元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取通用属性（id和extends）
    const { id, extends: extendsProp, ...otherAttrs } = element.attributes;
    
    // 处理特定属性（交由子类实现）
    const specificMetadata = await this.processSpecificAttributes(otherAttrs, element, context);
    
    // 创建标准元数据结构
    element.metadata.semantic = {
      type: this.tagName,
      id,
      ...specificMetadata
    };
    
    // 保留extends属性在元数据中，但不处理继承逻辑（由InheritanceVisitor负责）
    if (extendsProp) {
      element.metadata.semantic.extends = extendsProp;
    }
    
    // 处理验证
    const validationResults = this.validate(element, context);
    if (validationResults.errors && validationResults.errors.length > 0) {
      element.metadata.validationErrors = validationResults.errors;
    }
    if (validationResults.warnings && validationResults.warnings.length > 0) {
      element.metadata.validationWarnings = validationResults.warnings;
    }
    
    // 标记处理完成
    element.metadata.processed = true;
    element.metadata.processorName = this.processorName;
    
    // 调用后处理钩子
    await this.postProcess(element, context);
    
    return element;
  }
  
  /**
   * 处理特定属性（子类必须实现）
   * @param attributes 除id和extends以外的属性
   * @param element 原始元素
   * @param context 处理上下文
   * @returns 特定的元数据对象
   */
  protected abstract processSpecificAttributes(
    attributes: Record<string, any>,
    element: Element,
    context: ProcessingContext
  ): Promise<Record<string, any>> | Record<string, any>;
  
  /**
   * 验证元素（子类可覆盖）
   * @param element 待验证的元素
   * @param context 处理上下文
   * @returns 验证结果，包含错误和警告
   */
  protected validate(element: Element, context: ProcessingContext): {
    errors?: ValidationError[],
    warnings?: ValidationWarning[]
  } {
    return { errors: [], warnings: [] };
  }
  
  /**
   * 后处理钩子（子类可覆盖）
   * @param element 处理后的元素
   * @param context 处理上下文
   */
  protected async postProcess(element: Element, context: ProcessingContext): Promise<void> {
    // 默认不做任何后处理
  }
  
  /**
   * 提取元素的文本内容
   * @param element 元素
   * @returns 文本内容
   */
  protected extractTextContent(element: Element): string {
    let content = '';
    
    for (const child of element.children) {
      if (child.type === 'content') {
        content += (child as any).value;
      }
    }
    
    return content;
  }
  
  /**
   * 查找第一个指定标签名的子元素
   * @param element 父元素
   * @param tagName 标签名
   * @returns 找到的元素或undefined
   */
  protected findFirstChildByTagName(element: Element, tagName: string): Element | undefined {
    for (const child of element.children) {
      if (child.type === 'element' && (child as Element).tagName === tagName) {
        return child as Element;
      }
    }
    return undefined;
  }
  
  /**
   * 查找所有指定标签名的子元素
   * @param element 父元素
   * @param tagName 标签名
   * @returns 元素数组
   */
  protected findChildrenByTagName(element: Element, tagName: string): Element[] {
    const result: Element[] = [];
    
    for (const child of element.children) {
      if (child.type === 'element' && (child as Element).tagName === tagName) {
        result.push(child as Element);
      }
    }
    
    return result;
  }
} 