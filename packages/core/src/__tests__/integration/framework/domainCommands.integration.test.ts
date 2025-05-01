/**
 * 领域命令集成测试
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { createDomainDPML } from '../../../api/framework';
import { getAllRegisteredCommands, resetCommandRegistry, registerCommands } from '../../../core/framework/domainService';
import type { CommandDefinition } from '../../../types/CLI';
import type { DomainConfig } from '../../../types/DomainConfig';

describe('IT-DMCMD: 领域命令集成测试', () => {
  // 测试前后清理命令注册表
  beforeEach(() => {
    resetCommandRegistry();
  });

  afterEach(() => {
    resetCommandRegistry();
  });

  // 创建测试用的领域配置
  function createTestDomainConfig(): DomainConfig {
    return {
      domain: 'test-domain',
      description: '测试领域',
      schema: {
        root: {
          element: 'test',
          attributes: [
            { name: 'id', type: 'string', required: true }
          ],
          children: {
            elements: []
          }
        }
      },
      transformers: [
        {
          name: 'TestTransformer',
          transform: (data: unknown) => ({ result: 'transformed' })
        }
      ],
      commands: {
        includeStandard: true,
        actions: [
          {
            name: 'custom-action',
            description: '自定义命令',
            args: [
              { name: 'input', description: '输入参数', required: true }
            ],
            options: [
              { flags: '--format <type>', description: '输出格式' }
            ],
            action: async (context, input, options) => {

            }
          }
        ]
      }
    };
  }

  it('IT-DMCMD-01: createDomainDPML应注册领域命令', async () => {
    // 准备: 创建包含命令配置的领域配置
    const domainConfig = createTestDomainConfig();

    // 确认初始状态为空
    expect(getAllRegisteredCommands().length).toBe(0);

    // 执行: 创建领域编译器
    await createDomainDPML(domainConfig);

    // 验证命令注册结果
    const registeredCommands = getAllRegisteredCommands();

    // 应该有3个命令: validate, parse, custom-action
    expect(registeredCommands.length).toBe(3);

    // 验证命令名称正确
    const commandNames = registeredCommands.map(cmd => cmd.name);

    expect(commandNames).toContain('test-domain:validate');
    expect(commandNames).toContain('test-domain:parse');
    expect(commandNames).toContain('test-domain:custom-action');

    // 验证命令domain正确
    registeredCommands.forEach(cmd => {
      expect(cmd.category).toBe('test-domain');
    });
  });

  it('IT-DMCMD-02: 应支持多个领域的命令注册', async () => {
    // 准备: 创建两个不同领域的配置
    const domain1Config: DomainConfig = {
      ...createTestDomainConfig(),
      domain: 'domain1'
    };

    const domain2Config: DomainConfig = {
      ...createTestDomainConfig(),
      domain: 'domain2',
      commands: {
        includeStandard: true,
        actions: [
          {
            name: 'domain2-action',
            description: '领域2专用命令',
            action: async (context) => {

            }
          }
        ]
      }
    };

    // 执行: 创建两个领域的编译器
    await createDomainDPML(domain1Config);
    await createDomainDPML(domain2Config);

    // 验证命令注册结果
    const registeredCommands = getAllRegisteredCommands();

    // 应该有6个命令: domain1的3个 + domain2的3个 (validate, parse + domain2-action)
    expect(registeredCommands.length).toBe(6);

    // 按领域分组命令
    const domain1Commands = registeredCommands.filter(cmd => cmd.category === 'domain1');
    const domain2Commands = registeredCommands.filter(cmd => cmd.category === 'domain2');

    // 验证领域1命令
    expect(domain1Commands.length).toBe(3);
    expect(domain1Commands.some(cmd => cmd.name === 'domain1:validate')).toBe(true);
    expect(domain1Commands.some(cmd => cmd.name === 'domain1:parse')).toBe(true);
    expect(domain1Commands.some(cmd => cmd.name === 'domain1:custom-action')).toBe(true);

    // 验证领域2命令
    expect(domain2Commands.length).toBe(3);
    expect(domain2Commands.some(cmd => cmd.name === 'domain2:validate')).toBe(true);
    expect(domain2Commands.some(cmd => cmd.name === 'domain2:parse')).toBe(true);
    expect(domain2Commands.some(cmd => cmd.name === 'domain2:domain2-action')).toBe(true);
  });

  it('应处理命令名称冲突', async () => {
    // 创建第一个领域
    const domain1Config = createTestDomainConfig();

    await createDomainDPML(domain1Config);

    // 检查命令是否已注册
    const commands = getAllRegisteredCommands();
    const validateCommand = commands.find(cmd => cmd.name === 'test-domain:validate');

    expect(validateCommand).toBeDefined();
    expect(validateCommand?.category).toBe('test-domain');

    // 重置命令注册表
    resetCommandRegistry();
  });

  it('应支持按领域名称筛选命令', () => {
    // 准备: 注册多个领域的命令
    const commands: CommandDefinition[] = [
      {
        name: 'domain1:cmd1',
        description: '领域1命令1',
        category: 'domain1',
        action: async () => {}
      },
      {
        name: 'domain1:cmd2',
        description: '领域1命令2',
        category: 'domain1',
        action: async () => {}
      },
      {
        name: 'domain2:cmd1',
        description: '领域2命令1',
        category: 'domain2',
        action: async () => {}
      }
    ];

    // 注册命令
    registerCommands(commands);

    // 获取所有命令
    const allCommands = getAllRegisteredCommands();

    expect(allCommands.length).toBe(3);

    // 按领域筛选
    const domain1Commands = allCommands.filter(cmd => cmd.category === 'domain1');

    expect(domain1Commands.length).toBe(2);
    expect(domain1Commands.every(cmd => cmd.name.startsWith('domain1:'))).toBe(true);

    const domain2Commands = allCommands.filter(cmd => cmd.category === 'domain2');

    expect(domain2Commands.length).toBe(1);
    expect(domain2Commands[0].name).toBe('domain2:cmd1');
  });
});
