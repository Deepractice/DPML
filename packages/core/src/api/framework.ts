/**
 * Framework模块API
 * 提供创建领域DPML编译器的功能
 */

import {
  createDomainCompiler,
  createTransformerDefiner as createTransformerDefinerImpl,
  ensureCoreInitialized,
  getAllRegisteredCommands,
  getDefaultDomainName
} from '../core/framework/domainService';
import type {
  DomainCompiler,
  DomainConfig,
  TransformerDefiner,
  CLI,
  CLIOptions,
  CommandDefinition
} from '../types';

import { createCLI } from './cli';

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
 * 此函数作为DPML CLI的统一入口点，负责：
 * 1. 初始化核心领域（如果尚未完成）
 * 2. 从domainService获取所有已注册的领域命令
 * 3. 创建基础CLI实例
 * 4. 将所有领域命令注册到CLI实例中
 * 5. 为默认领域（如'core'）的命令创建无前缀的别名
 * 6. 返回一个完全配置好的、可执行的CLI实例
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
  // 确保核心命令已注册
  ensureCoreInitialized();

  // 准备CLI选项
  const cliOptions: CLIOptions = {
    name: options?.name || 'dpml',
    version: options?.version || VERSION,
    description: options?.description || 'DPML命令行工具 - 数据处理标记语言',
    defaultDomain: options?.defaultDomain
  };

  // 1. 创建基础CLI实例 (不包含命令)
  const cli = createCLI(cliOptions, []);

  // 2. 获取所有已注册的领域命令
  const allCommands = getAllRegisteredCommands();

  // 3. 注册所有原始命令 (带领域前缀，如 core:parse)
  cli.registerCommands(allCommands);

  // 4. 处理默认领域的无前缀命令
  const defaultDomainName = getDefaultDomainName();
  const defaultDomainCommands = allCommands
    .filter(cmd => cmd.category === defaultDomainName)
    .map(cmd => {
      // 创建命令副本，移除领域信息以避免前缀
      const unprefixedCmd: CommandDefinition = {
        ...cmd,
        // 从名称中移除前缀 'core:'
        name: cmd.name.replace(`${defaultDomainName}:`, ''),
        // 移除category属性，确保不会添加前缀
        category: undefined,
        // 调整描述说明这是别名
        description: `${cmd.description} (核心领域命令的别名)`
      };

      return unprefixedCmd;
    });

  // 5. 注册无前缀的默认领域命令别名
  if (defaultDomainCommands.length > 0) {
    cli.registerCommands(defaultDomainCommands);
  }

  // 6. 返回完全配置的CLI实例
  return cli;
}

