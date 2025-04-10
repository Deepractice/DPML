/**
 * RoleTagProcessor
 * 
 * 处理<role>标签的角色定义和描述提取
 */

import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext, TagProcessor } from '@dpml/core';

/**
 * Role标签处理器
 * 
 * 处理role标签，提取其角色描述信息，生成role元数据
 */
export class RoleTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 8;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是role标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'role';
  }
  
  /**
   * 处理role标签
   * @param element role元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取role属性
    const {
      id,
      type,
      extends: extendsProp,
      ...otherAttrs
    } = element.attributes;
    
    // 提取角色描述内容
    const description = this.extractContent(element);
    
    // 创建role元数据
    element.metadata.semantic = {
      type: 'role',
      id,
      roleType: type,
      extends: extendsProp,
      description,
      attributes: otherAttrs // 保存其他属性
    };
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'RoleTagProcessor';
    
    return element;
  }
  
  /**
   * 提取元素内容
   * @param element 元素
   * @returns 内容文本
   */
  private extractContent(element: Element): string {
    let content = '';
    
    for (const child of element.children) {
      if (child.type === NodeType.CONTENT) {
        const contentNode = child as Content;
        content += contentNode.value;
      }
    }
    
    return content;
  }
} 