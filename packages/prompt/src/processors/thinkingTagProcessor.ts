/**
 * ThinkingTagProcessor
 * 
 * 处理<thinking>标签的思维框架提取
 */

import { Element, ProcessingContext } from '@dpml/core';
import { AbstractTagProcessor } from '@dpml/core';

/**
 * Thinking标签处理器
 * 
 * 处理thinking标签，提取思维框架信息，生成thinking元数据
 */
export class ThinkingTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'ThinkingTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'thinking';
  
  /**
   * 处理器优先级
   */
  priority = 8;
  
  /**
   * 处理特定属性
   * @param attributes 除id和extends外的属性
   * @param element 原始元素
   * @param context 处理上下文
   * @returns 特定的元数据对象
   */
  protected processSpecificAttributes(
    attributes: Record<string, any>,
    element: Element,
    context: ProcessingContext
  ): Record<string, any> {
    // 提取thinking特定属性
    const format = attributes.format;
    const approach = attributes.approach;
    const style = attributes.style;
    
    // 提取思维框架内容
    const framework = this.extractTextContent(element);
    
    // 返回thinking特定的元数据
    return {
      format,
      approach,
      style,
      framework,
      attributes
    };
  }
} 