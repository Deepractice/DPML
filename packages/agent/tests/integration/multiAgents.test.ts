import { describe, it, expect, beforeEach } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../src/agent/types';

describe('多代理集成测试 (IT-A-002)', () => {
  let firstAgent: Agent;
  let secondAgent: Agent;
  
  beforeEach(() => {
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
    
    // 创建代理
    firstAgent = createAgent(firstConfig);
    secondAgent = createAgent(secondConfig);
  });
  
  it('应该能同时创建多个代理实例', () => {
    expect(firstAgent).toBeDefined();
    expect(secondAgent).toBeDefined();
    expect(firstAgent.getId()).toBe('first-agent');
    expect(secondAgent.getId()).toBe('second-agent');
  });
}); 