/**
 * LLMTagProcessor
 * 
 * 处理<llm>标签，提取LLM配置和API设置
 * 实现API密钥环境变量安全处理机制
 * 支持模型验证和API类型验证
 */

import { Element, ProcessingContext, ValidationError, ValidationWarning } from '@dpml/core';
import { AbstractTagProcessor } from '@dpml/core/src/processor/tagProcessors/abstractTagProcessor';
import { LLMTagAttributes } from '../../types';

/**
 * 支持的API类型列表
 */
const SUPPORTED_API_TYPES = ['openai', 'anthropic', 'azure', 'mistral', 'custom'];

/**
 * 检查URL是否有效
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * LLM标签处理器
 * 
 * 处理llm标签，提取其LLM配置和API设置属性
 */
export class LLMTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'LLMTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'llm';
  
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
  protected processSpecificAttributes(
    attributes: Record<string, any>,
    element: Element,
    context: ProcessingContext
  ): Record<string, any> {
    // 提取LLM特定属性
    const apiType = attributes['api-type'] || 'openai';
    const apiUrl = attributes['api-url'];
    const model = attributes['model'];
    const keyEnv = attributes['key-env'];
    const tempStr = attributes['temperature'];
    
    // 处理temperature属性，转换为数值
    let temperature: number | undefined;
    if (tempStr !== undefined) {
      temperature = parseFloat(tempStr);
      if (isNaN(temperature)) {
        temperature = undefined;
      }
    }
    
    // 返回LLM特定的元数据
    return {
      apiType,
      apiUrl,
      model,
      keyEnv,
      temperature,
      attributes
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
    const warnings: ValidationWarning[] = [];
    
    // 提取LLM特定属性
    const attributes = element.attributes as unknown as LLMTagAttributes;
    const apiType = attributes['api-type'] || 'openai';
    const apiUrl = attributes['api-url'];
    const model = attributes['model'];
    const keyEnv = attributes['key-env'];
    const tempStr = attributes['temperature'];
    
    // 验证model属性
    if (!model) {
      errors.push({
        code: 'MISSING_REQUIRED_ATTRIBUTE',
        message: 'LLM标签必须包含model属性'
      });
    }
    
    // 验证api-type是否为支持的类型
    if (apiType && !SUPPORTED_API_TYPES.includes(apiType)) {
      warnings.push({
        code: 'UNSUPPORTED_API_TYPE',
        message: `不支持的API类型: ${apiType}。支持的类型: ${SUPPORTED_API_TYPES.join(', ')}`
      });
    }
    
    // 验证api-url是否为有效URL
    if (apiUrl && !isValidUrl(apiUrl)) {
      warnings.push({
        code: 'INVALID_API_URL',
        message: `API URL无效: ${apiUrl}`
      });
    }
    
    // 验证key-env环境变量是否存在
    if (keyEnv && !process.env[keyEnv]) {
      warnings.push({
        code: 'MISSING_ENV_VARIABLE',
        message: `环境变量${keyEnv}不存在或未设置`
      });
    }
    
    // 验证temperature值是否有效
    if (tempStr !== undefined && isNaN(parseFloat(tempStr))) {
      warnings.push({
        code: 'INVALID_TEMPERATURE',
        message: `temperature值无效，应为数字: ${tempStr}`
      });
    }
    
    return { errors, warnings };
  }
} 