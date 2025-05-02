/**
 * 转换器注册表类
 * 状态管理组件，维护转换器注册表
 */

import type { Transformer } from '../../types';
import { getLogger } from '../logging/loggingService';

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
   * 存储已注册的转换器名称，用于快速查找重复
   */
  private transformerNames: Set<string> = new Set();

  /**
   * 注册转换器
   * @param transformer 要注册的转换器
   * @throws {Error} 当尝试注册与已存在转换器同名的转换器时抛出错误
   */
  register<TInput, TOutput>(transformer: Transformer<TInput, TOutput>): void {
    const logger = getLogger('transformer.registry');

    // 检查转换器名称是否存在
    if (!transformer.name) {
      throw new Error('转换器必须指定名称，请使用新的接口创建转换器：defineStructuralMapper(name, rules)');
    }

    // 检查是否存在重名转换器
    if (this.transformerNames.has(transformer.name)) {
      throw new Error(`转换器名称冲突: "${transformer.name}" 已经被注册。每个转换器必须使用唯一的名称。`);
    }

    logger.debug('注册转换器', {
      name: transformer.name,
      transformersCount: this.transformers.length + 1
    });

    // 注册转换器
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
