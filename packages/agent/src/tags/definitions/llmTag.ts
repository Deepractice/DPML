import { Element, ValidationResult, ValidationError, ValidationWarning } from '@dpml/core';

/**
 * llm标签验证函数
 */
export function validateLLMTag(element: Element, context: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // 验证api-type是否为支持的类型
  const apiType = element.attributes['api-type'];
  const supportedApiTypes = ['openai', 'anthropic', 'azure', 'mistral', 'custom'];
  
  if (apiType && !supportedApiTypes.includes(apiType as string)) {
    warnings.push({
      code: 'UNSUPPORTED_API_TYPE',
      message: `不支持的API类型: ${apiType}。支持的类型: ${supportedApiTypes.join(', ')}`
    });
  }
  
  // 检查是否缺少API密钥环境变量
  if (!element.attributes['key-env']) {
    warnings.push({
      code: 'MISSING_KEY_ENV',
      message: '建议设置key-env属性以指定API密钥的环境变量'
    });
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * llm标签定义
 */
export const llmTagDefinition = {
  name: 'llm',
  allowedParents: ['agent'], // 只能在agent标签内
  allowedChildren: [], // 无子标签
  requiredAttributes: ['api-type', 'model'], // 必需属性
  optionalAttributes: ['api-url', 'key-env', 'temperature'], // 可选属性
  attributeTypes: {
    'api-type': 'string',
    'model': 'string',
    'api-url': 'string',
    'key-env': 'string',
    'temperature': 'number'
  },
  validator: validateLLMTag
}; 