/**
 * defineTransformer - 定义 DPML Transformer
 */

import type { Transformer } from '@dpml/core';
import type { TransformerDefinition } from './types';

/**
 * 定义 Transformer
 *
 * @param definition Transformer 定义
 * @returns Transformer 对象
 *
 * @example
 * ```typescript
 * const transformer = defineTransformer<ProcessingResult, PromptConfig>({
 *   name: "prompt-transformer",
 *   transform(input, context) {
 *     return {
 *       role: input.document.rootNode.attributes?.role,
 *       content: input.document.rootNode.content
 *     };
 *   }
 * });
 * ```
 */
export function defineTransformer<TInput = unknown, TOutput = unknown>(
  definition: TransformerDefinition<TInput, TOutput>
): Transformer<TInput, TOutput> {
  // 验证基本结构
  if (!definition || typeof definition !== 'object') {
    throw new Error('Transformer definition must be an object');
  }

  if (!definition.name || typeof definition.name !== 'string') {
    throw new Error('Transformer must have a name');
  }

  if (typeof definition.transform !== 'function') {
    throw new Error('Transformer must have a transform function');
  }

  // 返回 Transformer 对象
  return {
    name: definition.name,
    description: definition.description,
    transform: definition.transform,
  };
}
