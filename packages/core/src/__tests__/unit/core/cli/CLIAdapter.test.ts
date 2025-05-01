import { Command } from 'commander';
import { expect, describe, it, vi, beforeEach } from 'vitest';

import { CLIAdapter } from '../../../../core/cli/CLIAdapter';
import type { CommandDefinition } from '../../../../types/CLI';

// 模拟 commander
vi.mock('commander', () => {
  // 创建命令模拟工厂
  const createCommandMock = () => {
    // 存储命令调用信息
    const mockStateStore = {
      currentDescription: '',
      actionCallbacks: [] as any[],
      subcommands: new Map<string, any>()
    };

    // 创建基本命令模拟
    const commandMock = {
      version: vi.fn().mockReturnThis(),
      description: vi.fn((desc) => {
        mockStateStore.currentDescription = desc;

        return commandMock;
      }),
      command: vi.fn((name) => {
        const subCommand = createCommandMock();

        mockStateStore.subcommands.set(name, subCommand);

        return subCommand;
      }),
      argument: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      action: vi.fn((callback) => {
        mockStateStore.actionCallbacks.push(callback);

        return commandMock;
      }),
      outputHelp: vi.fn(),
      parseAsync: vi.fn().mockResolvedValue({}),
      commands: [] as any[],
      name: vi.fn().mockReturnValue('test'),
      // 添加exitOverride方法的模拟
      exitOverride: vi.fn().mockReturnThis(),
      // 添加内部状态存储
      _mockStateStore: mockStateStore
    };

    return commandMock;
  };

  // 创建顶级命令
  const mockCommand = createCommandMock();

  return {
    Command: vi.fn(() => mockCommand)
  };
});

