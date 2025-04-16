/**
 * PromptTagProcessor
 *
 * 处理<prompt>标签的提示文本
 */

import { NodeType, AbstractTagProcessor } from '@dpml/core';

import type { Element, ProcessingContext } from '@dpml/core';

/**
 * Prompt标签处理器
 *
 * 处理prompt标签，提取其语义信息，生成prompt元数据
 */
export class PromptTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'PromptTagProcessor';

  /**
   * 标签名称
   */
  readonly tagName = 'prompt';

  /**
   * 处理器优先级
   */
  priority = 10;

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
    // 提取prompt特定属性
    const version = attributes.version;
    const lang = attributes.lang;

    // 如果有语言属性，将其添加到上下文变量中，以便影响后续处理
    if (lang) {
      context.variables.lang = lang;
    }

    // 收集子标签信息
    const children: any[] = [];

    for (const child of element.children) {
      if (child.type === NodeType.ELEMENT) {
        const childElement = child as Element;

        children.push({
          tagName: childElement.tagName,
          attributes: childElement.attributes,
        });
      }
    }

    // 返回prompt特定的元数据
    const result: Record<string, any> = {
      version,
      lang,
      attributes,
    };

    if (children.length > 0) {
      result.children = children;
    }

    return result;
  }

  /**
   * 后处理钩子
   * @param element 处理后的元素
   * @param context 处理上下文
   */
  protected async postProcess(
    element: Element,
    context: ProcessingContext
  ): Promise<void> {
    // 可以在这里添加需要的后处理逻辑
  }
}
