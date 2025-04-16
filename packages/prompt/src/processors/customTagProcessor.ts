/**
 * CustomTagProcessor
 *
 * 处理<custom>标签的自定义内容提取，遵循最小干预原则
 */

import type {
  Element,
  ProcessingContext,
  AbstractTagProcessor,
} from '@dpml/core';

/**
 * Custom标签处理器
 *
 * 处理custom标签，提取其自定义内容，遵循最小干预原则
 * 将用户定义的属性和内容原样保留，不做额外处理
 */
export class CustomTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'CustomTagProcessor';

  /**
   * 标签名称
   */
  readonly tagName = 'custom';

  /**
   * 处理器优先级
   */
  priority = 4;

  /**
   * 处理特定属性 - 遵循最小干预原则
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
    // 提取自定义内容
    const description = this.extractTextContent(element);

    // 返回所有属性，遵循最小干预原则
    return {
      description,
      ...attributes, // 直接保留所有其他属性
    };
  }
}
