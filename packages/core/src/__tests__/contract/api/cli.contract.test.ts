/**
 * CLI API契约测试
 * 验证CLI API的稳定性
 */

import { describe, test, expect } from 'vitest';

import { createCLI } from '../../../api/cli';
import type { CLI, CLIOptions, CommandDefinition } from '../../../types/cli';

describe('CLI API契约测试', () => {
  // CT-API-CLI-01: createCLI API应维持类型签名
  test('createCLI API应维持类型签名', () => {
    // 验证函数存在
    expect(typeof createCLI).toBe('function');

    // 查看函数签名 (运行时检查能力有限，更多是为了文档)
    const functionStr = createCLI.toString();

    // 应该包含两个参数：options和commands
    expect(functionStr).toContain('options');
    expect(functionStr).toContain('commands');
  });

  // CT-API-CLI-02: createCLI API应返回符合CLI接口的对象
  test('createCLI API应返回符合CLI接口的对象', () => {
    // 准备 - 创建测试输入
    const options: CLIOptions = {
      name: 'test-cli',
      version: '1.0.0',
      description: '测试CLI'
    };

    const commands: CommandDefinition[] = [
      {
        name: 'test',
        description: '测试命令',
        action: () => {}
      }
    ];

    // 执行
    const cli = createCLI(options, commands);

    // 断言 - 验证返回符合CLI接口
    expect(cli).toHaveProperty('execute');
    expect(cli).toHaveProperty('showHelp');
    expect(cli).toHaveProperty('showVersion');

    // 验证方法类型
    expect(cli.execute).toBeTypeOf('function');
    expect(cli.showHelp).toBeTypeOf('function');
    expect(cli.showVersion).toBeTypeOf('function');

    // 验证execute返回Promise
    const result = cli.execute();

    expect(result).toBeInstanceOf(Promise);
  });

  // CT-API-CLI-03: createCLI API应支持类型安全的命令定义
  test('createCLI API应支持类型安全的命令定义', () => {
    // 准备 - 创建有效的命令定义
    const options: CLIOptions = {
      name: 'test-cli',
      version: '1.0.0',
      description: '测试CLI'
    };

    // 带嵌套子命令的复杂命令定义
    const commands: CommandDefinition[] = [
      {
        name: 'parent',
        description: '父命令',
        action: () => {},
        subcommands: [
          {
            name: 'child',
            description: '子命令',
            arguments: [
              {
                name: 'arg1',
                description: '参数1',
                required: true
              }
            ],
            options: [
              {
                flags: '-o, --option <value>',
                description: '选项1',
                defaultValue: 'default'
              }
            ],
            action: () => {}
          }
        ]
      }
    ];

    // 执行 - 创建CLI，验证类型系统接受复杂命令定义
    const cli: CLI = createCLI(options, commands);

    // 断言 - CLI实例具有正确的接口
    expect(cli).toHaveProperty('execute');
    expect(cli).toHaveProperty('showHelp');
    expect(cli).toHaveProperty('showVersion');
  });
});
