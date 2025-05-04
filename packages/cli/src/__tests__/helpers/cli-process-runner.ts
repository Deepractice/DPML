import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import { execa } from 'execa';

/**
 * Run CLI command as a child process
 *
 * @param args Command line arguments array
 * @returns Object containing stdout, stderr and exit code
 */
export async function runCLIProcess(args: string[] = []): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  // Find CLI entry script in dist directory
  // 注意：我们使用CJS版本来避免ESM模块加载问题
  const binPath = path.resolve(process.cwd(), 'packages/cli/dist/bin.cjs');

  // Check if debug mode
  const isDebug = args.includes('--debug') || process.env.DEBUG === 'true';

  if (isDebug) {
    console.log(`[DEBUG] Executing command: node ${binPath} ${args.join(' ')}`);
  }

  try {
    // 确保文件存在
    try {
      await fs.access(binPath);
    } catch (err) {
      if (isDebug) {
        console.warn(`Binary path ${binPath} not found, falling back to direct CLI execution`);
      }

      // 尝试寻找其他可能的路径
      const alternatePath = path.resolve(process.cwd(), 'dist/bin.cjs');

      try {
        await fs.access(alternatePath);
        if (isDebug) {
          console.log(`[DEBUG] Found alternate binary path: ${alternatePath}`);
        }

        // 使用替代路径
        return runWithPath(alternatePath, args, isDebug);
      } catch (_ignored) {
        // 如果找不到bin文件，返回清晰的错误
        return {
          stdout: '',
          stderr: `File not found: ${binPath}. Please build the CLI first with 'pnpm build'.`,
          exitCode: 1
        };
      }
    }

    return runWithPath(binPath, args, isDebug);
  } catch (error: unknown) {
    // Handle execution errors
    const errorMessage = error instanceof Error ? error.message : 'Execution error';

    if (isDebug) {
      console.error('[DEBUG] Error executing command:', errorMessage);
    }

    return {
      stdout: '',
      stderr: errorMessage,
      exitCode: 1
    };
  }
}

/**
 * Run CLI command with specified binary path
 *
 * @param binPath Binary path
 * @param args Command arguments
 * @param isDebug Debug mode flag
 * @returns Execution result
 */
async function runWithPath(binPath: string, args: string[], isDebug: boolean): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  if (isDebug) {
    console.log('[DEBUG] Executing with environment:', {
      NODE_ENV: 'test',
      DEBUG: isDebug ? 'true' : undefined
    });
  }

  // Execute command (使用stdio配置减少未捕获错误)
  const result = await execa('node', [binPath, ...args], {
    reject: false,  // Don't throw exception even if command fails
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DEBUG: isDebug ? 'true' : undefined
    },
    all: true,  // Capture stdout and stderr to the same stream
    stdio: ['ignore', 'pipe', 'pipe'] // 忽略stdin，捕获stdout和stderr
  });

  if (isDebug) {
    console.log('[DEBUG] Command execution result:');
    console.log('[DEBUG] stdout:', result.stdout || '(empty)');
    console.log('[DEBUG] stderr:', result.stderr || '(empty)');
    console.log('[DEBUG] exitCode:', result.exitCode);
  }

  // 合并输出确保捕获所有信息
  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const exitCode = result.exitCode === 0 ? 0 : 1; // 强制exitCode为0或1

  return { stdout, stderr, exitCode };
}

/**
 * Create a test config file
 *
 * @param content File content
 * @param fileName File name
 * @returns Created file path
 */
export async function createTestConfigFile(content: string, fileName: string): Promise<string> {
  const tempDir = path.join(os.tmpdir(), 'dpml-tests', Date.now().toString());

  await fs.mkdir(tempDir, { recursive: true });

  const filePath = path.join(tempDir, fileName);

  await fs.writeFile(filePath, content);

  return filePath;
}

/**
 * Clean up test file
 *
 * @param filePath File path
 */
export async function cleanupTestFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    // Try to remove temp directory
    const dirPath = path.dirname(filePath);

    await fs.rm(dirPath, { recursive: true });
  } catch (error: unknown) {
    // Ignore deletion errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.warn(`Failed to clean up test file: ${errorMessage}`);
  }
}
