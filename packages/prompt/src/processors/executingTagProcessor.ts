/**
 * ExecutingTagProcessor
 *
 * 处理<executing>标签的执行流程提取
 */

import type {
  Element,
  ProcessingContext,
  AbstractTagProcessor,
} from '@dpml/core';

/**
 * Executing标签处理器
 *
 * 处理executing标签，提取执行步骤信息，生成executing元数据
 */
export class ExecutingTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'ExecutingTagProcessor';

  /**
   * 标签名称
   */
  readonly tagName = 'executing';

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
    // 提取executing特定属性
    const format = attributes.format;
    const method = attributes.method;
    const priorityAttr = attributes.priority;

    // 提取执行步骤内容
    const steps = this.extractTextContent(element);

    // 返回executing特定的元数据
    return {
      format,
      method,
      priority: priorityAttr,
      steps,
      attributes,
    };
  }
}
