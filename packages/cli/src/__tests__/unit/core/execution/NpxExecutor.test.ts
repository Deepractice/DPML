import { describe, test, expect, vi, beforeEach } from 'vitest';

import { NpxExecutor } from '../../../../core/execution/NpxExecutor';
import { DPMLError } from '../../../../types/DPMLError';
import { createDomainInfoFixture } from '../../../fixtures/cli/cliFixtures';

// Mock execa - 使用工厂函数而不是直接引用变量
vi.mock('execa', () => ({
  execa: vi.fn()
}));

// 导入已模拟的模块
import { execa } from 'execa';

describe('UT-NPXEXEC', () => {
  const domainFixtures = createDomainInfoFixture();

  beforeEach(() => {
    vi.clearAllMocks();
    // 默认返回成功状态，提供正确类型
    vi.mocked(execa).mockResolvedValue({
      exitCode: 0,
      stdout: '',
      stderr: '',
      failed: false,
      killed: false,
      signal: undefined,
      command: '',
      escapedCommand: '',
      timedOut: false,
      isCanceled: false,
      all: undefined
    });
  });

  test('constructor should store domain info (UT-NPXEXEC-01)', () => {
    // Arrange & Act
    const executor = new NpxExecutor(domainFixtures.core);

    // Assert
    expect(executor.getDomainInfo()).toBe(domainFixtures.core);
  });

  test('getDomainInfo should return domain info (UT-NPXEXEC-02)', () => {
    // Arrange
    const executor = new NpxExecutor(domainFixtures.core);

    // Act
    const domainInfo = executor.getDomainInfo();

    // Assert
    expect(domainInfo).toBe(domainFixtures.core);
  });

  test('execute should use execa to spawn NPX process correctly (UT-NPXEXEC-03)', async () => {
    // Arrange
    const executor = new NpxExecutor(domainFixtures.core);
    const args = ['validate', 'file.xml'];

    // Act
    await executor.execute(args);

    // Assert
    expect(execa).toHaveBeenCalledWith(
      'npx',
      [domainFixtures.core.packageName, ...args],
      expect.objectContaining({
        stdio: 'inherit',
        reject: false
      })
    );
  });

  test('execute should handle execa process exit with non-zero code (UT-NPXEXEC-NEG-01)', async () => {
    // Arrange
    const executor = new NpxExecutor(domainFixtures.core);

    // 模拟非零退出码，提供正确类型
    vi.mocked(execa).mockResolvedValueOnce({
      exitCode: 1,
      stdout: '',
      stderr: '',
      failed: true,
      killed: false,
      signal: undefined,
      command: '',
      escapedCommand: '',
      timedOut: false,
      isCanceled: false,
      all: undefined
    });

    // Act & Assert
    await expect(executor.execute(['validate'])).rejects.toThrow(DPMLError);

    // 重置mock，确保第二次调用同样抛出错误
    vi.mocked(execa).mockResolvedValueOnce({
      exitCode: 1,
      stdout: '',
      stderr: '',
      failed: true,
      killed: false,
      signal: undefined,
      command: '',
      escapedCommand: '',
      timedOut: false,
      isCanceled: false,
      all: undefined
    });
    await expect(executor.execute(['validate'])).rejects.toThrow('Command Execution Failed, Exit Code: 1');
  });

  test('execute should handle execa error events (UT-NPXEXEC-NEG-02)', async () => {
    // Arrange
    const executor = new NpxExecutor(domainFixtures.core);

    // 模拟execa抛出错误
    vi.mocked(execa).mockRejectedValueOnce(new Error('Process error'));

    // Act & Assert
    await expect(executor.execute(['validate'])).rejects.toThrow(DPMLError);

    // 重置mock，确保第二次调用同样抛出错误
    vi.mocked(execa).mockRejectedValueOnce(new Error('Process error'));
    await expect(executor.execute(['validate'])).rejects.toThrow('Command Execution Error: Process error');
  });
});
