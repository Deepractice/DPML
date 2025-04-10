/**
 * ExecutingTagProcessor
 * 
 * 处理<executing>标签的执行步骤提取
 */

import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext, TagProcessor } from '@dpml/core';

/**
 * Executing标签处理器
 * 
 * 处理executing标签，提取执行步骤信息，生成executing元数据
 */
export class ExecutingTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 8;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是executing标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'executing';
  }
  
  /**
   * 处理executing标签
   * @param element executing元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取executing属性
    const {
      id,
      format,
      method,
      priority,
      extends: extendsProp,
      ...otherAttrs
    } = element.attributes;
    
    // 提取执行步骤内容
    const steps = this.extractContent(element);
    
    // 创建executing元数据
    element.metadata.semantic = {
      type: 'executing',
      id,
      format,
      method,
      priority,
      extends: extendsProp,
      steps,
      attributes: otherAttrs // 保存其他属性
    };
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'ExecutingTagProcessor';
    
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