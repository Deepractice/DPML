#!/usr/bin/env node
/**
 * DPML命令行工具入口
 * 注册并执行命令行界面
 */

import { createDPMLCLI } from './api/framework';

// CLI版本信息，可从package.json中获取
const VERSION = '1.0.0';

/**
 * 启动CLI
 */
async function main() {
  // 创建CLI实例
  const cli = createDPMLCLI({
    version: VERSION
  });

  // 执行CLI
  await cli.execute();
}

// 执行主函数
main().catch(error => {
  // 捕获main函数执行期间（如初始化阶段）的未处理错误
  console.error('CLI启动或执行过程中发生意外错误:', error);
  process.exit(1);
});
