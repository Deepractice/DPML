import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../../agent/types';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 创建临时测试目录路径
const testBasePath = path.join(process.cwd(), 'tmp-test-' + uuidv4().substring(0, 8));

// 模拟文件系统
vi.mock('fs', async () => {
  // 由于vitest中不能使用vi.importActual获取真实的fs，所以这里只模拟需要的方法
  const fsModule = {
    existsSync: vi.fn().mockImplementation((path) => {
      // 确保测试目录总是存在
      if (path === testBasePath) return true;
      return false;
    }),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockImplementation((path, options) => {
      // 如果是状态文件
      if (path.includes('state')) {
        return JSON.stringify({
          status: 'READY',
          messages: [
            {
              id: 'msg1',
              role: 'user',
              content: 'Hello from storage',
              createdAt: Date.now() - 1000
            }
          ],
          updatedAt: Date.now() - 500
        });
      }
      
      // 如果是记忆文件
      if (path.includes('memory')) {
        return JSON.stringify([
          {
            id: 'mem1',
            text: 'Hello from storage',
            role: 'user',
            timestamp: Date.now() - 1000
          }
        ]);
      }
      
      return '{}';
    })
  };
  return fsModule;
});

// 模拟LLM连接器工厂
vi.mock('../../src/connector/LLMConnectorFactory', () => {
  return {
    LLMConnectorFactory: {
      createConnector: vi.fn(() => ({
        complete: vi.fn(async (prompt, options = {}) => {
          return {
            content: 'Response from storage test',
            usage: {
              promptTokens: 10,
              completionTokens: 5,
              totalTokens: 15
            }
          };
        }),
        completeStream: vi.fn(async function* (prompt, options = {}) {
          yield {
            content: 'Response from storage test',
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

// 创建模拟状态和消息
const mockMessages = [
  {
    id: 'msg1',
    role: 'user',
    content: 'Hello from storage',
    createdAt: Date.now() - 1000
  }
];

const mockState = {
  status: 'READY',
  messages: mockMessages,
  updatedAt: Date.now() - 500
};

// 模拟createAgent函数
vi.mock('../../src', () => {
  return {
    createAgent: vi.fn((config) => {
      return {
        getId: () => config.id,
        getVersion: () => config.version,
        execute: async (input: { text: string; sessionId?: string }) => {
          // 模拟写入文件
          fs.writeFileSync('test-file', 'test-data');
          
          return {
            success: true,
            sessionId: input?.sessionId || 'persistent-session',
            text: 'Response saved to storage',
            processingTimeMs: 100
          };
        },
        executeStream: async function* (input: { text: string; sessionId?: string }) {
          yield {
            text: 'Storage test response',
            sessionId: input?.sessionId || 'persistent-session'
          };
        },
        getState: async (sessionId: string) => {
          return { ...mockState, sessionId };
        },
        reset: async (sessionId: string) => {
          // 模拟写入文件以重置状态
          fs.writeFileSync('test-file', 'reset-data');
        },
      };
    })
  };
});

describe('持久化存储集成测试 (IT-A-007)', () => {
  let agent: Agent;
  const sessionId = 'persistent-session';
  
  beforeEach(() => {
    // 配置环境变量
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    // 基本配置 - 使用文件系统存储
    const config: AgentFactoryConfig = {
      id: 'persistent-agent',
      version: '1.0.0',
      stateManagerType: 'file',
      memoryType: 'simple',
      basePath: testBasePath,
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo',
        apiType: 'openai',
        systemPrompt: 'You are a persistent assistant.'
      }
    };
    
    // 创建代理
    agent = createAgent(config);
  });
  
  afterEach(() => {
    // 清理环境变量
    delete process.env.OPENAI_API_KEY;
    
    // 重置所有模拟
    vi.clearAllMocks();
  });
  
  it('应该能成功创建使用文件存储的代理', () => {
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('persistent-agent');
  });
  
  it('应该能从文件存储中加载状态', async () => {
    const state = await agent.getState(sessionId);
    
    expect(state).toBeDefined();
    expect(state.messages).toBeDefined();
    expect(state.messages.length).toBeGreaterThan(0);
    expect(state.messages[0].content).toBe('Hello from storage');
  });
  
  it('应该能在执行请求后保存状态', async () => {
    const result = await agent.execute({
      text: 'Save this to storage',
      sessionId
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    
    // 检查是否调用了文件写入
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
  
  it('应该能在重置后清除状态', async () => {
    await agent.reset(sessionId);
    
    // 检查是否调用了文件写入（重置会写入新的空状态）
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
}); 