/**
 * @dpml/example CLI入口
 */
import { exampleDPML } from './index';

/**
 * CLI主函数
 */
async function main() {
  try {
    // 执行CLI命令
    await exampleDPML.cli.execute();
  } catch (error) {
    // 处理错误
    console.error('CLI执行出错:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 运行主函数
main();
