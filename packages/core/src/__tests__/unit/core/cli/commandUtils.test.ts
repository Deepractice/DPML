import { expect, describe, it, vi, beforeEach } from 'vitest';

import { mergeDefaultOptions, validateCommands, getCommandPath } from '../../../../core/cli/commandUtils';
import type { CLIOptions, CommandDefinition } from '../../../../types/CLI';
import { createCrossDomainDuplicateCommandsFixture } from '../../../fixtures/cli/cliFixtures';

// 模拟控制台输出，避免测试输出过多
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('Command Utils', () => {
  // UT-CLIUTL-01: 测试合并默认选项
  describe('mergeDefaultOptions', () => {
    it('应该合并默认选项', () => {
      // 准备测试数据
      const options: CLIOptions = {
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      };

      // 执行测试
      const result = mergeDefaultOptions(options);

      // 验证结果
      expect(result).toEqual({
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes',
        defaultDomain: 'core'
      });
    });

    it('不应覆盖用户提供的默认领域', () => {
      // 准备测试数据
      const options: CLIOptions = {
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes',
        defaultDomain: 'custom'
      };

      // 执行测试
      const result = mergeDefaultOptions(options);

      // 验证结果
      expect(result.defaultDomain).toBe('custom');
    });
  });

  // UT-CLIUTL-02: 测试命令验证功能
  describe('validateCommands', () => {
    it('应成功验证无重复的命令', () => {
      // 准备测试数据
      const commands: CommandDefinition[] = [
        {
          name: 'command1',
          description: 'Command 1',
          action: () => {}
        },
        {
          name: 'command2',
          description: 'Command 2',
          action: () => {}
        }
      ];

      // 执行测试：不应抛出异常
      expect(() => validateCommands(commands)).not.toThrow();
    });

    it('应检测到重复的命令', () => {
      // 准备测试数据
      const commands: CommandDefinition[] = [
        {
          name: 'command',
          description: 'Command 1',
          action: () => {}
        },
        {
          name: 'command', // 重复的命令名
          description: 'Command 2',
          action: () => {}
        }
      ];

      // 执行测试：应抛出异常
      expect(() => validateCommands(commands)).toThrow(/重复的命令定义/);
    });

    it('应检测到子命令重复', () => {
      // 准备测试数据
      const commands: CommandDefinition[] = [
        {
          name: 'parent',
          description: 'Parent Command',
          action: () => {},
          subcommands: [
            {
              name: 'child',
              description: 'Child Command 1',
              action: () => {}
            },
            {
              name: 'child', // 重复的子命令
              description: 'Child Command 2',
              action: () => {}
            }
          ]
        }
      ];

      // 执行测试：应抛出异常
      expect(() => validateCommands(commands)).toThrow(/重复的命令定义/);
    });

    // UT-CLISVC-NEG-03: 验证跨领域命令重复检测
    it('应识别和警告跨领域重复命令', () => {
      // 准备
      const commands = createCrossDomainDuplicateCommandsFixture();
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      // 执行
      validateCommands(commands);

      // 验证 - 应发出警告但不抛出异常
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('警告: 命令 "export" 在多个领域中定义')
      );
    });

    // 验证完整领域命令路径不冲突的情况
    it('应不会混淆不同领域的同名命令', () => {
      // 准备 - 不同领域的同名命令
      const commands = createCrossDomainDuplicateCommandsFixture();

      // 执行与验证 - 不应抛出异常
      expect(() => validateCommands(commands)).not.toThrow();
    });
  });

  // UT-CLIUTL-03: 测试路径构建功能
  describe('getCommandPath', () => {
    it('应返回基本命令路径', () => {
      // 准备测试数据
      const command: CommandDefinition = {
        name: 'test',
        description: 'Test Command',
        action: () => {}
      };

      // 执行测试
      const path = getCommandPath(command);

      // 验证结果
      expect(path).toBe('test');
    });

    it('应处理父命令路径', () => {
      // 准备测试数据
      const command: CommandDefinition = {
        name: 'child',
        description: 'Child Command',
        action: () => {}
      };

      // 执行测试
      const path = getCommandPath(command, 'parent');

      // 验证结果
      expect(path).toBe('parent child');
    });

    // UT-CLIUTL-04: 测试领域前缀处理
    it('应处理领域前缀', () => {
      // 准备测试数据
      const command: CommandDefinition = {
        name: 'test',
        description: 'Test Command',
        category: 'custom',
        action: () => {}
      };

      // 执行测试
      const path = getCommandPath(command);

      // 验证结果
      expect(path).toBe('custom test');
    });

    it('不应为子命令添加领域前缀', () => {
      // 准备测试数据
      const command: CommandDefinition = {
        name: 'child',
        description: 'Child Command',
        category: 'custom',
        action: () => {}
      };

      // 执行测试：有父路径时不应添加领域前缀
      const path = getCommandPath(command, 'parent');

      // 验证结果
      expect(path).toBe('parent child');
      expect(path).not.toContain('custom');
    });
  });
});
