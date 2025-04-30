/**
 * CLI命令执行集成测试
 * 验证CLI模块的命令执行流程
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createCLI } from '../../../api/cli';
import {
  createCLIOptionsFixture,
  createCommandDefinitionsFixture,
  createExternalCommandsFixture,
  createCommandLineArgsFixture
} from '../../fixtures/cli/cliFixtures';

// 统一模拟console.log，防止测试输出过多
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('CLI命令执行集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // IT-CLIEXC-01: CLI应处理基本命令执行
  test('CLI应处理基本命令执行', async () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const cmdArgs = createCommandLineArgsFixture('parse test.dpml');

    // 获取模拟action
    const parseAction = commands[0].action;

    // 创建CLI
    const cli = createCLI(options, commands);

    // 执行
    await cli.execute(cmdArgs);

    // 断言 - 只验证action被调用
    expect(parseAction).toHaveBeenCalled();
    // 验证第一个参数是文件名
    expect((parseAction as any).mock.calls[0][0]).toBe('test.dpml');
  });

  // IT-CLIEXC-02: CLI应处理带参数的命令
  test('CLI应处理带参数的命令', async () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const cmdArgs = createCommandLineArgsFixture('parse input.dpml');

    // 获取模拟action
    const parseAction = commands[0].action;

    // 创建CLI
    const cli = createCLI(options, commands);

    // 执行
    await cli.execute(cmdArgs);

    // 断言 - 只验证action被调用
    expect(parseAction).toHaveBeenCalled();
    // 验证第一个参数是文件名
    expect((parseAction as any).mock.calls[0][0]).toBe('input.dpml');
  });

  // IT-CLIEXC-03: CLI应处理带选项的命令
  test('CLI应处理带选项的命令', async () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const cmdArgs = createCommandLineArgsFixture('parse test.dpml --format xml --output result.xml');

    // 获取模拟action
    const parseAction = commands[0].action;

    // 创建CLI
    const cli = createCLI(options, commands);

    // 执行
    await cli.execute(cmdArgs);

    // 断言 - 只验证action被调用
    expect(parseAction).toHaveBeenCalled();

    // 验证第一个参数是文件名
    expect((parseAction as any).mock.calls[0][0]).toBe('test.dpml');

    // 验证选项在第二个参数中
    const optionsArg = (parseAction as any).mock.calls[0][1];

    expect(optionsArg.format).toBe('xml');
    expect(optionsArg.output).toBe('result.xml');
  });

  // IT-CLIEXC-04: CLI应处理嵌套子命令
  test('CLI应处理嵌套子命令', async () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const cmdArgs = createCommandLineArgsFixture('convert to-json test.dpml');

    // 获取模拟action - 子命令
    const convertAction = commands[2].subcommands?.[0].action;

    // 确保convertAction存在
    expect(convertAction).toBeDefined();
    if (!convertAction) return;

    // 创建CLI
    const cli = createCLI(options, commands);

    // 执行
    await cli.execute(cmdArgs);

    // 断言 - 只验证action被调用
    expect(convertAction).toHaveBeenCalled();
    // 验证第一个参数是文件名
    expect((convertAction as any).mock.calls[0][0]).toBe('test.dpml');
  });

  // IT-CLIEXC-05: CLI应处理外部注册的命令
  test('CLI应处理外部注册的命令', async () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const externalCommands = createExternalCommandsFixture();
    const cmdArgs = createCommandLineArgsFixture('external test-input.txt');

    // 获取模拟action
    const externalAction = externalCommands[0].action;

    // 创建CLI并注册外部命令
    const cli = createCLI(options, commands);

    cli.registerCommands(externalCommands);

    // 执行
    await cli.execute(cmdArgs);

    // 断言 - 只验证action被调用
    expect(externalAction).toHaveBeenCalled();
    // 验证第一个参数是文件名
    expect((externalAction as any).mock.calls[0][0]).toBe('test-input.txt');
  });
});
