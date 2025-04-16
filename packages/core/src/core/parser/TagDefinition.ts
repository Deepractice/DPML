/**
 * 标签定义实现模块
 * 提供标签定义的处理函数
 */

import type { ValidationResult } from '../../errors/types';
import type { TagDefinition, AttributeDefinition } from '../../types/parser/tag-definition';

/**
 * 规范化属性定义
 * 将简化的属性定义转换为完整形式
 *
 * @param attributes 原始属性定义
 * @returns 规范化后的属性定义
 */
export function normalizeAttributes(
  attributes?: string[] | Record<string, AttributeDefinition | boolean>
): Record<string, AttributeDefinition> {
  const normalized: Record<string, AttributeDefinition> = {};

  if (!attributes) {
    return normalized;
  }

  // 处理字符串数组形式
  if (Array.isArray(attributes)) {
    for (const attr of attributes) {
      normalized[attr] = { required: false };
    }

    return normalized;
  }

  // 处理对象形式
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === 'boolean') {
      normalized[key] = { required: value };
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

/**
 * 验证标签定义是否有效
 *
 * @param definition 标签定义
 * @returns 如果有效返回true，否则返回false
 */
export function validateTagDefinition(definition: TagDefinition): boolean {
  if (!definition) {
    return false;
  }

  // 验证属性定义
  if (definition.attributes && typeof definition.attributes === 'object' && !Array.isArray(definition.attributes)) {
    for (const [key, value] of Object.entries(definition.attributes)) {
      if (typeof value !== 'boolean' && typeof value !== 'object') {
        return false;
      }
    }
  }

  return true;
}
