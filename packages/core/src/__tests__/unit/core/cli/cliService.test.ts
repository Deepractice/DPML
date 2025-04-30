import { expect, describe, it, vi, beforeEach } from 'vitest';

import { CLIAdapter } from '../../../../core/cli/CLIAdapter';
import { createCLI, registerExternalCommands } from '../../../../core/cli/cliService';
import { mergeDefaultOptions, validateCommands } from '../../../../core/cli/commandUtils';
import type { CLIOptions, CommandDefinition } from '../../../../types/CLI';

// 模拟依赖
vi.mock('../../../../core/cli/CLIAdapter');
vi.mock('../../../../core/cli/commandUtils', () => ({
  mergeDefaultOptions: vi.fn().mockImplementation(options => ({
    defaultDomain: 'core',
    ...options
  })),
  validateCommands: vi.fn(),
  getCommandPath: vi.fn().mockImplementation(command => command.name)
}));

describe('CLITypes Service', () => {
  let mockAdapter: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // 重置CLIAdapter模拟
    mockAdapter = {
      setupCommand: vi.fn(),
      parse: vi.fn().mockResolvedValue(undefined),
      showHelp: vi.fn(),
      showVersion: vi.fn()
    };

    (CLIAdapter as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockAdapter);
  });

  // UT-CLISVC-01: 测试CLI初始化
  describe('createCLI', () => {
    it('应正确初始化CLI', () => {
      // 准备测试数据
      const options: CLIOptions = {
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      };

      const commands: CommandDefinition[] = [
        {
          name: 'test',
          description: 'Test Command',
          action: vi.fn()
        }
      ];

      // 执行测试
      const cli = createCLI(options, commands);

      // 验证结果
      expect(CLIAdapter).toHaveBeenCalledWith(
        options.name,
        options.version,
        options.description
      );
      expect(mergeDefaultOptions).toHaveBeenCalledWith(options);
      expect(validateCommands).toHaveBeenCalledWith(commands);
      expect(cli).toHaveProperty('execute');
      expect(cli).toHaveProperty('showHelp');
      expect(cli).toHaveProperty('showVersion');
      expect(cli).toHaveProperty('registerCommands');
    });

    // UT-CLISVC-02: 测试默认选项
    it('应设置默认选项', () => {
      // 准备测试数据
      const options: CLIOptions = {
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      };

      // 执行测试
      createCLI(options, []);

      // 验证结果：应使用mergeDefaultOptions合并选项
      expect(mergeDefaultOptions).toHaveBeenCalledWith(options);
    });

    // UT-CLISVC-03: 测试全局选项设置
    it('应设置全局选项', () => {
      // 准备测试数据
      const options: CLIOptions = {
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      };

      // 模拟console.log
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // 执行测试
      createCLI(options, []);

      // 验证结果：应记录初始化信息
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('CLI初始化'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('默认领域'));

      // 恢复模拟
      consoleLogSpy.mockRestore();
    });

    // UT-CLISVC-04: 测试命令注册
    it('应遍历注册用户命令', () => {
      // 准备测试数据
      const commands: CommandDefinition[] = [
        {
          name: 'cmd1',
          description: 'Command 1',
          action: vi.fn()
        },
        {
          name: 'cmd2',
          description: 'Command 2',
          action: vi.fn()
        }
      ];

      // 执行测试
      createCLI({
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      }, commands);

      // 验证结果：应为每个命令调用setupCommand
      expect(mockAdapter.setupCommand).toHaveBeenCalledTimes(2);
      expect(mockAdapter.setupCommand).toHaveBeenCalledWith(commands[0]);
      expect(mockAdapter.setupCommand).toHaveBeenCalledWith(commands[1]);
    });

    // UT-CLISVC-05: 测试注册外部命令
    it('应正确注册外部命令', () => {
      // 准备测试数据
      const options: CLIOptions = {
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      };

      const initialCommands: CommandDefinition[] = [
        {
          name: 'initial',
          description: 'Initial Command',
          action: vi.fn()
        }
      ];

      const externalCommands: CommandDefinition[] = [
        {
          name: 'external',
          description: 'External Command',
          action: vi.fn()
        }
      ];

      // 执行测试 - 创建CLI并注册外部命令
      const cli = createCLI(options, initialCommands);

      // 重置模拟计数以便验证额外的命令
      mockAdapter.setupCommand.mockClear();

      cli.registerCommands(externalCommands);

      // 验证结果：应验证并注册外部命令
      expect(validateCommands).toHaveBeenCalledWith(externalCommands);
      expect(mockAdapter.setupCommand).toHaveBeenCalledTimes(1);
      expect(mockAdapter.setupCommand).toHaveBeenCalledWith(externalCommands[0]);
    });

    // UT-CLISVC-06: 测试接口方法调用
    it('应将接口方法正确委托给适配器', async () => {
      // 准备测试数据
      const cli = createCLI({
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      }, []);

      const testArgs = ['node', 'script.js', 'command'];

      // 执行测试
      await cli.execute(testArgs);
      cli.showHelp();
      cli.showVersion();

      // 验证结果：应委托给适配器方法
      expect(mockAdapter.parse).toHaveBeenCalledWith(testArgs);
      expect(mockAdapter.showHelp).toHaveBeenCalled();
      expect(mockAdapter.showVersion).toHaveBeenCalled();
    });
  });

  // 测试registerExternalCommands函数
  describe('registerExternalCommands', () => {
    it('应遍历注册外部命令', () => {
      // 准备测试数据
      const commands: CommandDefinition[] = [
        {
          name: 'external1',
          description: 'External Command 1',
          action: vi.fn()
        },
        {
          name: 'external2',
          description: 'External Command 2',
          action: vi.fn()
        }
      ];

      // 执行测试
      registerExternalCommands(mockAdapter, commands);

      // 验证结果：应为每个命令调用setupCommand
      expect(mockAdapter.setupCommand).toHaveBeenCalledTimes(2);
      expect(mockAdapter.setupCommand).toHaveBeenCalledWith(commands[0]);
      expect(mockAdapter.setupCommand).toHaveBeenCalledWith(commands[1]);
    });

    it('应处理空命令数组', () => {
      // 执行测试
      registerExternalCommands(mockAdapter, []);

      // 验证结果：不应调用setupCommand
      expect(mockAdapter.setupCommand).not.toHaveBeenCalled();
    });
  });

  // UT-CLISVC-NEG-01: 测试命令重复检测
  describe('命令验证', () => {
    it('应验证命令无重复', () => {
      // 准备测试数据
      const options: CLIOptions = {
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      };

      const commands: CommandDefinition[] = [
        {
          name: 'command',
          description: 'Test Command',
          action: vi.fn()
        }
      ];

      // 模拟validateCommands抛出错误
      vi.mocked(validateCommands).mockImplementationOnce(() => {
        throw new Error('重复的命令定义: command');
      });

      // 执行测试：应抛出错误
      expect(() => createCLI(options, commands)).toThrow(/重复的命令定义/);
    });
  });

  // UT-CLISVC-NEG-02: 测试无命令处理
  describe('无命令处理', () => {
    it('应处理空命令数组', () => {
      // 准备测试数据
      const options: CLIOptions = {
        name: 'test-cli',
        version: '1.0.0',
        description: 'Test CLITypes'
      };

      // 执行测试：不应抛出错误
      expect(() => createCLI(options, [])).not.toThrow();

      // 验证结果：没有命令时不应调用setupCommand
      expect(mockAdapter.setupCommand).not.toHaveBeenCalled();
    });
  });
});
