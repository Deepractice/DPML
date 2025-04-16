/**
 * TestingTagProcessor
 *
 * 处理<testing>标签的质量检查提取
 */

import type {
  Element,
  ProcessingContext,
  AbstractTagProcessor,
} from '@dpml/core';

/**
 * Testing标签处理器
 *
 * 处理testing标签，提取质量检查信息，生成testing元数据
 */
export class TestingTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'TestingTagProcessor';

  /**
   * 标签名称
   */
  readonly tagName = 'testing';

  /**
   * 处理器优先级
   */
  priority = 9;

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
    // 提取testing特定属性
    const format = attributes.format;
    const testingType = attributes.type;
    const scope = attributes.scope;
    const level = attributes.level;

    // 提取质量检查内容
    const criteria = this.extractTextContent(element);

    // 返回testing特定的元数据
    return {
      format,
      testingType,
      scope,
      level,
      criteria,
      attributes,
    };
  }
}
