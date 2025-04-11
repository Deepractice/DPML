/**
 * ContextTagProcessor
 * 
 * 处理<context>标签的上下文信息提取
 */

import { Element, ProcessingContext } from '@dpml/core';
import { AbstractTagProcessor } from '@dpml/core';

/**
 * Context标签处理器
 * 
 * 处理context标签，提取上下文信息，生成context元数据
 */
export class ContextTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'ContextTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'context';
  
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
    // 提取context特定属性
    const format = attributes.format;
    const domain = attributes.domain;
    const importance = attributes.importance;
    
    // 提取上下文内容
    const content = this.extractTextContent(element);
    
    // 返回context特定的元数据
    return {
      format,
      domain,
      importance,
      content,
      attributes
    };
  }
} 