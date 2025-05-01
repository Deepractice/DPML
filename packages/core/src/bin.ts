#!/usr/bin/env node
/**
 * DPML命令行工具入口
 * 注册并执行命令行界面
 */

import { createCLI } from './api/cli';
import standardActions from './core/framework/cli/standardActions';
import {
  getAllRegisteredCommands,
  registerCommands,
  initializeDomain,
  processDomainCommands
} from './core/framework/domainService';

// CLI版本信息，可从package.json中获取
const VERSION = '1.0.0';

/**
 * 启动CLI
 */
async function main() {
  // 创建基本CLI实例
  const cli = createCLI(
    {
      name: 'dpml',
      version: VERSION,
      description: 'DPML命令行工具 - 数据处理标记语言'
    },
    []
  );

  // 注册core领域命令
  // 创建一个基本的领域上下文用于命令注册
  const coreContext = initializeDomain({
    domain: 'core',
    description: 'DPML核心领域',
    schema: { element: 'root' }, // 简单的schema
    transformers: [{
      name: 'default',
      transform: data => data
    }]
  });

  // 注册标准命令到命令注册表
  processDomainCommands({
    includeStandard: true,
    actions: []
  }, coreContext);

  // 获取所有已注册命令
  const registeredCommands = getAllRegisteredCommands();

  // 将命令注册到CLI
  cli.registerCommands(registeredCommands);

  // 注册没有前缀的core命令版本
  const coreCommands = registeredCommands.filter(cmd => cmd.category === 'core');

  // 克隆core命令并移除category属性，实现不带前缀的版本
  const unprefixedCoreCommands = coreCommands.map(cmd => {
    // 创建命令的副本
    const unprefixedCmd = { ...cmd };

    // 移除category以避免前缀
    delete unprefixedCmd.category;

    // 移除领域前缀
    unprefixedCmd.name = unprefixedCmd.name.replace(/^core:/, '');

    return unprefixedCmd;
  });

  // 注册无前缀版本
  cli.registerCommands(unprefixedCoreCommands);

  // 执行CLI
  try {
    await cli.execute();
  } catch (error) {
    // Commander.js通过抛出特殊错误显示帮助信息，这不是真正的错误
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error.code === 'commander.helpDisplayed' || error.code === 'commander.version')
    ) {
      process.exit(0); // 正常退出
    }

    console.error('命令执行出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('CLI启动失败:', error);
  process.exit(1);
});
