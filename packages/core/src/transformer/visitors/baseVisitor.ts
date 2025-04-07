import { TransformerVisitor } from '../interfaces/transformerVisitor';
import { NodeType } from '../../types/node';
import { TransformContext } from '../interfaces/transformContext';

/**
 * 转换访问者基类
 * 
 * 为所有访问者提供基础功能和默认实现。
 * 各具体访问者通过继承此基类并重写相关方法来实现特定转换逻辑。
 */
export abstract class BaseVisitor implements TransformerVisitor {
  /**
   * 访问者名称，用于唯一标识和日志记录
   */
  abstract readonly name: string;
  
  /**
   * 访问者优先级，较高的优先级会被先执行
   */
  priority: number;
  
  /**
   * 构造函数
   * @param priority 访问者优先级，默认为0
   */
  constructor(priority: number = 0) {
    this.priority = priority;
  }
  
  /**
   * 获取访问者优先级
   * @returns 优先级数值
   */
  getPriority(): number {
    return this.priority;
  }
  
  /**
   * 通用访问方法，根据节点类型分发到具体访问方法
   * @param node 要访问的节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visit(node: any, context: TransformContext): any {
    if (!node) {
      return null;
    }
    
    switch (node.type) {
      case NodeType.DOCUMENT:
        return this.visitDocument(node, context);
      case NodeType.ELEMENT:
        return this.visitElement(node, context);
      case NodeType.CONTENT:
        return this.visitContent(node, context);
      case NodeType.REFERENCE:
        return this.visitReference(node, context);
      default:
        return this.visitUnknown(node, context);
    }
  }
  
  /**
   * 异步访问方法，支持异步操作
   * @param node 要访问的节点
   * @param context 转换上下文
   * @returns 转换结果Promise
   */
  async visitAsync(node: any, context: TransformContext): Promise<any> {
    return this.visit(node, context);
  }
  
  /**
   * 访问文档节点
   * @param node 文档节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitDocument(node: any, context: TransformContext): any {
    return null;
  }
  
  /**
   * 访问元素节点
   * @param node 元素节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitElement(node: any, context: TransformContext): any {
    return null;
  }
  
  /**
   * 访问内容节点
   * @param node 内容节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitContent(node: any, context: TransformContext): any {
    return null;
  }
  
  /**
   * 访问引用节点
   * @param node 引用节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitReference(node: any, context: TransformContext): any {
    return null;
  }
  
  /**
   * 访问未知类型节点
   * @param node 未知类型节点
   * @param context 转换上下文
   * @returns 转换结果
   */
  visitUnknown(node: any, context: TransformContext): any {
    return null;
  }
} 