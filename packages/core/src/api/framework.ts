/**
 * Framework模块API
 * 提供创建领域DPML编译器的功能
 */

import {
  createDomainCompiler,
  createTransformerDefiner as createTransformerDefinerImpl
} from '../core/framework/domainService';
import type {
  DomainCompiler,
  DomainConfig,
  TransformerDefiner
} from '../types';
import type { CommandDefinition } from '../types/CLITypes';

// 导出类型
export type { DomainCompiler, DomainConfig, TransformerDefiner };

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
  return createDomainCompiler<T>(config);
}

/**
 * 创建转换器定义器
 *
 * @returns 转换器定义器实例，提供各种转换器的定义方法
 *
 * @example
 * ```typescript
 * // 获取转换器定义器
 * const definer = createTransformerDefiner();
 *
 * // 定义结构映射转换器
 * const mapperTransformer = definer.defineStructuralMapper([
 *   { selector: 'user', targetPath: 'userInfo' },
 *   { selector: 'user[id]', targetPath: 'userInfo.id' }
 * ]);
 *
 * // 定义模板转换器
 * const templateTransformer = definer.defineTemplateTransformer('Hello, {{name}}!');
 * ```
 */
export function createTransformerDefiner(): TransformerDefiner {
  return createTransformerDefinerImpl();
}

/**
 * 获取framework注册的所有命令，以CLI可接受的CommandDefinition[]格式返回
 *
 * @returns 符合CLI要求的命令定义数组
 */
export function getCommandDefinitions(): CommandDefinition[] {
  // 这里从framework内部获取领域命令
  // 实际实现需要与domainService协调
  // 这只是一个适配层，将framework内部命令格式转换为CLI可接受的格式
  return [];
}
