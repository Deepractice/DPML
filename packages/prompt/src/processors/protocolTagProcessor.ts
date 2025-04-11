/**
 * ProtocolTagProcessor
 * 
 * 处理<protocol>标签的交互协议提取
 */

import { Element, ProcessingContext } from '@dpml/core';
import { AbstractTagProcessor } from '@dpml/core';

/**
 * Protocol标签处理器
 * 
 * 处理protocol标签，提取其交互协议信息，生成protocol元数据
 */
export class ProtocolTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'ProtocolTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'protocol';
  
  /**
   * 处理器优先级
   */
  priority = 5;
  
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
    // 提取protocol特定属性
    const format = attributes.format;
    
    // 提取交互协议内容
    const description = this.extractTextContent(element);
    
    // 返回protocol特定的元数据
    return {
      format,
      description,
      attributes
    };
  }
} 