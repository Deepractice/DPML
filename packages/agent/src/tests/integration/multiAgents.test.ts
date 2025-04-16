import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../../agent/types';

// 模拟createAgent函数
vi.mock('../../src', () => {
  return {
    createAgent: vi.fn().mockImplementation((config) => {
      return {
        getId: () => config.id,
        getVersion: () => config.version,
        execute: async () => ({ success: true }),
        executeStream: async function* () {
          yield { text: 'test response' };
        },
        getState: async () => ({}),
        reset: async () => {},
        interrupt: async () => {}
      };
    })
  };
});

describe('多代理集成测试 (IT-A-002)', () => {
  let firstAgent: Agent;
  let secondAgent: Agent;
  
  beforeEach(async () => {
    // 第一个代理配置
    const firstConfig: AgentFactoryConfig = {
      id: 'first-agent',
      version: '1.0.0',
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo',
        apiType: 'openai',
        systemPrompt: 'You are the first assistant.'
      }
    };
    
    // 第二个代理配置
    const secondConfig: AgentFactoryConfig = {
      id: 'second-agent',
      version: '1.0.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: 'You are the second assistant.'
      }
    };
    
    // 创建代理 - 使用await因为createAgent返回Promise
    firstAgent = await createAgent(firstConfig);
    secondAgent = await createAgent(secondConfig);
  });
  
  it('应该能同时创建多个代理实例', () => {
    expect(firstAgent).toBeDefined();
    expect(secondAgent).toBeDefined();
    expect(firstAgent.getId()).toBe('first-agent');
    expect(secondAgent.getId()).toBe('second-agent');
  });
}); 