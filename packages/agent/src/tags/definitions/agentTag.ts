import { isElement } from '@dpml/core';

import type {
  Element,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '@dpml/core';

/**
 * agent标签验证函数
 */
export function validateAgentTag(
  element: Element,
  context: any
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 验证ID格式
  const id = element.attributes.id;

  if (id && !/^[a-z0-9-_]+$/i.test(id)) {
    errors.push({
      code: 'INVALID_ID_FORMAT',
      message: 'Agent ID只能包含字母、数字、短横线和下划线',
    });
  }

  // 检查ID是否重复
  if (id && context.ids && context.ids.has(id)) {
    errors.push({
      code: 'DUPLICATE_ID',
      message: `ID "${id}" 已被使用`,
    });
  }

  // 验证是否缺少必要的子标签
  const hasLLM = element.children.some(
    (child: any) => isElement(child) && child.tagName === 'llm'
  );

  if (!hasLLM) {
    errors.push({
      code: 'MISSING_REQUIRED_CHILD',
      message: 'Agent标签必须包含llm子标签',
    });
  }

  const hasPrompt = element.children.some(
    (child: any) => isElement(child) && child.tagName === 'prompt'
  );

  if (!hasPrompt) {
    errors.push({
      code: 'MISSING_REQUIRED_CHILD',
      message: 'Agent标签必须包含prompt子标签',
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * agent标签定义
 */
export const agentTagDefinition = {
  name: 'agent',
  allowedParents: [], // 顶层标签，无父标签限制
  allowedChildren: ['llm', 'prompt'], // 允许的子标签
  requiredAttributes: ['id'], // 必需属性
  optionalAttributes: ['version'], // 可选属性，移除了extends
  attributeTypes: {
    // 属性类型定义
    id: 'string',
    version: 'string',
  },
  validator: validateAgentTag, // 自定义验证函数
};
