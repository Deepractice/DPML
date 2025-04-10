/**
 * CustomTagProcessor
 * 
 * 处理<custom>标签的自定义内容提取，遵循最小干预原则
 */

import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext, TagProcessor } from '@dpml/core';

/**
 * Custom标签处理器
 * 
 * 处理custom标签，提取其自定义内容，遵循最小干预原则
 * 将用户定义的属性和内容原样保留，不做额外处理
 */
export class CustomTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 4;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是custom标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'custom';
  }
  
  /**
   * 处理custom标签
   * @param element custom元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取custom标签的基础属性
    const {
      id,
      extends: extendsProp,
      ...otherAttrs
    } = element.attributes;
    
    // 提取自定义内容
    const description = this.extractContent(element);
    
    // 创建custom元数据，遵循最小干预原则
    // 将所有属性直接放入semantic对象，不做额外处理
    element.metadata.semantic = {
      type: 'custom',
      id,
      extends: extendsProp,
      description,
      ...otherAttrs // 直接保留所有其他属性
    };
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'CustomTagProcessor';
    
    return element;
  }
  
  /**
   * 提取元素内容
   * @param element 元素
   * @returns 内容文本
   */
  private extractContent(element: Element): string {
    let content = '';
    
    for (const child of element.children) {
      if (child.type === NodeType.CONTENT) {
        const contentNode = child as Content;
        content += contentNode.value;
      }
    }
    
    return content;
  }
} 