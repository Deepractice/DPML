/**
 * CLI使用端到端测试
 * 验证CLI模块的完整使用场景
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { createCLI } from '../../../api/cli';
import {
  createCLIOptionsFixture,
  createCommandDefinitionsFixture,
  createExternalCommandsFixture
} from '../../fixtures/cli/cliFixtures';

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试文件路径
const TEMP_DIR = path.join(__dirname, 'temp');
const TEST_FILE = path.join(TEMP_DIR, 'test.dpml');
const OUTPUT_FILE = path.join(TEMP_DIR, 'output.json');

// 模拟控制台输出/错误
let consoleLogSpy: any;
let consoleErrorSpy: any;
let processExitSpy: any;

describe('CLI使用端到端测试', () => {
  // 在每个测试前准备环境
  beforeEach(() => {
    // 创建临时目录和测试文件
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // 创建测试DPML文件
    fs.writeFileSync(TEST_FILE, `<user id="123" name="测试用户">
  <profile>用户配置文件</profile>
</user>`);

    // 监听控制台输出
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // 模拟process.exit，防止测试提前退出
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      return undefined as never;
    });
  });

  // 在每个测试后清理环境
  afterEach(() => {
    // 恢复所有模拟
    vi.restoreAllMocks();

    // 清理测试文件
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
    }

    if (fs.existsSync(OUTPUT_FILE)) {
      fs.unlinkSync(OUTPUT_FILE);
    }

    if (fs.existsSync(TEMP_DIR)) {
      fs.rmdirSync(TEMP_DIR);
    }
  });

  // E2E-CLI-01: 测试基本命令执行
  test('用户应能定义和执行基本命令', async () => {
    // 准备 - 创建带有测试命令的CLI
    const commands = [
      {
        name: 'greet',
        description: '问候命令',
        action: () => {
          console.log('你好，世界！');
        }
      }
    ];

    const cli = createCLI({
      name: 'test-cli',
      version: '1.0.0',
      description: '测试CLI'
    }, commands);

    // 执行 - 运行问候命令
    await cli.execute(['node', 'test-cli', 'greet']);

    // 验证 - 检查输出
    expect(consoleLogSpy).toHaveBeenCalledWith('你好，世界！');
  });

  // E2E-CLI-02: 测试带参数的命令
  test('用户应能定义和执行带参数的命令', async () => {
    // 准备 - 创建带有参数的命令
    const commands = [
      {
        name: 'greet',
        description: '问候特定用户',
        arguments: [
          {
            name: 'name',
            description: '用户名',
            required: true
          }
        ],
        action: (name) => {
          console.log(`你好，${name}！`);
        }
      }
    ];

    const cli = createCLI({
      name: 'test-cli',
      version: '1.0.0',
      description: '测试CLI'
    }, commands);

    // 执行 - 运行带参数的命令
    await cli.execute(['node', 'test-cli', 'greet', '张三']);

    // 验证 - 检查输出包含参数值
    expect(consoleLogSpy).toHaveBeenCalledWith('你好，张三！');
  });

  // E2E-CLI-03: 测试带选项的命令
  test('用户应能定义和执行带选项的命令', async () => {
    // 准备 - 创建带有选项的命令
    const commands = [
      {
        name: 'greet',
        description: '问候特定用户',
        arguments: [
          {
            name: 'name',
            description: '用户名',
            required: true
          }
        ],
        options: [
          {
            flags: '-f, --formal',
            description: '使用正式称呼'
          }
        ],
        action: (name, options) => {
          const prefix = options.formal ? '尊敬的' : '';

          console.log(`你好，${prefix}${name}！`);
        }
      }
    ];

    const cli = createCLI({
      name: 'test-cli',
      version: '1.0.0',
      description: '测试CLI'
    }, commands);

    // 执行 - 运行带选项的命令
    await cli.execute(['node', 'test-cli', 'greet', '张三', '--formal']);

    // 验证 - 检查输出反映了选项值
    expect(consoleLogSpy).toHaveBeenCalledWith('你好，尊敬的张三！');
  });

  // E2E-CLI-04: 测试嵌套子命令
  test('用户应能定义和执行嵌套子命令', async () => {
    // 准备 - 创建带有子命令的命令
    const commands = [
      {
        name: 'user',
        description: '用户管理',
        action: () => {
          console.log('用户管理主命令');
        },
        subcommands: [
          {
            name: 'create',
            description: '创建用户',
            arguments: [
              {
                name: 'username',
                description: '用户名',
                required: true
              }
            ],
            action: (username) => {
              console.log(`创建用户: ${username}`);
            }
          },
          {
            name: 'delete',
            description: '删除用户',
            arguments: [
              {
                name: 'username',
                description: '用户名',
                required: true
              }
            ],
            action: (username) => {
              console.log(`删除用户: ${username}`);
            }
          }
        ]
      }
    ];

    const cli = createCLI({
      name: 'test-cli',
      version: '1.0.0',
      description: '测试CLI'
    }, commands);

    // 执行 - 运行子命令
    await cli.execute(['node', 'test-cli', 'user', 'create', '张三']);

    // 验证 - 检查子命令输出
    expect(consoleLogSpy).toHaveBeenCalledWith('创建用户: 张三');
  });

  // E2E-CLI-05: 测试帮助信息
  test('用户应能获取帮助信息', async () => {
    // 准备 - 使用标准命令夹具
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const cli = createCLI(options, commands);

    // 执行 - 显示帮助信息
    cli.showHelp();

    // 验证 - 检查帮助输出内容
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('dpml'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('版本'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('可用命令'));
  });

  // E2E-CLI-06: 测试版本信息
  test('用户应能获取版本信息', async () => {
    // 准备 - 使用标准命令夹具
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const cli = createCLI(options, commands);

    // 执行 - 显示版本信息
    cli.showVersion();

    // 验证 - 检查版本输出内容
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('dpml 版本: 1.0.0'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Node.js 版本'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('平台'));
  });

  // E2E-CLI-07: 测试无效命令处理
  test('CLI应正确处理无效命令', async () => {
    // 准备 - 使用标准命令夹具
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const cli = createCLI(options, commands);

    // 模拟process.exit，防止测试中断
    const processExitSpy = vi.spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    // 执行 - 运行不存在的命令
    await cli.execute(['node', 'dpml', 'nonexistent-command']);

    // 验证 - Commander在某些版本会调用process.exit
    // 注意：此处的验证根据不同环境可能有所不同
    try {
      // 尝试验证方式1：console.error被调用
      expect(consoleErrorSpy).toHaveBeenCalled();
    } catch (error) {
      // 尝试验证方式2：process.exit被调用
      expect(processExitSpy).toHaveBeenCalled();
    }
  });

  // E2E-CLI-08: 测试动态注册命令
  test('CLI应支持动态注册命令', async () => {
    // 准备 - 创建基本CLI和外部命令
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const externalCommands = createExternalCommandsFixture();

    const cli = createCLI(options, commands);

    // 执行 - 动态注册外部命令
    cli.registerCommands(externalCommands);

    // 执行外部命令
    await cli.execute(['node', 'dpml', 'external', 'test-file.txt']);

    // 验证 - 检查外部命令成功执行
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('处理外部命令'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test-file.txt'));
  });
});
