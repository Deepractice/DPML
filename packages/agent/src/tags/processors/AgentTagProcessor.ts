/**
 * AgentTagProcessor
 * 
 * 处理<agent>标签，提取基本属性和子标签信息
 * 支持ID验证、版本处理和子标签收集
 */

import { Element, NodeType, Content, ProcessingContext, TagProcessor, ValidationError, isElement } from '@dpml/core';
import { AgentTagAttributes } from '../../types';

/**
 * Agent标签处理器
 * 
 * 处理agent标签作为根标签，提取其基本属性，并收集必要的子标签
 */
export class AgentTagProcessor implements TagProcessor {
  /**
   * 处理器优先级 - 高优先级确保先处理根标签
   */
  priority = 10;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是agent标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'agent';
  }
  
  /**
   * 处理agent标签
   * @param element agent元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取agent标签的基本属性
    const { id, version, extends: extendsProp, ...otherAttrs } = element.attributes as unknown as AgentTagAttributes;
    
    // 收集子标签信息
    const llmElement = this.findFirstChildByTagName(element, 'llm');
    const promptElement = this.findFirstChildByTagName(element, 'prompt');
    
    // 验证必需子标签
    const errors: ValidationError[] = [];
    
    if (!llmElement) {
      errors.push({
        code: 'MISSING_REQUIRED_CHILD',
        message: 'Agent标签必须包含llm子标签'
      });
    }
    
    if (!promptElement) {
      errors.push({
        code: 'MISSING_REQUIRED_CHILD',
        message: 'Agent标签必须包含prompt子标签'
      });
    }
    
    // 如果有验证错误，将其添加到元数据中
    if (errors.length > 0) {
      element.metadata.validationErrors = errors;
    }
    
    // 创建agent元数据
    element.metadata.agent = {
      id,
      version: version || '1.0', // 版本默认为1.0
      extends: extendsProp,
      attributes: otherAttrs,
      hasLLM: !!llmElement,
      hasPrompt: !!promptElement
    };
    
    // 在元数据中标记已被处理
    element.metadata.processed = true;
    element.metadata.processorName = 'AgentTagProcessor';
    
    return element;
  }
  
  /**
   * 查找第一个指定标签名的子元素
   * @param element 父元素
   * @param tagName 标签名
   * @returns 找到的元素或undefined
   */
  private findFirstChildByTagName(element: Element, tagName: string): Element | undefined {
    for (const child of element.children) {
      if (isElement(child) && child.tagName === tagName) {
        return child as Element;
      }
    }
    return undefined;
  }
} 