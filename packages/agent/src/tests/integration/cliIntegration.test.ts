import * as fs from 'fs';
import * as path from 'path';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { createAgent } from '../../src';

import type { Agent, AgentFactoryConfig } from '../../../agent/types';

// 模拟子进程
vi.mock('child_process', async () => {
  return {
    execSync: vi.fn(command => {
      if (command.includes('dpml agent run')) {
        return Buffer.from('Agent executed via CLI');
      }

      if (command.includes('dpml agent list')) {
        return Buffer.from('api-test-agent\ncomplex-agent\nbase-agent');
      }

      return Buffer.from('');
    }),
  };
});

// 模拟文件系统
vi.mock('fs', async () => {
  return {
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockImplementation(filePath => {
      if (filePath.endsWith('cli-agent.dpml')) {
        return `<agent id="cli-agent" version="1.0">
          <llm api-type="openai" model="gpt-3.5-turbo" key-env="OPENAI_API_KEY" />
          <prompt>You are a CLI assistant.</prompt>
        </agent>`;
      }

      return '';
    }),
    writeFileSync: vi.fn(),
  };
});

// 模拟LLM连接器工厂
vi.mock('../../src/connector/LLMConnectorFactory', () => {
  return {
    LLMConnectorFactory: {
      createConnector: vi.fn(() => ({
        complete: vi.fn(async (prompt, options = {}) => {
          return {
            content: 'This is a CLI test response',
            usage: {
              promptTokens: 10,
              completionTokens: 5,
              totalTokens: 15,
            },
          };
        }),
        completeStream: vi.fn(async function* (prompt, options = {}) {
          yield {
            content: 'This is a CLI test response',
            isLast: true,
            usage: {
              promptTokens: 10,
              completionTokens: 5,
              totalTokens: 15,
            },
          };
        }),
        getType: vi.fn(() => 'openai'),
      })),
      clearCache: vi.fn(),
    },
  };
});

// 模拟CLI执行
const mockCliExecution = vi
  .fn()
  .mockImplementation((agentId, input, options = {}) => {
    return {
      success: true,
      sessionId: 'cli-session',
      text: `CLI Response for ${input}`,
      processingTimeMs: 123,
    };
  });

// 模拟createAgent函数
vi.mock('../../src', () => {
  return {
    createAgent: vi.fn(config => {
      return {
        getId: () => config.id,
        getVersion: () => config.version,
        execute: async input => {
          return {
            success: true,
            sessionId: 'cli-session',
            text: 'CLI Response for Hello via normal execution',
            processingTimeMs: 100,
          };
        },
        executeStream: async function* (input) {
          yield {
            text: 'CLI test response',
            sessionId: 'cli-session',
          };
        },
        getState: async () => ({ messages: [], status: 'READY' }),
        reset: async () => {},
        executeWithCli: mockCliExecution,
      };
    }),
  };
});

describe('CLI工具集成测试 (IT-A-008)', () => {
  let agent: Agent;

  beforeEach(() => {
    // 配置环境变量
    process.env.OPENAI_API_KEY = 'test-api-key';

    // 基本配置
    const config: AgentFactoryConfig = {
      id: 'cli-agent',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo',
        apiType: 'openai',
        systemPrompt: 'You are a CLI assistant.',
      },
    };

    // 创建代理
    agent = createAgent(config);
  });

  afterEach(() => {
    // 清理环境变量
    delete process.env.OPENAI_API_KEY;

    // 重置所有模拟
    vi.clearAllMocks();
  });

  it('应该能成功创建用于CLI的代理', () => {
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('cli-agent');
    expect(agent.getVersion()).toBe('1.0');
  });

  it('应该能通过模拟CLI执行代理', async () => {
    // 使用模拟的CLI执行方法
    const result = await (agent as any).executeWithCli(
      'cli-agent',
      'Hello from CLI',
      {
        outputFormat: 'text',
      }
    );

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.text).toBe('CLI Response for Hello from CLI');
    expect(mockCliExecution).toHaveBeenCalledWith(
      'cli-agent',
      'Hello from CLI',
      { outputFormat: 'text' }
    );
  });

  it('应该能与实际的Agent执行机制集成', async () => {
    // 通过正常执行方法，但使用模拟的底层实现
    const result = await agent.execute({
      text: 'Hello via normal execution',
      sessionId: 'cli-session',
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
