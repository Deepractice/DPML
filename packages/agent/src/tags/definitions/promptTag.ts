import { Element } from '@dpml/core';

/**
 * prompt标签委托给@dpml/prompt包处理
 * 这里仅定义基本结构约束
 */
export const promptTagDefinition = {
  name: 'prompt',
  allowedParents: ['agent'],
  allowedChildren: [], // 内部结构由prompt包处理
  optionalAttributes: [], // 移除了extends
  attributeTypes: {}
}; 