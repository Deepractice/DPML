/**
 * NodeVisitor接口
 *
 * 访问者模式的核心接口，用于处理不同类型的节点
 */

import type { ProcessingContext } from './processingContext';
import type { Document, Element, Content, Reference } from '../../types/node';

/**
 * 节点访问者接口
 * 访问者模式的核心接口，允许对不同类型的节点进行处理
 */
export interface NodeVisitor {
  /**
   * 访问者优先级，数值越大优先级越高
   * 访问者按优先级从高到低排序执行
   */
  priority?: number;

  /**
   * 处理文档节点
   * @param document 文档节点
   * @param context 处理上下文
   * @returns 处理后的文档节点
   */
  visitDocument?(
    document: Document,
    context: ProcessingContext
  ): Promise<Document>;

  /**
   * 处理元素节点
   * @param element 元素节点
   * @param context 处理上下文
   * @returns 处理后的元素节点
   */
  visitElement?(element: Element, context: ProcessingContext): Promise<Element>;

  /**
   * 处理内容节点
   * @param content 内容节点
   * @param context 处理上下文
   * @returns 处理后的内容节点
   */
  visitContent?(content: Content, context: ProcessingContext): Promise<Content>;

  /**
   * 处理引用节点
   * @param reference 引用节点
   * @param context 处理上下文
   * @returns 处理后的引用节点
   */
  visitReference?(
    reference: Reference,
    context: ProcessingContext
  ): Promise<Reference>;
}
