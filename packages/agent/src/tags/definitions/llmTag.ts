import type {
  Element,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '@dpml/core';

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
 * llm标签验证函数
 */
export function validateLLMTag(
  element: Element,
  context: any
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 验证api-url是否为有效URL
  const apiUrl = element.attributes['api-url'];

  if (!apiUrl) {
    errors.push({
      code: 'MISSING_REQUIRED_ATTRIBUTE',
      message: 'LLM标签必须包含api-url属性',
    });
  } else if (!isValidUrl(apiUrl)) {
    errors.push({
      code: 'INVALID_API_URL',
      message: `API URL无效: ${apiUrl}`,
    });
  }

  // 验证api-type是否为支持的类型
  const apiType = element.attributes['api-type'];
  const supportedApiTypes = [
    'openai',
    'anthropic',
    'azure',
    'mistral',
    'custom',
  ];

  if (apiType && !supportedApiTypes.includes(apiType as string)) {
    warnings.push({
      code: 'UNSUPPORTED_API_TYPE',
      message: `不支持的API类型: ${apiType}。支持的类型: ${supportedApiTypes.join(', ')}`,
    });
  }

  // 检查是否缺少API密钥环境变量
  if (!element.attributes['key-env']) {
    warnings.push({
      code: 'MISSING_KEY_ENV',
      message: '建议设置key-env属性以指定API密钥的环境变量',
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
  requiredAttributes: ['model', 'api-url'], // 必需属性，增加了api-url
  optionalAttributes: ['api-type', 'key-env'], // 可选属性，移除了extends和temperature
  attributeTypes: {
    'api-type': 'string',
    model: 'string',
    'api-url': 'string',
    'key-env': 'string',
  },
  validator: validateLLMTag,
};
