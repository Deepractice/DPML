import { ProcessedDocument } from '../../processor/interfaces/processor';
import { Element, Content, Reference } from '../../types/node';
import { TransformContext } from './transformContext';

/**
 * 转换访问者接口
 * 
 * 实现访问者模式，为不同类型节点提供转换逻辑
 */
export interface TransformerVisitor {
  /**
   * 文档节点访问方法
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitDocument?(document: ProcessedDocument, context: TransformContext): any;
  
  /**
   * 元素节点访问方法
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitElement?(element: Element, context: TransformContext): any;
  
  /**
   * 内容节点访问方法
   * @param content 内容节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitContent?(content: Content, context: TransformContext): any;
  
  /**
   * 引用节点访问方法
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitReference?(reference: Reference, context: TransformContext): any;
  
  /**
   * 访问者优先级
   * 数值越大优先级越高，用于决定访问者执行顺序
   */
  priority?: number;
} 