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
   * 访问者的唯一名称
   */
  name: string;

  /**
   * 访问者的优先级
   * 可以是一个数字(所有节点通用优先级)
   * 或一个对象(为不同节点类型或元素标签指定不同优先级)
   */
  priority?: number | { [key: string]: number };

  /**
   * 访问文档节点
   * @param document 文档节点
   * @param context 上下文
   * @returns 处理结果
   */
  visitDocument?: (document: ProcessedDocument, context: TransformContext) => any;

  /**
   * 异步访问文档节点
   * @param document 文档节点
   * @param context 上下文
   * @returns 处理结果的Promise
   */
  visitDocumentAsync?: (document: ProcessedDocument, context: TransformContext) => Promise<any>;

  /**
   * 访问元素节点
   * @param element 元素节点
   * @param context 上下文
   * @returns 处理结果
   */
  visitElement?: (element: Element, context: TransformContext) => any;

  /**
   * 异步访问元素节点
   * @param element 元素节点
   * @param context 上下文
   * @returns 处理结果的Promise
   */
  visitElementAsync?: (element: Element, context: TransformContext) => Promise<any>;

  /**
   * 访问内容节点
   * @param content 内容节点
   * @param context 上下文
   * @returns 处理结果
   */
  visitContent?: (content: Content, context: TransformContext) => any;

  /**
   * 异步访问内容节点
   * @param content 内容节点
   * @param context 上下文
   * @returns 处理结果的Promise
   */
  visitContentAsync?: (content: Content, context: TransformContext) => Promise<any>;

  /**
   * 访问引用节点
   * @param reference 引用节点
   * @param context 上下文
   * @returns 处理结果
   */
  visitReference?: (reference: Reference, context: TransformContext) => any;

  /**
   * 异步访问引用节点
   * @param reference 引用节点
   * @param context 上下文
   * @returns 处理结果的Promise
   */
  visitReferenceAsync?: (reference: Reference, context: TransformContext) => Promise<any>;
} 