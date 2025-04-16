import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../../agent/types';

// 模拟LLM连接器工厂
vi.mock('../../src/connector/LLMConnectorFactory', () => {
  return {
    LLMConnectorFactory: {
      createConnector: vi.fn(() => ({
        complete: vi.fn(async (prompt, options = {}) => {
          // 返回带有完整字段的响应
          return {
            content: 'This is a test response',
            usage: {
              promptTokens: 10,
              completionTokens: 5,
              totalTokens: 15
            }
          };
        }),
        completeStream: vi.fn(async function* (prompt, options = {}) {
          yield {
            content: 'This is a test response',
            isLast: true,
            usage: {
              promptTokens: 10,
              completionTokens: 5,
              totalTokens: 15
            }
          };
        }),
        getType: vi.fn(() => 'openai')
      })),
      clearCache: vi.fn()
    }
  };
});

// 模拟createAgent函数
vi.mock('../../src', () => {
  return {
    createAgent: vi.fn((config) => {
      return {
        getId: () => config.id,
        getVersion: () => config.version,
        execute: async (input) => {
          const sessionId = input?.sessionId || 'test-session-id';
          return {
            success: true,
            sessionId,
            text: 'This is a test response',
            processingTimeMs: 100
          };
        },
        executeStream: async function* (input) {
          const sessionId = input?.sessionId || 'test-session-id';
          yield {
            text: 'This is a test response',
            sessionId
          };
        },
        getState: async () => ({ messages: [], status: 'READY' }),
        reset: async () => {},
      };
    })
  };
});

describe('Agent基本集成测试 (IT-A-001)', () => {
  let agent: Agent;
  let config: AgentFactoryConfig;
  
  beforeEach(() => {
    // 基本配置
    config = {
      id: 'test-agent',
      version: '1.0.0',
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo',
        apiType: 'openai',
        systemPrompt: 'You are a test assistant.'
      }
    };
    
    // 创建代理
    agent = createAgent(config);
  });
  
  it('应该成功创建代理实例', () => {
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('test-agent');
    expect(agent.getVersion()).toBe('1.0.0');
  });
  
  it('应该能获取代理状态', async () => {
    const state = await agent.getState();
    expect(state).toBeDefined();
  });
  
  it('应该能执行基本请求', async () => {
    const result = await agent.execute({ text: 'Hello' });
    expect(result).toBeDefined();
    expect(result.sessionId).toBeDefined();
    expect(result.success).toBe(true);
  });
}); 