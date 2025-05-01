/**
 * CLI模块测试夹具
 * 提供测试数据和辅助函数
 */
import { vi } from 'vitest';

import type { CLIOptions, CommandDefinition } from '../../../types/CLI';

/**
 * 创建基本CLI选项夹具
 */
export function createCLIOptionsFixture(): CLIOptions {
  return {
    name: 'dpml',
    version: '1.0.0',
    description: 'DPML命令行工具'
  };
}

/**
 * 创建命令定义夹具
 */
export function createCommandDefinitionsFixture(): CommandDefinition[] {
  return [
    {
      name: 'parse',
      description: '解析DPML文档',
      arguments: [
        {
          name: 'file',
          description: 'DPML文件路径',
          required: true
        }
      ],
      options: [
        {
          flags: '-o, --output <file>',
          description: '输出文件路径'
        },
        {
          flags: '--format <format>',
          description: '输出格式 (json, xml, yaml)',
          defaultValue: 'json'
        }
      ],
      action: vi.fn().mockImplementation((file, options) => {
        console.log(`解析文件: ${file}`);
        console.log(`输出路径: ${options.output || '标准输出'}`);
        console.log(`输出格式: ${options.format}`);
      })
    },
    {
      name: 'validate',
      description: '验证DPML文档',
      arguments: [
        {
          name: 'file',
          description: 'DPML文件路径',
          required: true
        }
      ],
      options: [
        {
          flags: '--strict',
          description: '使用严格模式验证'
        }
      ],
      action: vi.fn().mockImplementation((file, options) => {
        console.log(`验证文件: ${file}`);
        console.log(`严格模式: ${options.strict ? '是' : '否'}`);
      })
    },
    {
      name: 'convert',
      description: '转换DPML文档格式',
      action: vi.fn(),
      subcommands: [
        {
          name: 'to-json',
          description: '转换为JSON格式',
          arguments: [
            {
              name: 'file',
              description: 'DPML文件路径',
              required: true
            }
          ],
          action: vi.fn().mockImplementation((file) => {
            console.log(`转换文件到JSON: ${file}`);
          })
        },
        {
          name: 'to-xml',
          description: '转换为XML格式',
          arguments: [
            {
              name: 'file',
              description: 'DPML文件路径',
              required: true
            }
          ],
          action: vi.fn().mockImplementation((file) => {
            console.log(`转换文件到XML: ${file}`);
          })
        }
      ]
    }
  ];
}

/**
 * 创建外部命令夹具
 */
export function createExternalCommandsFixture(): CommandDefinition[] {
  return [
    {
      name: 'external',
      description: '外部命令示例',
      arguments: [
        {
          name: 'input',
          description: '输入文件',
          required: true
        }
      ],
      action: vi.fn().mockImplementation((input) => {
        console.log(`处理外部命令: ${input}`);
      })
    }
  ];
}

/**
 * 创建重复命令夹具
 */
export function createDuplicateCommandsFixture(): CommandDefinition[] {
  return [
    {
      name: 'parse',
      description: '解析DPML文档',
      action: vi.fn()
    },
    {
      name: 'parse',  // 重复的命令名
      description: '解析DPML文档（重复）',
      action: vi.fn()
    }
  ];
}

/**
 * 创建子命令重复夹具
 */
export function createDuplicateSubcommandsFixture(): CommandDefinition[] {
  return [
    {
      name: 'convert',
      description: '转换DPML文档格式',
      action: vi.fn(),
      subcommands: [
        {
          name: 'to-json',
          description: '转换为JSON格式',
          action: vi.fn()
        },
        {
          name: 'to-json',  // 重复的子命令
          description: '转换为JSON格式（重复）',
          action: vi.fn()
        }
      ]
    }
  ];
}

/**
 * 创建跨领域重复命令夹具
 */
export function createCrossDomainDuplicateCommandsFixture(): CommandDefinition[] {
  return [
    {
      name: 'export',
      description: '导出功能',
      category: 'domain1',
      action: vi.fn()
    },
    {
      name: 'export',  // 相同名称但不同领域
      description: '导出功能',
      category: 'domain2',
      action: vi.fn()
    }
  ];
}

/**
 * 创建命令行参数夹具
 */
export function createCommandLineArgsFixture(command: string): string[] {
  return ['node', 'dpml', ...command.split(' ')];
}
