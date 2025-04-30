/**
 * CLI闭包状态集成测试
 * 验证CLI模块的闭包状态管理功能
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createCLI } from '../../../api/cli';
import { CLIAdapter } from '../../../core/cli/CLIAdapter';
import {
  createCLIOptionsFixture,
  createCommandDefinitionsFixture,
  createExternalCommandsFixture
} from '../../fixtures/cli/cliFixtures';

// 模拟CLIAdapter以便跟踪调用
vi.mock('../../../core/cli/CLIAdapter', () => {
  return {
    CLIAdapter: vi.fn(() => ({
      setupCommand: vi.fn(),
      parse: vi.fn(),
      showHelp: vi.fn(),
      showVersion: vi.fn()
    }))
  };
});

describe('CLI闭包状态集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // IT-CLICLSR-01: CLI闭包应维护独立状态
  test('CLI闭包应维护独立状态', () => {
    // 准备
    const options1 = { ...createCLIOptionsFixture(), name: 'cli1' };
    const options2 = { ...createCLIOptionsFixture(), name: 'cli2' };
    const commands = createCommandDefinitionsFixture();

    // 创建两个CLI实例
    const cli1 = createCLI(options1, commands);
    const cli2 = createCLI(options2, commands);

    // 验证两个实例分别创建了自己的适配器
    expect(CLIAdapter).toHaveBeenCalledTimes(2);
    expect(CLIAdapter).toHaveBeenNthCalledWith(1, options1.name, options1.version, options1.description);
    expect(CLIAdapter).toHaveBeenNthCalledWith(2, options2.name, options2.version, options2.description);
  });

  // IT-CLICLSR-02: CLI闭包应防止外部直接修改状态
  test('CLI闭包应防止外部直接修改状态', () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();

    // 创建CLI实例
    const cli = createCLI(options, commands);

    // 验证闭包属性不可直接访问
    expect(cli).not.toHaveProperty('adapter');
    expect(cli).not.toHaveProperty('commands');
    expect(cli).not.toHaveProperty('options');

    // 只能访问定义的方法
    expect(cli).toHaveProperty('execute');
    expect(cli).toHaveProperty('showHelp');
    expect(cli).toHaveProperty('showVersion');
    expect(cli).toHaveProperty('registerCommands');
  });

  // IT-CLICLSR-03: CLI闭包方法应共享相同状态
  test('CLI闭包方法应共享相同状态', () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const externalCommands = createExternalCommandsFixture();

    // 创建CLI实例
    const cli = createCLI(options, commands);

    // 获取适配器实例引用
    const adapterInstance = (CLIAdapter as any).mock.results[0].value;

    // 调用各种方法
    cli.showHelp();
    cli.showVersion();
    cli.registerCommands(externalCommands);

    // 验证所有方法都在操作同一个适配器实例
    expect(adapterInstance.showHelp).toHaveBeenCalledTimes(1);
    expect(adapterInstance.showVersion).toHaveBeenCalledTimes(1);
    expect(adapterInstance.setupCommand).toHaveBeenCalledTimes(commands.length + externalCommands.length);

    // 验证执行方法使用同一实例
    const args = ['node', 'dpml', 'test'];

    cli.execute(args);
    expect(adapterInstance.parse).toHaveBeenCalledWith(args);
  });
});
