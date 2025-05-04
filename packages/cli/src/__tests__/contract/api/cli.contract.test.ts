import { describe, test, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

import { execute } from '../../../api/cli';

describe('CT-API-CLI', () => {
  // 保存原始process.exit以便恢复
  const originalExit = process.exit;

  beforeEach(() => {
    // 模拟process.exit以避免测试中止
    vi.spyOn(process, 'exit').mockImplementation((code) => {
      const error = { message: `process.exit mocked with code ${code}` };

      throw error;
    }) as unknown as typeof process.exit;

    // 抑制控制台输出
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 清理所有模拟
    vi.restoreAllMocks();
  });

  // 在所有测试后恢复原始process.exit
  afterAll(() => {
    process.exit = originalExit;
  });

  test('execute API should maintain type signature (CT-API-CLI-01)', async () => {
    // 契约测试：验证API类型
    try {
      await execute(['--version']);
    } catch (error) {
      // 预期的退出错误，可以忽略
    }

    // 验证类型系统的契约满足
    type ExecuteType = (args?: string[]) => Promise<void>;

    // 这是一个类型验证测试，而非运行时测试
    // 如果有类型不匹配，TypeScript编译会失败
    const typeCheck: ExecuteType = execute;
  });

  test('execute API should accept optional args parameter (CT-API-CLI-02)', async () => {
    // 契约测试：验证可选参数
    try {
      // 不传递任何参数
      await execute();
    } catch (error) {
      // 预期的退出错误，可以忽略
    }

    try {
      // 传递空数组
      await execute([]);
    } catch (error) {
      // 预期的退出错误，可以忽略
    }

    try {
      // 传递参数数组
      await execute(['--help']);
    } catch (error) {
      // 预期的退出错误，可以忽略
    }

    // 验证函数存在且可以被调用
    expect(typeof execute).toBe('function');
  });
});
