import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../src/agent/types';
import { TagRegistry } from '@dpml/core';

// 模拟标签注册
vi.mock('@dpml/core', async () => {
  return {
    TagRegistry: {
      registerTag: vi.fn(),
      getInstance: vi.fn(() => ({
        findTagById: vi.fn(() => ({
          id: 'test-agent',
          attributes: {
            version: '1.0.0',
            type: 'test'
          },
          metadata: {
            agent: {
              version: '1.0.0',
              type: 'test'
            },
            llm: {
              apiType: 'openai',
              model: 'gpt-3.5-turbo'
            },
            prompt: {
              content: 'You are a test assistant.'
            }
          }
        }))
      }))
    },
    AbstractTagProcessor: class {
      tagName: string;
      processSpecificAttributes() { return {}; }
      findChildrenByTagName() { return []; }
      findFirstChildByTagName() { return null; }
    },
    Element: class {},
    ProcessingContext: class {}
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

describe('与Core包集成测试 (IT-A-002)', () => {
  it('应该正确使用Core包的TagRegistry功能', () => {
    // 验证是否使用了TagRegistry
    expect(TagRegistry.getInstance).toHaveBeenCalled();
  });
}); 