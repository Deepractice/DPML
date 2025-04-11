import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../src/agent/types';
import { ApiKeyManager } from '../../src/apiKey/ApiKeyManager';

// 模拟fetch
global.fetch = vi.fn();

// 模拟API响应
const mockApiResponse = {
  json: async () => ({
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-3.5-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'This is a test response from the mock API.'
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 8,
      total_tokens: 18
    }
  })
};

// 模拟成功响应
function mockSuccessResponse() {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: mockApiResponse.json
  });
}

// 模拟Core包
vi.mock('@dpml/core', async () => {
  return {
    TagRegistry: {
      registerTag: vi.fn(),
      getInstance: vi.fn(() => ({
        findTagById: vi.fn(() => ({
          id: 'api-test-agent',
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
              model: 'gpt-3.5-turbo',
              keyEnv: 'OPENAI_API_KEY'
            },
            prompt: {
              content: 'You are a test assistant.'
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

// 模拟ApiKeyManager
vi.mock('../../src/apiKey/ApiKeyManager', () => {
  return {
    ApiKeyManager: {
      getInstance: vi.fn(() => ({
        getKey: vi.fn(() => 'test-api-key'),
        validateKey: vi.fn(() => true)
      }))
    }
  };
});

// 模拟LLM连接器
vi.mock('../../src/connector', () => {
  return {
    LLMConnectorFactory: {
      createConnector: vi.fn(() => ({
        complete: vi.fn(async () => ({
          content: 'This is a test response from the mock API.',
          usage: {
            promptTokens: 10,
            completionTokens: 8,
            totalTokens: 18
          }
        })),
        completeStream: vi.fn(async function* () {
          yield {
            content: 'This is ',
            isLast: false
          };
          yield {
            content: 'a test response ',
            isLast: false
          };
          yield {
            content: 'from the mock API.',
            isLast: true,
            usage: {
              promptTokens: 10,
              completionTokens: 8,
              totalTokens: 18
            }
          };
        })
      }))
    }
  };
});

describe('与外部API集成测试 (IT-A-006)', () => {
  let agent: Agent;
  
  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();
    
    // 模拟成功响应
    mockSuccessResponse();
    
    // 配置环境变量
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    // 基本配置
    const config: AgentFactoryConfig = {
      id: 'api-test-agent',
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
  
  afterEach(() => {
    // 清理环境变量
    delete process.env.OPENAI_API_KEY;
  });
  
  it('应该能成功调用模拟的外部API', async () => {
    const result = await agent.execute({ 
      text: 'Hello, API',
      sessionId: 'api-session'
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    // AgentResult 中包含操作结果
    if (result.success) {
      expect(result.sessionId).toBeDefined();
    }
  });
  
  it('应该能以流式模式成功调用模拟的外部API', async () => {
    const generator = agent.executeStream({ 
      text: 'Hello, Streaming API',
      sessionId: 'stream-session'
    });
    
    let responses = [];
    for await (const response of generator) {
      responses.push(response);
    }
    
    expect(responses.length).toBeGreaterThan(0);
    expect(responses[0].text).toBeDefined();
  });
}); 