/**
 * DPML CLI
 *
 * 命令行工具，用于与DPML生态交互
 */

import { CLI } from './core/cli';
import { CommandRegistry } from './core/registry';
import { CommandLoader } from './core/loader';
import { CommandExecutor } from './core/executor';
import { ConfigManager } from './core/config';

// 导出核心类和接口
export {
  CLI,
  CommandRegistry,
  CommandLoader,
  CommandExecutor,
  ConfigManager
};

// 导出类型接口
export * from './types/command';
export * from './types/config';

// 创建默认CLI实例
export const cli = new CLI();

// 默认导出CLI类
export default CLI;

export const version = '0.1.0';

/**
 * 运行CLI
 * @param argv 命令行参数
 * @returns Promise
 */
export async function run(argv: string[] = process.argv): Promise<void> {
  return cli.run(argv);
}
