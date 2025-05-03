#!/usr/bin/env node
/**
 * DPML Agent CLI工具
 *
 * 提供命令行接口，用于管理和使用通过DPML定义的Agent。
 * 基于@dpml/core的CLI基础设施实现。
 *
 * 使用示例:
 * ```bash
 * # 验证Agent配置
 * dpml agent validate agent-config.xml
 *
 * # 与Agent交互
 * dpml agent chat agent-config.xml
 *
 * # 使用环境变量
 * dpml agent chat agent-config.xml --env API_KEY=sk-xxxx
 * ```
 */

import { agentDPML } from './index';

/**
 * CLI主函数
 */
async function main() {
  try {
    // 执行CLI命令
    await agentDPML.cli.execute();
  } catch (error) {
    console.error('CLI执行出错:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 运行主函数
main();
