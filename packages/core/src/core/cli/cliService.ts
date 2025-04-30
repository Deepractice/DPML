/**
 * CLI服务层
 * 提供CLI创建和管理功能
 */

import type { CLITypes, CLIOptions, CommandDefinition } from '../../types/CLITypes';

import { CLIAdapter } from './CLIAdapter';
import { mergeDefaultOptions, validateCommands } from './commandUtils';

/**
 * 创建命令行界面
 *
 * @param options CLI选项
 * @param commands 命令定义数组
 * @returns CLI实例
 */
export function createCLI(options: CLIOptions, commands: CommandDefinition[]): CLITypes {
  // 合并默认选项
  const mergedOptions = mergeDefaultOptions(options);

  // 验证命令无重复
  validateCommands(commands);

  // 创建适配器
  const adapter = new CLIAdapter(
    mergedOptions.name,
    mergedOptions.version,
    mergedOptions.description
  );

  // 设置全局选项
  setupGlobalOptions(adapter, mergedOptions);

  // 设置用户命令
  setupUserCommands(adapter, commands);

  // 返回CLI接口
  return {
    execute: (argv?: string[]) => adapter.parse(argv),
    showHelp: () => adapter.showHelp(),
    showVersion: () => adapter.showVersion(),
    registerCommands: (externalCommands: CommandDefinition[]) => {
      validateCommands(externalCommands);
      registerExternalCommands(adapter, externalCommands);
    }
  };
}

/**
 * 设置全局选项
 *
 * @param adapter CLI适配器
 * @param options CLI选项
 */
function setupGlobalOptions(adapter: CLIAdapter, options: Required<CLIOptions>): void {
  // 全局选项实现
  // 这里可以根据需要添加全局选项，如--verbose等
  console.log(`CLI初始化: ${options.name} v${options.version}`);
  console.log(`默认领域: ${options.defaultDomain}`);
}

/**
 * 设置用户命令
 *
 * @param adapter CLI适配器
 * @param commands 命令定义数组
 */
function setupUserCommands(adapter: CLIAdapter, commands: CommandDefinition[]): void {
  commands.forEach(command => adapter.setupCommand(command));
}

/**
 * 注册外部命令
 *
 * @param adapter CLI适配器
 * @param commands 命令定义数组
 */
export function registerExternalCommands(adapter: CLIAdapter, commands: CommandDefinition[]): void {
  commands.forEach(command => adapter.setupCommand(command));
}
