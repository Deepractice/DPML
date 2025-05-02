#!/usr/bin/env node
/**
 * DPML命令行工具入口
 * 注册并执行命令行界面
 */

// 直接从原始模块导入，避免可能的循环引用
import { createDomainDPML } from './api/framework';

// CLI版本信息，可从package.json中获取
const VERSION = '1.0.0';

/**
 * 启动CLI
 */
async function main() {
  // 创建领域DPML实例（使用默认核心领域配置）
  const dpml = createDomainDPML({
    domain: 'core',
    description: 'DPML核心领域',
    schema: { element: 'root' }, // 简单的schema
    transformers: [{
      name: 'default',
      transform: data => data
    }],
    commands: {
      includeStandard: true,
      actions: []
    }
  });

  // 使用CLI执行命令
  await dpml.cli.execute();
}

// 执行主函数
main().catch(error => {
  // 捕获main函数执行期间（如初始化阶段）的未处理错误
  console.error('CLI启动或执行过程中发生意外错误:', error);
  process.exit(1);
});
