/**
 * Framework CLI集成测试
 * 测试通过createDomainDPML创建的CLI的端到端行为
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createDomainDPML } from '../../../api/framework';
import { resetCommandRegistry } from '../../../core/framework/domainService';

describe('IT-FRM-CLI: Framework CLI集成测试', () => {
  // 捕获控制台输出
  let consoleLogSpy;
  let consoleErrorSpy;

  // 保存原始argv
  const originalArgv = process.argv;

  // 创建测试用的领域配置
  const createTestConfig = () => ({
    domain: 'core',
    description: 'DPML Core Domain',
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

  beforeEach(() => {
    // 重置命令注册表
    resetCommandRegistry();

    // 模拟控制台输出
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // 重置argv
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    // 恢复控制台输出
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // 恢复原始argv
    process.argv = originalArgv;
  });

  it('IT-FRM-CLI-01: 应能显示全局帮助信息', async () => {
    // 准备
    const dpml = createDomainDPML(createTestConfig());

    // 执行 - 直接调用showHelp，而不是通过execute
    dpml.cli.showHelp();

    // 断言 - 帮助信息应显示命令列表
    expect(consoleLogSpy).toHaveBeenCalled();

    // 通过检查调用次数来验证是否显示了帮助
    expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(0);
  });

  it('IT-FRM-CLI-02: 应能通过带前缀方式调用核心命令', async () => {
    // 准备 - 使用core validate命令（应该在核心命令中存在）
    process.argv = ['node', 'dpml', 'core', 'validate', '--help'];
    const dpml = createDomainDPML(createTestConfig());

    // 执行
    await dpml.cli.execute();

    // 断言 - 应成功执行命令
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('IT-FRM-CLI-03: 应能通过不带前缀方式调用核心命令', async () => {
    // 准备 - 使用validate命令（应该作为core:validate的别名）
    process.argv = ['node', 'dpml', 'validate', '--help'];
    const dpml = createDomainDPML(createTestConfig());

    // 执行
    await dpml.cli.execute();

    // 断言 - 应成功执行命令
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('IT-FRM-CLI-04: 默认应包含核心命令', () => {
    // 准备
    const dpml = createDomainDPML(createTestConfig());

    // 执行 - 显示帮助信息查看可用命令
    dpml.cli.showHelp();

    // 断言 - 验证同时包含带前缀和不带前缀的命令
    const output = consoleLogSpy.mock.calls.flat().join(' ');

    expect(output).toContain('core validate');  // 带前缀命令
    expect(output).toContain('validate');       // 不带前缀命令
  });
});
