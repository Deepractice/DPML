/**
 * PromptTagProcessor
 * 
 * 处理<prompt>标签，委托给@dpml/prompt包处理提示词内容
 * 支持extends继承机制
 */

import { Element, ProcessingContext, ValidationError, ValidationWarning, AbstractTagProcessor, NodeType } from '@dpml/core';
import { processPrompt } from '@dpml/prompt';
import { PromptTagAttributes } from '../../types';

/**
 * 提取元素内容文本
 * @param element 元素
 * @returns 元素内容文本
 */
function extractElementContent(element: Element): string {
  if (!element.children || element.children.length === 0) {
    return '';
  }
  
  return element.children
    .map(child => {
      if (child.type === NodeType.CONTENT) {
        return (child as any).value;
      } else if (child.type === NodeType.ELEMENT) {
        // 递归提取子元素内容
        const childElement = child as Element;
        const tagName = childElement.tagName;
        const attributes = Object.entries(childElement.attributes || {})
          .map(([key, value]) => ` ${key}="${value}"`)
          .join('');
        
        const content = extractElementContent(childElement);
        return `<${tagName}${attributes}>${content}</${tagName}>`;
      }
      return '';
    })
    .join('');
}

/**
 * Prompt标签处理器
 * 
 * 处理prompt标签，委托给@dpml/prompt包处理提示词内容
 */
export class PromptTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'PromptTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'prompt';
  
  /**
   * 处理器优先级
   */
  priority = 5;
  
  /**
   * 处理特定属性
   * @param attributes 除id和extends外的属性
   * @param element 原始元素
   * @param context 处理上下文
   * @returns 特定的元数据对象
   */
  protected async processSpecificAttributes(
    attributes: Record<string, any>,
    element: Element,
    context: ProcessingContext
  ): Promise<Record<string, any>> {
    // 提取提示词内容
    const content = extractElementContent(element);
    
    // 获取继承属性
    const extendsAttr = (element.attributes as unknown as PromptTagAttributes).extends;
    
    try {
      // 检查内容是否为DPML格式
      let dpmlContent = content;
      if (content && !content.trim().startsWith('<prompt')) {
        // 如果不是DPML格式，包装为简单的DPML
        dpmlContent = `<prompt>${content}</prompt>`;
      }
      
      // 委托给@dpml/prompt处理
      const processedPrompt = await processPrompt(dpmlContent, {
        basePath: context.currentPath
      });
      
      // 返回处理结果
      return {
        content,
        processed: true,
        extends: extendsAttr,
        processedPrompt: processedPrompt,
        attributes
      };
    } catch (error) {
      console.error('处理提示词时出错:', error);
      
      // 返回基本信息
      return {
        content,
        extends: extendsAttr,
        processed: false,
        error: error instanceof Error ? error.message : String(error),
        attributes
      };
    }
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
    const warnings: ValidationWarning[] = [];
    
    // 如果内容为空，添加警告
    if (!element.children || element.children.length === 0) {
      warnings.push({
        code: 'EMPTY_PROMPT',
        message: 'prompt标签内容为空'
      });
    }
    
    return { warnings };
  }
} 