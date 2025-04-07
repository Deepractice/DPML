/**
 * IdValidationVisitor
 * 
 * 用于验证元素ID的唯一性
 */

import { Document, Element } from '@core/types/node';
import { NodeVisitor, ProcessingContext } from '@core/processor/interfaces';
import { ValidationError, ErrorCode, ErrorLevel } from '@core/errors/types';

/**
 * ID验证访问者选项
 */
export interface IdValidationVisitorOptions {
  /**
   * 是否启用严格模式
   * 在严格模式下，任何ID重复都会导致抛出错误
   * 在非严格模式下，只会发出警告
   */
  strictMode?: boolean;
}

/**
 * ID验证访问者
 * 验证文档中所有元素ID的唯一性
 */
export class IdValidationVisitor implements NodeVisitor {
  /**
   * 访问者优先级
   * 在继承处理后但在引用处理前执行
   */
  priority = 90;
  
  /**
   * 是否启用严格模式
   */
  private strictMode: boolean;
  
  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options?: IdValidationVisitorOptions) {
    this.strictMode = options?.strictMode ?? false;
  }
  
  /**
   * 处理文档节点
   * 初始化ID映射
   * @param document 文档节点
   * @param context 处理上下文
   * @returns 处理后的文档节点
   */
  async visitDocument(document: Document, context: ProcessingContext): Promise<Document> {
    // 初始化ID映射
    context.idMap = new Map();
    return document;
  }
  
  /**
   * 处理元素节点
   * 收集并验证ID
   * @param element 元素节点
   * @param context 处理上下文
   * @returns 处理后的元素节点
   */
  async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
    if (element.attributes.id) {
      const id = element.attributes.id;
      
      // 检查ID是否已存在
      if (context.idMap?.has(id)) {
        // 创建错误
        const error = new ValidationError({
          code: ErrorCode.INVALID_ATTRIBUTE,
          message: `重复的ID: ${id}`,
          level: this.strictMode ? ErrorLevel.ERROR : ErrorLevel.WARNING,
          position: element.position ? {
            line: element.position.start.line,
            column: element.position.start.column,
            offset: element.position.start.offset
          } : undefined
        });
        
        // 在严格模式下抛出错误，否则只发出警告
        if (this.strictMode) {
          throw error;
        } else {
          console.warn(error.toString());
        }
      }
      
      // 存储ID与元素的映射
      context.idMap?.set(id, element);
    }
    
    return element;
  }
} 