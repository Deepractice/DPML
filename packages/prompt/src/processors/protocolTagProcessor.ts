/**
 * ProtocolTagProcessor
 * 
 * 处理<protocol>标签的交互协议提取
 */

import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext, TagProcessor } from '@dpml/core';

/**
 * Protocol标签处理器
 * 
 * 处理protocol标签，提取其交互协议信息，生成protocol元数据
 */
export class ProtocolTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 5;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是protocol标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'protocol';
  }
  
  /**
   * 处理protocol标签
   * @param element protocol元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取protocol属性
    const {
      id,
      format,
      extends: extendsProp,
      ...otherAttrs
    } = element.attributes;
    
    // 提取交互协议内容
    const description = this.extractContent(element);
    
    // 创建protocol元数据
    element.metadata.semantic = {
      type: 'protocol',
      id,
      format,
      extends: extendsProp,
      description,
      attributes: otherAttrs // 保存其他属性
    };
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'ProtocolTagProcessor';
    
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