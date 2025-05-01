/**
 * CLI服务层
 * 提供CLI创建和管理功能
 */

import type { CLI, CLIOptions, CommandDefinition } from '../../types/CLI';

import { CLIAdapter } from './CLIAdapter';
import { mergeDefaultOptions, validateCommands } from './commandUtils';

/**
 * 创建命令行界面
 *
 * @param options CLI选项
 * @param commands 命令定义数组
 * @returns CLI实例
 */
export function createCLI(options: CLIOptions, commands: CommandDefinition[]): CLI {
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
    execute: async (argv?: string[]) => {
      try {
        // 调用底层适配器解析参数
        await adapter.parse(argv);
      } catch (error) {
        // 在CLI服务层捕获所有来自底层的错误
        console.error('命令执行出错:', error);

        // 仅在非测试环境下退出进程，避免中断测试执行
        if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
          process.exit(1); // 使用非零退出码表示错误
        }

        // 重新抛出错误，允许上层调用者根据需要处理
        throw error;
      }
    },
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
