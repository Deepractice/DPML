#!/usr/bin/env node
/**
 * DPML CLI 命令行入口点
 */

import { cli } from './index';

// 获取命令行参数，移除Node.js和脚本路径
const argv = process.argv;

// 启动CLI
cli.run(argv)
  .catch((error) => {
    console.error('CLI启动错误:', error);
    process.exit(1);
  });
