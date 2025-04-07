import { Element } from '../../types/node';
import { TransformContext } from './transformContext';

/**
 * 标签处理器接口
 * 
 * 用于处理特定标签的语义内容，并生成相应的元数据
 * 标签处理器是实现语义处理的核心组件
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
   * @param context 转换上下文
   * @returns 处理后的元素，通常包含添加的元数据
   */
  process(element: Element, context: TransformContext): Element | Promise<Element>;
  
  /**
   * 处理器优先级
   * 数值越大，优先级越高
   * 默认为0
   */
  priority?: number;
}

/**
 * 标签处理器注册表接口
 * 
 * 管理特定标签的处理器集合
 */
export interface TagProcessorRegistry {
  /**
   * 注册标签处理器
   * 
   * @param tagName 标签名称
   * @param processor 处理器实例
   */
  registerProcessor(tagName: string, processor: TagProcessor): void;
  
  /**
   * 获取标签的所有处理器
   * 
   * @param tagName 标签名称
   * @returns 处理器数组
   */
  getProcessors(tagName: string): TagProcessor[];
  
  /**
   * 检查是否有处理器可以处理指定标签
   * 
   * @param tagName 标签名称
   * @returns 如果有处理器返回true，否则返回false
   */
  hasProcessors(tagName: string): boolean;
} 