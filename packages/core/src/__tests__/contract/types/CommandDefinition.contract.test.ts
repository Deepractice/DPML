/**
 * CommandDefinition接口契约测试
 * 验证CommandDefinition接口的结构稳定性和递归能力
 */

import { describe, test, expect } from 'vitest';

import type { CommandDefinition } from '../../../types/CLI';

describe('CommandDefinition接口契约测试', () => {
  // CT-TYPE-CMDF-01: CommandDefinition接口应维持结构稳定性
  test('CommandDefinition接口应维持结构稳定性', () => {
    // 准备 - 创建符合接口定义的对象
    const commandDef: CommandDefinition = {
      name: 'test',
      description: '测试命令',
      arguments: [
        {
          name: 'arg1',
          description: '参数1',
          required: true
        }
      ],
      options: [
        {
          flags: '-o, --option',
          description: '选项1',
          defaultValue: 'default'
        }
      ],
      action: () => console.log('测试'),
      subcommands: [],
      category: 'test'
    };

    // 断言 - 验证接口定义包含所有规定属性
    expect(commandDef).toHaveProperty('name');
    expect(commandDef).toHaveProperty('description');
    expect(commandDef).toHaveProperty('arguments');
    expect(commandDef).toHaveProperty('options');
    expect(commandDef).toHaveProperty('action');
    expect(commandDef).toHaveProperty('subcommands');
    expect(commandDef).toHaveProperty('category');

    // 验证属性类型
    expect(commandDef.name).toBeTypeOf('string');
    expect(commandDef.description).toBeTypeOf('string');
    expect(Array.isArray(commandDef.arguments)).toBe(true);
    expect(Array.isArray(commandDef.options)).toBe(true);
    expect(commandDef.action).toBeTypeOf('function');
    expect(Array.isArray(commandDef.subcommands)).toBe(true);
    expect(commandDef.category).toBeTypeOf('string');
  });

  // CT-TYPE-CMDF-02: CommandDefinition.subcommands应支持递归结构
  test('CommandDefinition.subcommands应支持递归结构', () => {
    // 准备 - 创建嵌套命令结构
    const subSubCommand: CommandDefinition = {
      name: 'subsub',
      description: '子子命令',
      action: () => console.log('子子命令')
    };

    const subCommand: CommandDefinition = {
      name: 'sub',
      description: '子命令',
      action: () => console.log('子命令'),
      subcommands: [subSubCommand]
    };

    const rootCommand: CommandDefinition = {
      name: 'root',
      description: '根命令',
      action: () => console.log('根命令'),
      subcommands: [subCommand]
    };

    // 断言 - 验证嵌套结构
    expect(rootCommand.subcommands?.length).toBe(1);
    expect(rootCommand.subcommands?.[0].name).toBe('sub');
    expect(rootCommand.subcommands?.[0].subcommands?.length).toBe(1);
    expect(rootCommand.subcommands?.[0].subcommands?.[0].name).toBe('subsub');

    // 验证每层都符合CommandDefinition接口
    const validateCommand = (cmd: CommandDefinition): void => {
      expect(cmd).toHaveProperty('name');
      expect(cmd).toHaveProperty('description');
      expect(cmd).toHaveProperty('action');
    };

    validateCommand(rootCommand);
    validateCommand(rootCommand.subcommands![0]);
    validateCommand(rootCommand.subcommands![0].subcommands![0]);
  });
});
