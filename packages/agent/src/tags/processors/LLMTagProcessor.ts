/**
 * LLMTagProcessor
 * 
 * 处理<llm>标签，提取LLM配置和API设置
 * 实现API密钥环境变量安全处理机制
 * 支持模型验证和API类型验证
 */

import { Element, ProcessingContext, TagProcessor, ValidationError, ValidationWarning } from '@dpml/core';
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
 * 扩展处理上下文接口，包含ids映射
 */
interface ExtendedProcessingContext extends ProcessingContext {
  ids?: Map<string, Element>;
}

/**
 * LLM标签处理器
 * 
 * 处理llm标签，提取其LLM配置和API设置属性
 */
export class LLMTagProcessor implements TagProcessor {
  /**
   * 处理器优先级
   */
  priority = 5;
  
  /**
   * 判断是否可以处理该元素
   * @param element 元素
   * @returns 如果是llm标签返回true
   */
  canProcess(element: Element): boolean {
    return element.tagName === 'llm';
  }
  
  /**
   * 处理llm标签
   * @param element llm元素
   * @param context 处理上下文
   * @returns 处理后的元素
   */
  async process(element: Element, context: ExtendedProcessingContext): Promise<Element> {
    // 确保元素有metadata对象
    if (!element.metadata) {
      element.metadata = {};
    }
    
    // 提取llm标签的属性
    const { 
      'api-type': apiType = 'openai', 
      'api-url': apiUrl, 
      'model': model, 
      'key-env': keyEnv,
      'temperature': tempStr,
      'extends': extendsProp,
      ...otherAttrs 
    } = element.attributes as unknown as LLMTagAttributes;
    
    // 验证必需属性
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
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
    
    // 处理temperature属性，转换为数值
    let temperature: number | undefined;
    if (tempStr !== undefined) {
      temperature = parseFloat(tempStr);
      if (isNaN(temperature)) {
        warnings.push({
          code: 'INVALID_TEMPERATURE',
          message: `temperature值无效，应为数字: ${tempStr}`
        });
        temperature = undefined;
      }
    }
    
    // 创建LLM元数据
    element.metadata.llm = {
      apiType,
      apiUrl,
      model,
      keyEnv,
      temperature,
      extends: extendsProp, // 仅记录extends属性，不处理继承逻辑
      attributes: otherAttrs
    };
    
    // 添加验证错误和警告到元数据
    if (errors.length > 0) {
      element.metadata.validationErrors = errors;
    }
    
    if (warnings.length > 0) {
      element.metadata.validationWarnings = warnings;
    }
    
    // 标记为已处理
    element.metadata.processed = true;
    element.metadata.processorName = 'LLMTagProcessor';
    
    return element;
  }
} 