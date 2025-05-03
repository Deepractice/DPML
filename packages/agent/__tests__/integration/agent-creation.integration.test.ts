/**
 * Agent创建流程集成测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createAgent } from '../../src/api/agent';
import { AgentConfig } from '../../src/types';
import { createClient } from '../../src/core/llm/llmFactory';
import { InMemoryAgentSession } from '../../src/core/session/InMemoryAgentSession';

// 模拟依赖
vi.mock('../../src/core/llm/llmFactory', () => ({
  createClient: vi.fn().mockReturnValue({
    sendMessages: vi.fn().mockResolvedValue({
      content: { type: 'text', value: '模拟响应' }
    })
  })
}));

vi.mock('../../src/core/session/InMemoryAgentSession', () => ({
  InMemoryAgentSession: vi.fn().mockImplementation(() => ({
    addMessage: vi.fn(),
    getMessages: vi.fn().mockReturnValue([])
  }))
}));

describe('IT-Agent', () => {
  let testConfig: AgentConfig;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    testConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4',
        apiKey: 'sk-test123'
      },
      prompt: '你是一个AI助手'
    };
  });
  
  test('IT-Agent-01: API层应委托Core层创建Agent', async () => {
    // 执行
    const agent = createAgent(testConfig);
    
    // 验证
    expect(agent).toBeDefined();
    expect(typeof agent.chat).toBe('function');
    expect(typeof agent.chatStream).toBe('function');
  });
  
  test('IT-Agent-02: Agent创建应包含正确的LLM客户端创建', async () => {
    // 执行
    createAgent(testConfig);
    
    // 验证
    expect(createClient).toHaveBeenCalledWith(testConfig.llm);
  });
  
  test('IT-Agent-03: Agent创建应初始化会话管理器', async () => {
    // 执行
    createAgent(testConfig);
    
    // 验证
    expect(InMemoryAgentSession).toHaveBeenCalled();
  });
  
  test('IT-Agent-04: Agent创建应组装所有组件生成Agent实例', async () => {
    // 执行
    const agent = createAgent(testConfig);
    
    // 验证Agent实例能够正确处理消息
    await expect(agent.chat('测试消息')).resolves.toBe('模拟响应');
  });
}); 