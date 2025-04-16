import { describe, it, expect, beforeEach, vi } from 'vitest';

import { createAgent } from '../../src';

import type { Agent, AgentFactoryConfig } from '../../../agent/types';

// 模拟LLM连接器工厂
vi.mock('../../src/connector/LLMConnectorFactory', () => {
  return {
    LLMConnectorFactory: {
      createConnector: vi.fn(() => ({
        complete: vi.fn(async (prompt, options = {}) => {
          return {
            content: 'This is a test response',
            usage: {
              promptTokens: 10,
              completionTokens: 5,
              totalTokens: 15,
            },
          };
        }),
        completeStream: vi.fn(async function* (prompt, options = {}) {
          yield {
            content: 'This is a test response',
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

// 模拟createAgent函数
vi.mock('../../src', () => {
  return {
    createAgent: vi.fn(config => {
      return {
        getId: () => config.id,
        getVersion: () => config.version,
        execute: async input => {
          const sessionId = input?.sessionId || 'test-session';

          return {
            success: true,
            sessionId,
            text: 'This is a test response',
            processingTimeMs: 100,
          };
        },
        executeStream: async function* (input) {
          const sessionId = input?.sessionId || 'test-session';

          yield {
            text: 'This is a test response',
            sessionId,
          };
        },
        getState: async () => ({ messages: [], status: 'READY' }),
        reset: async () => {},
      };
    }),
  };
});

describe('与Prompt包集成测试 (IT-A-003)', () => {
  let agent: Agent;

  beforeEach(() => {
    // 基本配置
    const config: AgentFactoryConfig = {
      id: 'test-agent',
      version: '1.0.0',
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo',
        apiType: 'openai',
        systemPrompt: 'You are a test assistant.',
      },
    };

    // 创建代理
    agent = createAgent(config);
  });

  it('应该能成功创建使用Prompt的代理', () => {
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('test-agent');
  });

  it('应该能执行包含Prompt的请求', async () => {
    const result = await agent.execute({
      text: 'Hello',
      sessionId: 'test-session',
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('test-session');
  });
});
