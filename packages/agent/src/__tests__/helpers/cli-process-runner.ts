import { execa } from 'execa';
import path from 'path';

/**
 * 以子进程方式运行CLI命令
 * 
 * @param command 命令字符串，如 'agent chat'
 * @param args 命令参数数组
 * @returns 包含标准输出、错误输出和退出码的对象
 */
export async function runCLICommand(command: string, args: string[] = []): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  // 在项目根目录找到CLI入口脚本
  const binPath = path.resolve(process.cwd(), 'packages/agent/dist/bin.js');
  
  // 检查是否为debug模式
  const isDebug = args.includes('--debug');
  
  if (isDebug) {
    console.log(`[DEBUG] 执行命令: node ${binPath} ${command} ${args.join(' ')}`);
  }
  
  try {
    // 执行命令
    const result = await execa('node', [binPath, ...command.split(' '), ...args], {
      reject: false,  // 即使命令失败也不要抛出异常
      env: { 
        ...process.env,
        NODE_ENV: 'test',
        DEBUG: isDebug ? 'true' : undefined
      },
      all: true  // 捕获stdout和stderr到同一个流，确保按顺序获取所有输出
    });
    
    if (isDebug) {
      console.log('[DEBUG] 命令执行结果:');
      console.log('[DEBUG] stdout:', result.stdout);
      console.log('[DEBUG] stderr:', result.stderr);
      console.log('[DEBUG] exitCode:', result.exitCode);
      console.log('[DEBUG] all:', result.all);
    }
    
    // 确保我们能捕获到所有错误输出
    let enhancedStderr = result.stderr || '';
    
    // 如果all包含错误信息但stderr没有，则添加到stderr
    if (result.all && !enhancedStderr.includes('领域编译器尚未初始化') && 
        result.all.includes('领域编译器尚未初始化')) {
      enhancedStderr += '\n' + result.all;
    }
    
    return { 
      stdout: result.stdout || '', 
      stderr: enhancedStderr,
      exitCode: result.exitCode || 1 // 确保exitCode始终是数字
    };
  } catch (error: unknown) {
    // 处理执行错误
    const errorMessage = error instanceof Error ? error.message : '执行错误';
    
    if (isDebug) {
      console.error('[DEBUG] 执行命令时出错:', errorMessage);
    }
    
    return { 
      stdout: '', 
      stderr: errorMessage, 
      exitCode: 1 
    };
  }
}

/**
 * 创建测试配置文件
 * 
 * @param content 配置文件内容
 * @param fileName 文件名
 * @returns 创建的文件路径
 */
export async function createTestConfigFile(content: string, fileName: string): Promise<string> {
  const fs = await import('fs/promises');
  const os = await import('os');
  const path = await import('path');
  
  const tempDir = path.join(os.tmpdir(), 'dpml-tests', Date.now().toString());
  await fs.mkdir(tempDir, { recursive: true });
  
  const filePath = path.join(tempDir, fileName);
  await fs.writeFile(filePath, content);
  
  return filePath;
}

/**
 * 清理测试文件
 * 
 * @param filePath 文件路径
 */
export async function cleanupTestFile(filePath: string): Promise<void> {
  const fs = await import('fs/promises');
  try {
    await fs.unlink(filePath);
    // 尝试删除临时目录
    const path = await import('path');
    const dirPath = path.dirname(filePath);
    await fs.rmdir(dirPath, { recursive: true });
  } catch (error: unknown) {
    // 忽略删除错误
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.warn(`清理测试文件失败: ${errorMessage}`);
  }
} 