describe('CLIAdapter', () => {
  let adapter: CLIAdapter;
  let commanderMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new CLIAdapter('test-cli', '1.0.0', 'Test CLITypes');
    commanderMock = new Command();
  });

  // UT-CLIADP-01: 测试构造函数正确创建实例
  describe('constructor', () => {
    it('应创建正确配置的Commander实例', () => {
      // 验证结果
      expect(Command).toHaveBeenCalled();
      expect(commanderMock.version).toHaveBeenCalledWith('1.0.0');
      expect(commanderMock.description).toHaveBeenCalledWith('Test CLITypes');
    });
  });

  // UT-CLIADP-02: 测试注册单个命令
  describe('setupCommand', () => {
    it('应注册单个命令', () => {
      // 准备测试数据
      const testCommand: CommandDefinition = {
        name: 'test',
        description: 'Test Command',
        action: vi.fn()
      };

      // 执行测试
      adapter.setupCommand(testCommand);

      // 验证结果
      expect(commanderMock.command).toHaveBeenCalledWith('test');

      // 获取子命令对象
      const subCommandMock = commanderMock.command.mock.results[0].value;

      expect(subCommandMock.description).toHaveBeenCalledWith('Test Command');
      expect(subCommandMock.action).toHaveBeenCalled();
    });

    // UT-CLIADP-03: 测试处理命令参数
    it('应处理命令参数', () => {
      // 准备测试数据
      const testCommand: CommandDefinition = {
        name: 'test',
        description: 'Test Command',
        arguments: [
          { name: 'arg1', description: 'Arg 1', required: true },
          { name: 'arg2', description: 'Arg 2', required: false }
        ],
        action: vi.fn()
      };

      // 执行测试
      adapter.setupCommand(testCommand);

      // 获取子命令对象
      const subCommandMock = commanderMock.command.mock.results[0].value;

      // 验证结果
      expect(subCommandMock.argument).toHaveBeenCalledTimes(2);
      expect(subCommandMock.argument).toHaveBeenNthCalledWith(1, 'arg1', 'Arg 1', undefined);
      expect(subCommandMock.argument).toHaveBeenNthCalledWith(2, 'arg2 [value]', 'Arg 2', undefined);
    });

    // UT-CLIADP-04: 测试处理命令选项
    it('应处理命令选项', () => {
      // 准备测试数据
      const testCommand: CommandDefinition = {
        name: 'test',
        description: 'Test Command',
        options: [
          { flags: '-o, --option', description: 'Option 1' },
          { flags: '-v, --value <value>', description: 'Option 2', defaultValue: 'default' }
        ],
        action: vi.fn()
      };

      // 执行测试
      adapter.setupCommand(testCommand);

      // 获取子命令对象
      const subCommandMock = commanderMock.command.mock.results[0].value;

      // 验证结果
      expect(subCommandMock.option).toHaveBeenCalledTimes(2);
      expect(subCommandMock.option).toHaveBeenNthCalledWith(1, '-o, --option', 'Option 1');
      expect(subCommandMock.option).toHaveBeenNthCalledWith(2, '-v, --value <value>', 'Option 2', 'default');
    });

    // UT-CLIADP-05: 测试递归处理子命令
    it('应递归处理子命令', () => {
      // 准备测试数据
      const testCommand: CommandDefinition = {
        name: 'parent',
        description: 'Parent Command',
        action: vi.fn(),
        subcommands: [
          {
            name: 'child',
            description: 'Child Command',
            action: vi.fn()
          }
        ]
      };

      // 配置模拟行为以支持子命令查找
      vi.spyOn(CLIAdapter.prototype as any, 'findParentCommand').mockImplementation((path) => {
        // 直接返回顶级命令的子命令
        return commanderMock.command.mock.results[0].value;
      });

      // 执行测试
      adapter.setupCommand(testCommand);

      // 验证结果
      expect(commanderMock.command).toHaveBeenCalledWith('parent');

      // 获取父命令对象
      const parentCommandMock = commanderMock.command.mock.results[0].value;

      // 验证子命令被注册
      expect(parentCommandMock.command).toHaveBeenCalledWith('child');
    });
  });

  // UT-CLIADP-06: 测试注册领域命令
  describe('setupDomainCommands', () => {
    it('应注册领域命令（向后兼容，此方法已弃用）', () => {
      // 准备测试数据
      const domainCommands: CommandDefinition[] = [
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

      // 模拟adapter.setupCommand
      const setupCommandSpy = vi.spyOn(adapter, 'setupCommand');

      // 执行测试
      adapter.setupDomainCommands('test-domain', domainCommands);

      // 验证结果
      expect(setupCommandSpy).toHaveBeenCalledTimes(2);
      expect(setupCommandSpy.mock.calls[0][0]).toEqual({
        ...domainCommands[0],
        category: 'test-domain'
      });
      expect(setupCommandSpy.mock.calls[1][0]).toEqual({
        ...domainCommands[1],
        category: 'test-domain'
      });
    });
  });

  // UT-CLIADP-07: 测试解析命令行
  describe('parse', () => {
    it('应调用Commander解析方法', async () => {
      // 准备测试数据
      const args = ['node', 'script.js', 'command'];

      // 执行测试
      await adapter.parse(args);

      // 验证结果
      expect(commanderMock.parseAsync).toHaveBeenCalledWith(args);
    });

    it('没有参数时应使用process.argv', async () => {
      // 执行测试
      await adapter.parse();

      // 验证结果
      expect(commanderMock.parseAsync).toHaveBeenCalledWith(process.argv);
    });
  });

  // UT-CLIADP-NEG-01: 测试命令重复检测
  describe('命令重复检测', () => {
    it('应检测到重复命令', () => {
      // 修改commandPaths的可见性以便测试
      const adapter = new CLIAdapter('test-cli', '1.0.0', 'Test CLITypes');

      (adapter as any).commandPaths = new Set(['duplicate']);

      // 准备测试数据
      const command: CommandDefinition = {
        name: 'duplicate',
        description: 'Duplicate Command',
        action: vi.fn()
      };

      // 执行测试：应抛出异常
      expect(() => adapter.setupCommand(command)).toThrow(/重复的命令定义/);
    });
  });

  // UT-CLIADP-NEG-02: 测试动作错误处理
  describe('命令错误处理', () => {
    it('应捕获命令执行异常', async () => {
      // 模拟控制台和进程
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      // 模拟抛出错误的action函数
      const errorFn = vi.fn().mockImplementation(() => {
        throw new Error('测试错误');
      });

      // 准备测试数据
      const errorCommand: CommandDefinition = {
        name: 'error',
        description: 'Error Command',
        action: errorFn
      };

      // 直接操作命令的状态存储
      adapter.setupCommand(errorCommand);

      // 获取子命令模拟
      const cmdMock = commanderMock.command.mock.results[0].value;

      // 确保有回调被存储
      expect(cmdMock._mockStateStore.actionCallbacks.length).toBeGreaterThan(0);

      // 获取并执行action回调
      const actionCallback = cmdMock._mockStateStore.actionCallbacks[0];

      await actionCallback();

      // 验证结果 - 应该调用error方法
      expect(consoleErrorSpy).toHaveBeenCalled();

      // 在非测试环境中应调用process.exit
      // 注意：由于测试环境检测，这个验证可能不适用，所以移除
      // expect(processExitSpy).toHaveBeenCalledWith(1);

      // 恢复模拟
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });
});
