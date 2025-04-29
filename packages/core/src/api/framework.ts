/**
 * Framework模块API
 * 提供创建领域DPML编译器的功能
 */

import {
  initializeDomain,
  compileDPML,
  extendDomain,
  getDomainSchema,
  getDomainTransformers,
} from '../core/framework/domainService';
import type { DomainCompiler, DomainConfig, Schema, Transformer } from '../types';

/**
 * 创建领域DPML编译器
 *
 * @template T 编译后的领域对象类型
 * @param config 领域配置
 * @returns 领域编译器实例
 *
 * @example
 * ```typescript
 * // 创建一个User模型的领域编译器
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * const userCompiler = createDomainDPML<User>({
 *   schema: userSchema,
 *   transformers: [userTransformer]
 * });
 *
 * // 编译DPML为User对象
 * const user = await userCompiler.compile('<user id="1" name="张三" email="zhangsan@example.com" />');
 * ```
 */
export function createDomainDPML<T>(config: DomainConfig): DomainCompiler<T> {
  // 初始化领域状态，使用闭包模式保持状态隔离
  const state = initializeDomain(config);

  // 返回领域编译器实现
  return {
    /**
     * 编译DPML内容为领域对象
     * @param content DPML内容字符串
     * @returns 编译后的领域对象
     */
    compile: async (content: string): Promise<T> => {
      return compileDPML<T>(content, state);
    },

    /**
     * 扩展当前配置
     * @param extensionConfig 要合并的配置片段
     */
    extend: (extensionConfig: Partial<DomainConfig>): void => {
      extendDomain(state, extensionConfig);
    },

    /**
     * 获取当前架构
     * @returns 当前架构对象
     */
    getSchema: (): Schema => {
      return getDomainSchema(state);
    },

    /**
     * 获取当前转换器集合
     * @returns 转换器数组
     */
    getTransformers: (): Array<Transformer<unknown, unknown>> => {
      return getDomainTransformers(state);
    }
  };
}
