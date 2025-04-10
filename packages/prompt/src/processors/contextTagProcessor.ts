/**
 * ContextTagProcessor
 * 
 * 处理<context>标签的上下文信息提取
 */

import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext, TagProcessor } from '@dpml/core';

/**
 * Context标签处理器
 * 
 * 处理context标签，提取上下文信息，生成context元数据
 */
export class ContextTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 8;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是context标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'context';
  }
  
  /**
   * 处理context标签
   * @param element context元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取context属性
    const {
      id,
      format,
      domain,
      importance,
      extends: extendsProp,
      ...otherAttrs
    } = element.attributes;
    
    // 提取上下文内容
    const content = this.extractContent(element);
    
    // 创建context元数据
    element.metadata.semantic = {
      type: 'context',
      id,
      format,
      domain,
      importance,
      extends: extendsProp,
      content,
      attributes: otherAttrs // 保存其他属性
    };
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'ContextTagProcessor';
    
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