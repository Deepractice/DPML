/**
 * TestingTagProcessor
 * 
 * 处理<testing>标签的质量检查提取
 */

import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext, TagProcessor } from '@dpml/core';

/**
 * Testing标签处理器
 * 
 * 处理testing标签，提取质量检查信息，生成testing元数据
 */
export class TestingTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 9;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是testing标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'testing';
  }
  
  /**
   * 处理testing标签
   * @param element testing元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取testing属性
    const {
      id,
      format,
      type: testingType,
      scope,
      level,
      extends: extendsProp,
      ...otherAttrs
    } = element.attributes;
    
    // 提取质量检查内容
    const criteria = this.extractContent(element);
    
    // 创建testing元数据
    element.metadata.semantic = {
      type: 'testing',
      id,
      format,
      testingType,
      scope,
      level,
      extends: extendsProp,
      criteria,
      attributes: otherAttrs // 保存其他属性
    };
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'TestingTagProcessor';
    
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