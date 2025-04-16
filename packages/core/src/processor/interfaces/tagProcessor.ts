/**
 * 标签处理器接口
 *
 * 定义了处理特定标签的组件的接口
 * 用于实现领域特定的语义处理逻辑
 */

import type { ProcessingContext } from './processingContext';
import type { Element } from '../../types/node';

/**
 * 标签处理器接口
 *
 * 用于处理特定标签的语义内容，并生成相应的元数据
 * 标签处理器是实现领域特定语义处理的核心组件
 */
export interface TagProcessor {
  /**
   * 判断是否可以处理指定元素
   *
   * @param element 待处理的元素
   * @returns 如果可以处理返回true，否则返回false
   */
  canProcess(element: Element): boolean;

  /**
   * 处理元素并生成元数据
   *
   * @param element 待处理的元素
   * @param context 处理上下文
   * @returns 处理后的元素，通常包含添加的元数据
   */
  process(element: Element, context: ProcessingContext): Promise<Element>;

  /**
   * 处理器优先级
   * 数值越大，优先级越高
   * 默认为0
   */
  priority?: number;
}
