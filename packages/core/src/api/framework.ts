/**
 * Framework模块API
 * 提供创建领域DPML编译器的功能
 */

import {
  createDomainCompiler,
  createTransformerDefiner as createTransformerDefinerImpl,
  createDPMLCLIService
} from '../core/framework/domainService';
import type {
  DomainCompiler,
  DomainConfig,
  TransformerDefiner,
  DomainDPML
} from '../types';


// 默认版本号，实际项目中应从package.json或专门的version.ts获取
const VERSION = '1.0.0';

// 导出类型
export type { DomainCompiler, DomainConfig, TransformerDefiner, DomainDPML };

/**
 * 创建领域DPML
 *
 * @template T 编译后的领域对象类型
 * @param config 领域配置
 * @returns 领域DPML实例，包含编译器和CLI
 *
 * @example
 * ```typescript
 * // 创建一个User模型的领域DPML
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * const userDPML = createDomainDPML<User>({
 *   domain: 'user',
 *   schema: userSchema,
 *   transformers: [userTransformer]
 * });
 *
 * // 使用编译器
 * const user = await userDPML.compiler.compile('<user id="1" name="张三" email="zhangsan@example.com" />');
 *
 * // 使用CLI
 * await userDPML.cli.execute();
 * ```
 */
export function createDomainDPML<T>(config: DomainConfig): DomainDPML<T> {
  // 创建领域编译器
  const compiler = createDomainCompiler<T>(config);

  // 创建领域CLI
  const cli = createDPMLCLIService();

  // 返回复合对象
  return {
    compiler,
    cli
  };
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

