import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry } from '../../src';
import { Command, DomainCommandSet } from '../../src';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  // UT-C-001: 基础注册表操作
  describe('基础注册表操作', () => {
    it('应该能注册和检索命令', () => {
      // 创建模拟命令
      const mockCommand: Command = {
        name: 'test-command',
        description: 'Test command for unit testing',
        execute: async () => {}
      };

      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map([['test-command', mockCommand]])
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 检索命令
      const retrievedCommand = registry.getCommand('test-domain', 'test-command');
      expect(retrievedCommand).toBe(mockCommand);
    });

    it('应该能获取领域命令集', () => {
      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map()
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 获取领域命令集
      const retrievedDomainSet = registry.getDomain('test-domain');
      expect(retrievedDomainSet).toBe(mockDomainSet);
    });

    it('应该能获取所有领域名称', () => {
      // 创建并注册多个领域命令集
      const domains = ['domain1', 'domain2', 'domain3'];
      
      domains.forEach(domain => {
        const mockDomainSet: DomainCommandSet = {
          domain,
          package: `@dpml/${domain}`,
          commandsPath: 'dist/commands.js',
          version: '1.0.0',
          commands: new Map()
        };
        registry.registerDomainCommandSet(mockDomainSet);
      });

      // 获取所有领域名称
      const allDomains = registry.getAllDomains();
      expect(allDomains).toHaveLength(domains.length);
      expect(allDomains).toEqual(expect.arrayContaining(domains));
    });

    it('当领域或命令不存在时应返回undefined', () => {
      // 检索不存在的领域
      const nonExistentDomain = registry.getDomain('non-existent');
      expect(nonExistentDomain).toBeUndefined();

      // 检索不存在的命令
      const nonExistentCommand = registry.getCommand('non-existent', 'command');
      expect(nonExistentCommand).toBeUndefined();
    });
  });

  // UT-C-002: 命令集管理
  describe('命令集管理', () => {
    it('应该能注册单个命令到已存在的领域', () => {
      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map()
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 创建模拟命令
      const mockCommand: Command = {
        name: 'new-command',
        description: 'New command for testing',
        execute: async () => {}
      };

      // 注册单个命令
      registry.registerCommand('test-domain', mockCommand);

      // 检索命令
      const retrievedCommand = registry.getCommand('test-domain', 'new-command');
      expect(retrievedCommand).toBe(mockCommand);
    });

    it('当注册命令到不存在的领域时应抛出错误', () => {
      // 创建模拟命令
      const mockCommand: Command = {
        name: 'test-command',
        description: 'Test command',
        execute: async () => {}
      };

      // 尝试注册到不存在的领域
      expect(() => {
        registry.registerCommand('non-existent', mockCommand);
      }).toThrow(/Domain .* does not exist/);
    });

    it('应该能删除命令', () => {
      // 创建模拟命令
      const mockCommand: Command = {
        name: 'test-command',
        description: 'Test command for unit testing',
        execute: async () => {}
      };

      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map([['test-command', mockCommand]])
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 确认命令存在
      expect(registry.getCommand('test-domain', 'test-command')).toBeDefined();

      // 删除命令
      registry.removeCommand('test-domain', 'test-command');

      // 确认命令已删除
      expect(registry.getCommand('test-domain', 'test-command')).toBeUndefined();
    });

    it('删除不存在的命令应该不抛出错误', () => {
      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map()
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 删除不存在的命令不应抛出错误
      expect(() => {
        registry.removeCommand('test-domain', 'non-existent');
      }).not.toThrow();
    });
  });

  // UT-C-003: 命令注册冲突
  describe('命令注册冲突', () => {
    it('注册同名命令应抛出错误', () => {
      // 创建模拟命令
      const mockCommand1: Command = {
        name: 'test-command',
        description: 'First test command',
        execute: async () => {}
      };

      const mockCommand2: Command = {
        name: 'test-command',
        description: 'Second test command',
        execute: async () => {}
      };

      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map([['test-command', mockCommand1]])
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 尝试注册同名命令应抛出错误
      expect(() => {
        registry.registerCommand('test-domain', mockCommand2);
      }).toThrow(/Command .* already exists/);
    });

    it('应该能使用强制选项覆盖已存在的命令', () => {
      // 创建模拟命令
      const mockCommand1: Command = {
        name: 'test-command',
        description: 'First test command',
        execute: async () => {}
      };

      const mockCommand2: Command = {
        name: 'test-command',
        description: 'Second test command',
        execute: async () => {}
      };

      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map([['test-command', mockCommand1]])
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 使用强制选项覆盖命令
      registry.registerCommand('test-domain', mockCommand2, true);

      // 检索命令，应该是第二个命令
      const retrievedCommand = registry.getCommand('test-domain', 'test-command');
      expect(retrievedCommand).toBe(mockCommand2);
    });
  });

  // UT-C-004: 序列化与反序列化
  describe('序列化与反序列化', () => {
    it('应该能序列化注册表', () => {
      // 创建模拟命令
      const mockCommand: Command = {
        name: 'test-command',
        description: 'Test command for serialization',
        execute: async () => {}
      };

      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map([['test-command', mockCommand]])
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 序列化注册表
      const serialized = registry.serialize();

      // 验证序列化结果
      expect(serialized).toHaveProperty('domains');
      expect(serialized.domains).toHaveProperty('test-domain');
      expect(serialized.domains['test-domain']).toHaveProperty('package', '@dpml/test');
      expect(serialized.domains['test-domain']).toHaveProperty('commandsPath', 'dist/commands.js');
      expect(serialized.domains['test-domain']).toHaveProperty('version', '1.0.0');
      // 命令不应该被序列化，因为它们包含函数
      expect(serialized.domains['test-domain']).not.toHaveProperty('commands');
    });

    it('应该能从序列化数据恢复注册表', () => {
      // 创建序列化数据
      const serializedData = {
        domains: {
          'test-domain': {
            domain: 'test-domain',
            package: '@dpml/test',
            commandsPath: 'dist/commands.js',
            version: '1.0.0'
          }
        }
      };

      // 从序列化数据恢复注册表
      registry.deserialize(serializedData);

      // 验证恢复结果
      const domain = registry.getDomain('test-domain');
      expect(domain).toBeDefined();
      expect(domain?.domain).toBe('test-domain');
      expect(domain?.package).toBe('@dpml/test');
      expect(domain?.commandsPath).toBe('dist/commands.js');
      expect(domain?.version).toBe('1.0.0');
      expect(domain?.commands).toBeInstanceOf(Map);
      expect(domain?.commands.size).toBe(0);
    });
  });

  // UT-C-005: 命令映射查询
  describe('命令映射查询', () => {
    it('应该能获取领域下的所有命令', () => {
      // 创建多个模拟命令
      const mockCommands: Command[] = [
        {
          name: 'command1',
          description: 'First command',
          execute: async () => {}
        },
        {
          name: 'command2',
          description: 'Second command',
          execute: async () => {}
        },
        {
          name: 'command3',
          description: 'Third command',
          execute: async () => {}
        }
      ];

      // 创建命令映射
      const commandsMap = new Map<string, Command>();
      mockCommands.forEach(cmd => commandsMap.set(cmd.name, cmd));

      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: commandsMap
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 获取领域下的所有命令
      const domainCommands = registry.getDomainCommands('test-domain');
      expect(domainCommands).toHaveLength(mockCommands.length);
      
      // 验证所有命令都在结果中
      mockCommands.forEach(cmd => {
        expect(domainCommands).toContainEqual(cmd);
      });
    });

    it('获取不存在领域的命令应返回空数组', () => {
      const commands = registry.getDomainCommands('non-existent');
      expect(commands).toEqual([]);
    });

    it('应该能检查命令是否存在', () => {
      // 创建模拟命令
      const mockCommand: Command = {
        name: 'test-command',
        description: 'Test command',
        execute: async () => {}
      };

      // 创建模拟领域命令集
      const mockDomainSet: DomainCommandSet = {
        domain: 'test-domain',
        package: '@dpml/test',
        commandsPath: 'dist/commands.js',
        version: '1.0.0',
        commands: new Map([['test-command', mockCommand]])
      };

      // 注册领域命令集
      registry.registerDomainCommandSet(mockDomainSet);

      // 检查命令是否存在
      expect(registry.hasCommand('test-domain', 'test-command')).toBe(true);
      expect(registry.hasCommand('test-domain', 'non-existent')).toBe(false);
      expect(registry.hasCommand('non-existent', 'test-command')).toBe(false);
    });
  });
});
