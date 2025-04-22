/**
 * 转换器注册表类
 * 状态管理组件，维护转换器注册表
 */

import type { Transformer } from '../../types';

/**
 * 转换器注册表类
 * 管理已注册的转换器
 */
export class TransformerRegistry {
  /**
   * 存储已注册的转换器
   */
  private transformers: Array<Transformer<unknown, unknown>> = [];

  /**
   * 注册转换器
   * @param transformer 要注册的转换器
   */
  register<TInput, TOutput>(transformer: Transformer<TInput, TOutput>): void {
    this.transformers.push(transformer as Transformer<unknown, unknown>);
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
