import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../src/agent/types';

// 模拟Prompt包
vi.mock('@dpml/prompt', () => {
  return {
    PromptProcessor: {
      process: vi.fn(() => ({
        content: 'Processed prompt content',
        variables: { key: 'value' }
      }))
    },
    PromptRegistry: {
      registerPrompt: vi.fn(),
      getPromptById: vi.fn(() => ({
        id: 'test-prompt',
        content: 'Test prompt content',
        variables: { key: 'value' }
      }))
    }
  };
});

// 模拟Core包
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
              content: 'You are a test assistant.',
              id: 'test-prompt'
            }
          }
        }))
      }))
    },
    AbstractTagProcessor: class {
      tagName = '';
      processSpecificAttributes() { return {}; }
      findChildrenByTagName() { return []; }
      findFirstChildByTagName() { return null; }
    },
    Element: class {},
    ProcessingContext: class {}
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
        systemPrompt: 'You are a test assistant.'
      }
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
      sessionId: 'test-session' 
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('test-session');
  });
}); 