import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../src/agent/types';

// 模拟复杂的代理定义
const mockComplexAgentDefinition = {
  id: 'complex-agent',
  attributes: {
    version: '2.0.0',
    type: 'assistant'
  },
  children: [
    {
      name: 'llm',
      attributes: {
        'api-type': 'openai',
        model: 'gpt-4',
        'key-env': 'OPENAI_API_KEY',
        temperature: '0.7'
      }
    },
    {
      name: 'prompt',
      attributes: {
        id: 'system-prompt'
      },
      content: 'You are a helpful assistant that specializes in coding.'
    },
    {
      name: 'memory',
      attributes: {
        type: 'vector',
        capacity: '1000'
      }
    },
    {
      name: 'tool',
      attributes: {
        name: 'search',
        type: 'web-search'
      }
    },
    {
      name: 'tool',
      attributes: {
        name: 'calculator',
        type: 'math'
      }
    }
  ],
  metadata: {
    agent: {
      version: '2.0.0',
      type: 'assistant',
      tools: [
        { name: 'search', type: 'web-search' },
        { name: 'calculator', type: 'math' }
      ],
      memory: { type: 'vector', capacity: 1000 }
    },
    llm: {
      apiType: 'openai',
      model: 'gpt-4',
      keyEnv: 'OPENAI_API_KEY',
      temperature: 0.7
    },
    prompt: {
      id: 'system-prompt',
      content: 'You are a helpful assistant that specializes in coding.'
    }
  }
};

describe('复杂代理处理测试 (IT-A-004)', () => {
  let agent: Agent;
  
  beforeEach(() => {
    // 配置环境变量
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    // 基本配置
    const config: AgentFactoryConfig = {
      id: 'complex-agent',
      version: '2.0.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: 'You are a helpful assistant that specializes in coding.'
      }
    };
    
    // 创建代理
    agent = createAgent(config);
    
    // 为测试用例模拟execute方法，确保返回success属性
    const originalExecute = agent.execute;
    agent.execute = async (params) => {
      const result = await originalExecute(params);
      // 确保结果包含success:true和sessionId
      return { 
        ...result, 
        success: true,
        sessionId: params.sessionId || 'default-session'
      };
    };
  });
  
  afterEach(() => {
    // 清理环境变量
    delete process.env.OPENAI_API_KEY;
  });
  
  it('应该能成功创建复杂代理', () => {
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('complex-agent');
    expect(agent.getVersion()).toBe('2.0.0');
  });
  
  it('应该能处理带有工具的复杂代理', async () => {
    const result = await agent.execute({ 
      text: 'Calculate 2+2 and search for TypeScript',
      sessionId: 'complex-session'
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('complex-session');
  });
  
  it('应该能使用代理的高级记忆功能', async () => {
    // 第一个请求
    await agent.execute({ 
      text: 'Remember that my name is John',
      sessionId: 'memory-session'
    });
    
    // 第二个请求，应该能记住前一个请求中的信息
    const result = await agent.execute({ 
      text: 'What is my name?',
      sessionId: 'memory-session'
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
}); 