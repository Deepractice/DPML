/**
 * 命令行工具函数
 * 提供CLI命令处理的辅助函数
 */

import type { CLIOptions, CommandDefinition } from '../../types/CLI';

/**
 * 合并默认选项
 * 为CLI选项提供默认值
 *
 * @param options 用户提供的选项
 * @returns 合并了默认值的选项对象
 */
export function mergeDefaultOptions(options: CLIOptions): Required<CLIOptions> {
  return {
    defaultDomain: 'core',
    ...options
  } as Required<CLIOptions>;
}

/**
 * 获取命令路径
 * 构建完整命令路径用于唯一标识
 *
 * @param command 命令定义
 * @param parentPath 父命令路径
 * @returns 完整命令路径
 */
export function getCommandPath(command: CommandDefinition, parentPath?: string): string {
  console.log(`生成命令路径, 命令: ${command.name}, 父路径: ${parentPath || '无'}, 领域: ${command.domain || '无'}`);

  // 构建基本路径
  let path = command.name;

  // 添加父路径前缀（使用空格分隔）
  if (parentPath) {
    path = `${parentPath} ${path}`;
  }

  // 添加领域前缀（针对根命令）
  if (command.domain && !parentPath) {
    path = `${command.domain}:${path}`;
  }

  console.log(`最终路径: ${path}`);

  return path;
}

/**
 * 验证命令没有重复
 * 遍历命令树，检测命令名重复
 *
 * @param commands 命令定义数组
 * @throws 当发现重复命令时抛出错误
 */
export function validateCommands(commands: CommandDefinition[]): void {
  const pathSet = new Set<string>();
  // 新增：跨领域命令映射，用于检测不同领域的同名命令
  const crossDomainMap = new Map<string, string[]>();

  function validateCommandTree(command: CommandDefinition, parentPath?: string) {
    const path = getCommandPath(command, parentPath);

    // 检查完整路径（包含领域）是否重复
    if (pathSet.has(path)) {
      throw new Error(`重复的命令定义: ${path}`);
    }

    pathSet.add(path);

    // 新增：跨领域命令检测
    // 不考虑子命令，只检测顶级命令
    if (!parentPath && command.name) {
      // 记录命令名到领域的映射
      const domain = command.domain || 'default';
      const registeredDomains = crossDomainMap.get(command.name) || [];

      // 检查此命令名是否已在其他领域注册
      if (registeredDomains.length > 0 && !registeredDomains.includes(domain)) {
        const conflictDomains = registeredDomains.join(', ');

        console.warn(`警告: 命令 "${command.name}" 在多个领域中定义: ${conflictDomains} 和 ${domain}`);
      }

      // 记录此命令名的领域
      if (!registeredDomains.includes(domain)) {
        crossDomainMap.set(command.name, [...registeredDomains, domain]);
      }
    }

    if (command.subcommands && command.subcommands.length > 0) {
      for (const subcommand of command.subcommands) {
        validateCommandTree(subcommand, path);
      }
    }
  }

  for (const command of commands) {
    validateCommandTree(command);
  }

  // 输出跨领域命令信息
  if (crossDomainMap.size > 0) {
    console.log('跨领域命令映射:');
    crossDomainMap.forEach((domains, cmdName) => {
      if (domains.length > 1) {
        console.log(`  命令 "${cmdName}" 存在于以下领域: ${domains.join(', ')}`);
      }
    });
  }
}
