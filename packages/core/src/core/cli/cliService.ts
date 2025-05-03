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
        // 检查是否是Commander的帮助或版本显示错误
        if (error && typeof error === 'object' && 'code' in error) {
          const code = error.code as string;

          if (code === 'commander.helpDisplayed' || code === 'commander.help' || code === 'commander.version') {
            // 正常处理帮助和版本显示
            return;
          }
        }

        // 在CLI服务层捕获所有来自底层的错误
        console.error('Command execution error:', error);

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

  console.log(`CLI initialized: ${options.name} v${options.version}`);
  console.log(`Default domain: ${options.defaultDomain}`);
}

/**
 * 设置用户命令
 *
 * @param adapter CLI适配器
 * @param commands 命令定义数组
 */
function setupUserCommands(adapter: CLIAdapter, commands: CommandDefinition[]): void {
  // 按领域分组命令
  const domainCommands = new Map<string, CommandDefinition[]>();

  commands.forEach(command => {
    const domain = command.category || 'default';

    if (!domainCommands.has(domain)) {
      domainCommands.set(domain, []);
    }

    domainCommands.get(domain)!.push(command);
  });

  // 为每个领域创建父命令
  domainCommands.forEach((cmds, domain) => {
    if (domain === 'default') {
      // 无领域的命令直接注册
      cmds.forEach(cmd => adapter.setupCommand(cmd));

      return;
    }

    // 创建领域父命令
    const domainCommand: CommandDefinition = {
      name: domain,
      description: `Commands for ${domain} domain`,
      action: () => {
        // 只显示该领域的帮助信息
        console.log(`\nAvailable commands for ${domain} domain:`);
        cmds.forEach(cmd => {
          console.log(`  ${domain} ${cmd.name.padEnd(10)} ${cmd.description}`);
        });
        console.log(`\nUse 'dpml ${domain} --help' for more information`);
      }
    };

    // 注册领域命令
    adapter.setupCommand(domainCommand);

    // 注册该领域下的所有命令
    cmds.forEach(cmd => {
      // 移除领域标记，因为已经通过父命令表示
      const { category, ...cmdWithoutCategory } = cmd;

      // 注册为父命令的子命令
      adapter.setupCommand(cmdWithoutCategory, domain);
    });

    // 为核心领域创建别名（向后兼容）
    if (domain === 'core') {
      cmds.forEach(cmd => {
        // 提取不包含领域的命令名
        const plainName = cmd.name;

        // 创建与领域命令相同功能的别名
        adapter.setupCommand({
          ...cmd,
          category: undefined, // 无需再次添加领域
          description: `${cmd.description} (Alias for core domain command)`
        });
      });
    }
  });
}

/**
 * 注册外部命令
 *
 * @param adapter CLI适配器
 * @param commands 命令定义数组
 */
export function registerExternalCommands(adapter: CLIAdapter, commands: CommandDefinition[]): void {
  // 按领域分组命令
  const domainCommands = new Map<string, CommandDefinition[]>();

  commands.forEach(command => {
    const domain = command.category || 'default';

    if (!domainCommands.has(domain)) {
      domainCommands.set(domain, []);
    }

    domainCommands.get(domain)!.push(command);
  });

  // 为每个领域注册命令
  domainCommands.forEach((cmds, domain) => {
    if (domain === 'default') {
      // 无领域的命令直接注册
      cmds.forEach(cmd => adapter.setupCommand(cmd));

      return;
    }

    // 注册该领域下的所有命令
    cmds.forEach(cmd => {
      // 移除领域标记，因为已经通过父命令表示
      const { category, ...cmdWithoutCategory } = cmd;

      // 注册为父命令的子命令
      adapter.setupCommand(cmdWithoutCategory, domain);
    });
  });
}
