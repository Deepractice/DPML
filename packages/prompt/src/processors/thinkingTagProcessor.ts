/**
 * ThinkingTagProcessor
 * 
 * 处理<thinking>标签的思维框架提取
 */

import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext, TagProcessor } from '@dpml/core';

/**
 * Thinking标签处理器
 * 
 * 处理thinking标签，提取思维框架信息，生成thinking元数据
 */
export class ThinkingTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 8;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是thinking标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'thinking';
  }
  
  /**
   * 处理thinking标签
   * @param element thinking元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取thinking属性
    const {
      id,
      format,
      approach,
      style,
      extends: extendsProp,
      ...otherAttrs
    } = element.attributes;
    
    // 提取思维框架内容
    const framework = this.extractContent(element);
    
    // 创建thinking元数据
    element.metadata.semantic = {
      type: 'thinking',
      id,
      format,
      approach,
      style,
      extends: extendsProp,
      framework,
      attributes: otherAttrs // 保存其他属性
    };
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'ThinkingTagProcessor';
    
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