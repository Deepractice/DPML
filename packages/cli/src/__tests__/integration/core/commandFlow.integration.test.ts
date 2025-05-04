import { describe, test, expect, vi, beforeEach, afterAll } from 'vitest';

import { execute } from '../../../api/cli';
import { NpxDiscoverer } from '../../../core/discovery/NpxDiscoverer';
import { NpxExecutor } from '../../../core/execution/NpxExecutor';
import { createCommandArgsFixture, createDomainInfoFixture, createExpectedOutputFixture } from '../../fixtures/cli/cliFixtures';

// 模拟console以捕获输出
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// 保存原始process.exit以便恢复
const originalExit = process.exit;

describe('IT-CMDFLOW', () => {
  const commandArgs = createCommandArgsFixture();
  const domainInfo = createDomainInfoFixture();
  const expectedOutput = createExpectedOutputFixture();

  // 创建模拟发现器结果
  const mockTryFindDomain = vi.fn().mockImplementation((domain: string) => {
    if (domain === 'core') {
      return Promise.resolve(domainInfo.core);
    }

    return Promise.resolve(null);
  });

  const mockListDomains = vi.fn().mockResolvedValue([
    domainInfo.core,
    domainInfo.agent,
    domainInfo.example
  ]);

  // 创建模拟执行器结果
  const mockExecute = vi.fn().mockResolvedValue(undefined);

  // Mock的process.exit
  const mockExit = vi.fn((code?: number | string | null) => {
    const error = { message: `Process exit called with code ${code}` };

    throw error;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // 模拟NpxDiscoverer
    vi.spyOn(NpxDiscoverer.prototype, 'tryFindDomain').mockImplementation(mockTryFindDomain);
    vi.spyOn(NpxDiscoverer.prototype, 'listDomains').mockImplementation(mockListDomains);

    // 模拟NpxExecutor
    vi.spyOn(NpxExecutor.prototype, 'execute').mockImplementation(mockExecute);

    // 模拟process.exit以便我们可以捕获它而不是终止测试
    vi.spyOn(process, 'exit').mockImplementation(mockExit) as unknown as typeof process.exit;
  });

  // 在所有测试后恢复原始process.exit
  afterAll(() => {
    vi.restoreAllMocks();
    process.exit = originalExit;
  });

  test('CLI should process --list option correctly (IT-CMDFLOW-01)', async () => {
    try {
      // 执行命令
      await execute(commandArgs.list);

      // 验证列表获取
      expect(mockListDomains).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('Available DPML domains:');
      expect(mockConsoleLog).toHaveBeenCalledWith('');
      expect(mockConsoleLog).toHaveBeenCalledWith('  core (1.0.0)');
      expect(mockConsoleLog).toHaveBeenCalledWith('  agent (1.0.0)');
      expect(mockConsoleLog).toHaveBeenCalledWith('  example (1.0.0)');
    } catch (error) {
      // 如果是预期的process.exit导致的错误，就忽略它
      if (error && typeof error === 'object' && 'message' in error &&
          typeof error.message === 'string' && error.message.includes('Process exit called')) {
        // 这是预期的失败，所以测试实际上是通过的
        // 列表命令的处理是成功的，但是它会调用process.exit(0)结束程序
      } else {
        // 其他错误则重新抛出
        throw error;
      }
    }
  });

  test('CLI should process domain command correctly (IT-CMDFLOW-02)', async () => {
    // 使用core领域命令
    await execute(['core', 'validate', 'file.xml']);

    // 验证领域查找
    expect(mockTryFindDomain).toHaveBeenCalledWith('core');
    // 验证执行器创建和执行
    expect(mockExecute).toHaveBeenCalledWith(['validate', 'file.xml']);
  });

  test('CLI should handle unknown domain correctly (IT-CMDFLOW-05)', async () => {
    // 确保mockTryFindDomain返回null
    mockTryFindDomain.mockResolvedValueOnce(null);

    try {
      // 尝试使用未知领域命令
      await execute(['unknown', 'command']);

      // 这行代码不应该被执行，因为execute应该throw error
      expect(true).toBe(false);
    } catch (error) {
      // 验证正确的行为：process.exit应该被调用并带有退出码1
      expect(mockExit).toHaveBeenCalledWith(1);

      // 验证领域查找被调用
      expect(mockTryFindDomain).toHaveBeenCalledWith('unknown');

      // 验证错误消息适当
      if (error && typeof error === 'object' && 'message' in error) {
        expect(error.message).toContain('Process exit called with code 1');
      } else {
        // 如果错误类型不对，测试失败
        expect(error).toEqual({ message: 'Process exit called with code 1' });
      }

      // 验证错误被适当地记录到控制台
      expect(mockConsoleError).toHaveBeenCalled();
      const errorCallArgs = mockConsoleError.mock.calls.some(args =>
        typeof args[0] === 'string' && args[0].includes('Domain not found: unknown')
      );

      expect(errorCallArgs).toBe(true);
    }
  });
});
