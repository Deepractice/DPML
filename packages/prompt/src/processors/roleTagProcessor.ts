/**
 * RoleTagProcessor
 * 
 * 处理<role>标签的角色定义和描述提取
 */

import { Element, ProcessingContext } from '@dpml/core';
import { AbstractTagProcessor } from '@dpml/core';

/**
 * Role标签处理器
 * 
 * 处理role标签，提取其角色描述信息，生成role元数据
 */
export class RoleTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'RoleTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'role';
  
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
    // 提取role特定属性
    const type = attributes.type;
    
    // 提取角色描述内容
    const description = this.extractTextContent(element);
    
    // 返回role特定的元数据
    return {
      roleType: type,
      description,
      attributes
    };
  }
} 