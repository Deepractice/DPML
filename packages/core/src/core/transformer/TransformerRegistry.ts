/**
 * Transformer Registry
 * State management component for transformer registration
 */

import type { Transformer } from '../../types';

/**
 * Transformer Registry class
 * Manages registered transformers
 */
export class TransformerRegistry {
  private transformers: Array<Transformer<unknown, unknown>> = [];
  private transformerNames: Set<string> = new Set();

  /**
   * Register a transformer
   * @param transformer Transformer to register
   * @throws {Error} When registering a transformer with duplicate name
   */
  register<TInput, TOutput>(transformer: Transformer<TInput, TOutput>): void {
    if (!transformer.name) {
      throw new Error('Transformer must have a name');
    }

    if (this.transformerNames.has(transformer.name)) {
      throw new Error(
        `Transformer name conflict: "${transformer.name}" is already registered`
      );
    }

    this.transformers.push(transformer as Transformer<unknown, unknown>);
    this.transformerNames.add(transformer.name);
  }

  /**
   * 获取所有转换器
   * @returns 已注册的转换器数组
   */
  getTransformers(): Array<Transformer<unknown, unknown>> {
    return [...this.transformers];
  }
}

/**
 * 全局注册表实例
 */
let globalRegistry: TransformerRegistry | null = null;

/**
 * 转换器注册表工厂
 * 获取全局注册表单例
 */
export function transformerRegistryFactory(): TransformerRegistry {
  if (!globalRegistry) {
    globalRegistry = new TransformerRegistry();
  }

  return globalRegistry;
}
