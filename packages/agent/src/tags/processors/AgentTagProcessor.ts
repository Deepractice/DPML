/**
 * AgentTagProcessor
 * 
 * 处理<agent>标签，提取基本属性和子标签信息
 * 支持ID验证、版本处理和子标签收集
 */

import { Element, ProcessingContext, ValidationError, ValidationWarning, isElement, AbstractTagProcessor } from '@dpml/core';
import { AgentTagAttributes } from '../../types';

/**
 * Agent标签处理器
 * 
 * 处理agent标签作为根标签，提取其基本属性，并收集必要的子标签
 */
export class AgentTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'AgentTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'agent';
  
  /**
   * 处理器优先级 - 高优先级确保先处理根标签
   */
  priority = 10;
  
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
    // 处理版本属性，提供默认值
    const version = attributes.version || '1.0';
    
    // 收集子标签信息
    const llmElement = this.findFirstChildByTagName(element, 'llm');
    const promptElement = this.findFirstChildByTagName(element, 'prompt');
    
    // 返回agent特定的元数据
    return {
      version,
      attributes,
      hasLLM: !!llmElement,
      hasPrompt: !!promptElement
    };
  }
  
  /**
   * 验证元素
   * @param element 待验证的元素
   * @param context 处理上下文
   * @returns 验证结果
   */
  protected validate(element: Element, context: ProcessingContext): {
    errors?: ValidationError[],
    warnings?: ValidationWarning[]
  } {
    const errors: ValidationError[] = [];
    
    // 验证必需子标签
    const llmElement = this.findFirstChildByTagName(element, 'llm');
    if (!llmElement) {
      errors.push({
        code: 'MISSING_REQUIRED_CHILD',
        message: 'Agent标签必须包含llm子标签'
      });
    }
    
    const promptElement = this.findFirstChildByTagName(element, 'prompt');
    if (!promptElement) {
      errors.push({
        code: 'MISSING_REQUIRED_CHILD',
        message: 'Agent标签必须包含prompt子标签'
      });
    }
    
    return { errors };
  }
} 