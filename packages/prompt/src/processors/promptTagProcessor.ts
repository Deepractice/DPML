/**
 * PromptTagProcessor
 * 
 * 处理根标签<prompt>的语义和属性
 */

import { Element, NodeType } from '@dpml/core';
import { ProcessingContext, TagProcessor } from '@dpml/core';

/**
 * Prompt标签处理器
 * 
 * 处理prompt标签，提取其语义信息，生成prompt元数据
 */
export class PromptTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 10;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是prompt标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'prompt';
  }
  
  /**
   * 处理prompt标签
   * @param element prompt元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取prompt属性
    const {
      id,
      version,
      lang,
      extends: extendsProp,
      ...otherAttrs
    } = element.attributes;
    
    // 创建prompt元数据
    element.metadata.semantic = {
      type: 'prompt',
      id,
      version,
      lang,
      extends: extendsProp,
      attributes: otherAttrs // 保存其他属性
    };
    
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
          attributes: childElement.attributes
        });
      }
    }
    
    if (children.length > 0) {
      element.metadata.semantic.children = children;
    }
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'PromptTagProcessor';
    
    return element;
  }
} 