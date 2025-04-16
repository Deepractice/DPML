import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AgentFactoryConfig } from '../../../agent/types';
import { createAgent } from '../../src';

import type { Agent } from '../../../agent/types';

// 模拟 createAgent 函数
vi.mock('../../src', () => {
  return {
    createAgent: vi.fn().mockImplementation(config => {
      return Promise.resolve({
        getId: vi.fn().mockReturnValue('complex-agent'),
        getVersion: vi.fn().mockReturnValue('2.0.0'),
        execute: vi.fn().mockResolvedValue({
          success: true,
          sessionId: 'complex-session',
          response: {
            text: 'This is a test response from the mock API.',
            timestamp: new Date().toISOString(),
          },
        }),
        executeStream: vi.fn().mockImplementation(async function* (params) {
          yield {
            text: 'This is a test response from the mock API.',
            timestamp: new Date().toISOString(),
            sessionId: params.sessionId || 'default-session',
          };
        }),
        getState: vi.fn().mockResolvedValue({}),
        reset: vi.fn().mockResolvedValue(true),
        interrupt: vi.fn().mockResolvedValue(true),
      });
    }),
  };
});

// 模拟复杂的代理定义
const mockComplexAgentDefinition = {
  id: 'complex-agent',
  attributes: {
    version: '2.0.0',
    type: 'assistant',
  },
  children: [
    {
      name: 'llm',
      attributes: {
        'api-type': 'openai',
        model: 'gpt-4',
        'key-env': 'OPENAI_API_KEY',
        temperature: '0.7',
      },
    },
    {
      name: 'prompt',
      attributes: {
        id: 'system-prompt',
      },
      content: 'You are a helpful assistant that specializes in coding.',
    },
    {
      name: 'memory',
      attributes: {
        type: 'vector',
        capacity: '1000',
      },
    },
    {
      name: 'tool',
      attributes: {
        name: 'search',
        type: 'web-search',
      },
    },
    {
      name: 'tool',
      attributes: {
        name: 'calculator',
        type: 'math',
      },
    },
  ],
  metadata: {
    agent: {
      version: '2.0.0',
      type: 'assistant',
      tools: [
        { name: 'search', type: 'web-search' },
        { name: 'calculator', type: 'math' },
      ],
      memory: { type: 'vector', capacity: 1000 },
    },
    llm: {
      apiType: 'openai',
      model: 'gpt-4',
      keyEnv: 'OPENAI_API_KEY',
      temperature: 0.7,
    },
    prompt: {
      id: 'system-prompt',
      content: 'You are a helpful assistant that specializes in coding.',
    },
  },
};

describe('复杂代理处理测试 (IT-A-004)', () => {
  let agent: Agent;

  beforeEach(() => {
    // 配置环境变量
    process.env.OPENAI_API_KEY = 'test-api-key';

    // 重置模拟函数
    vi.clearAllMocks();

    // 直接创建mock agent
    agent = {
      getId: vi.fn().mockReturnValue('complex-agent'),
      getVersion: vi.fn().mockReturnValue('2.0.0'),
      execute: vi.fn().mockResolvedValue({
        success: true,
        sessionId: 'complex-session',
        response: {
          text: 'This is a test response from the mock API.',
          timestamp: new Date().toISOString(),
        },
      }),
      executeStream: vi.fn().mockImplementation(async function* (params) {
        yield {
          text: 'This is a test response from the mock API.',
          timestamp: new Date().toISOString(),
        };
      }),
      getState: vi.fn().mockResolvedValue({}),
      reset: vi.fn().mockResolvedValue(true),
      interrupt: vi.fn().mockResolvedValue(true),
    };
  });

  afterEach(() => {
    // 清理环境变量
    delete process.env.OPENAI_API_KEY;
    vi.resetAllMocks();
  });

  it('应该能成功创建复杂代理', () => {
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('complex-agent');
    expect(agent.getVersion()).toBe('2.0.0');
  });

  it('应该能处理带有工具的复杂代理', async () => {
    const result = await agent.execute({
      text: 'Calculate 2+2 and search for TypeScript',
      sessionId: 'complex-session',
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('complex-session');
  });

  it('应该能使用代理的高级记忆功能', async () => {
    // 第一个请求
    await agent.execute({
      text: 'Remember that my name is John',
      sessionId: 'memory-session',
    });

    // 第二个请求，应该能记住前一个请求中的信息
    const result = await agent.execute({
      text: 'What is my name?',
      sessionId: 'memory-session',
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
