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
  CLI,
  CLIOptions
} from '../types';


// 默认版本号，实际项目中应从package.json或专门的version.ts获取
const VERSION = '1.0.0';

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
 * 创建DPML命令行工具实例
 *
 * 此函数作为DPML CLI的统一入口点，委托给domainService实现核心功能。
 *
 * @param options 可选的CLI配置选项，用于覆盖默认设置（如名称、版本、描述）
 * @returns 配置完成的CLI实例
 *
 * @example
 * ```typescript
 * // 在 bin.ts 或其他入口脚本中使用
 * import { createDPMLCLI } from '@dpml/core';
 *
 * async function main() {
 *   const cli = createDPMLCLI({ version: '1.2.3' });
 *   await cli.execute();
 * }
 *
 * main().catch(error => {
 *   console.error("CLI执行失败:", error);
 *   process.exit(1);
 * });
 * ```
 */
export function createDPMLCLI(options?: Partial<CLIOptions>): CLI {
  return createDPMLCLIService(options);
}

