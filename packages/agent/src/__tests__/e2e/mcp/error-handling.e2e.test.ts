/**
 * MCP错误处理端到端测试
 * 测试错误处理和容错机制
 */
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createAgent } from '../../../api';
import * as llmFactory from '../../../core/llm/llmFactory';
import { OpenAIClient } from '../../../core/llm/OpenAIClient';
import { TestHttpMcpServer } from '../../fixtures/mcp/transport-http';
import { isLLMConfigValid, getLLMConfig } from '../env-helper';
import http from 'http';
import express from 'express';

// 检查是否使用真实API
const useRealAPI = isLLMConfigValid('openai');

// 获取测试超时时间（可能需要较长时间）
const TEST_TIMEOUT = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT, 10) : 30000;

// 提供模拟功能
if (!useRealAPI) {
  console.info('ℹ️ MCP错误处理测试使用模拟模式');
  
  // 模拟LLM调用
  vi.spyOn(OpenAIClient.prototype, 'sendMessages').mockImplementation((messages) => {
    // 查找用户消息
    const userMessage = messages.find(msg => msg.role === 'user');
    const userContent = userMessage?.content;
    let userInput = '';
    
    // 处理不同类型的content
    if (typeof userContent === 'string') {
      userInput = userContent;
    } else if (Array.isArray(userContent)) {
      userInput = userContent
        .filter(item => item.type === 'text')
        .map(item => item.value)
        .join(' ');
    } else if (userContent && typeof userContent === 'object' && 'value' in userContent) {
      userInput = String(userContent.value || '');
    }
    
    // 根据用户输入决定是否模拟工具调用
    if (userInput.includes('error_test') || userInput.includes('错误测试')) {
      return Promise.resolve({
        id: 'test-id',
        model: 'test-model',
        content: {
          type: 'text',
          value: '我将执行错误测试'
        },
        toolCalls: [
          {
            id: 'call_error',
            type: 'function',
            function: {
              name: 'error_test',
              arguments: JSON.stringify({
                shouldFail: true,
                errorMessage: '这是一个模拟的错误'
              })
            }
          }
        ]
      });
    }
    
    // 默认返回普通文本响应
    return Promise.resolve({
      id: 'test-id',
      model: 'test-model',
      content: {
        type: 'text',
        value: `模拟回复: ${userInput}`
      }
    });
  });
}

// 显示测试环境信息
beforeAll(() => {
  console.info('----- 测试环境配置信息 -----');
  console.info(`当前测试模式: ${useRealAPI ? '真实API' : '模拟'}`);
  console.info(`环境变量TEST_USE_REAL_API=${process.env.TEST_USE_REAL_API}`);
  console.info(`测试超时: ${TEST_TIMEOUT}ms`);
  console.info('---------------------------');
});

// 创建一个失败的MCP服务器，用于测试连接失败场景
function createFailingServer(port: number = 0): Promise<{ server: http.Server; url: string }> {
  return new Promise((resolve) => {
    const app = express();
    const server = http.createServer(app);
    
    // 对所有请求都返回500错误
    app.all('/*path', (req, res) => {
      res.status(500).json({ error: 'Internal Server Error (Test)' });
    });
    
    server.listen(port, () => {
      const address = server.address() as { port: number };
      const url = `http://localhost:${address.port}/mcp`;
      resolve({ server, url });
    });
  });
}

describe('E2E-MCP-Error', () => {
  let mcpServer: TestHttpMcpServer;
  
  beforeAll(async () => {
    mcpServer = new TestHttpMcpServer();
    await mcpServer.start();
    console.info(`MCP服务器URL: ${mcpServer.url}`);
  });
  
  afterAll(async () => {
    await mcpServer.stop();
  });
  
  beforeEach(() => {
    mcpServer.resetCallCount();
    vi.clearAllMocks();
  });

  test('E2E-MCP-Error-01: 应能正确处理工具调用错误', async () => {
    // 创建Agent配置
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: '你是一个有帮助的助手，可以进行错误测试。',
      mcpServers: [
        {
          name: 'error-test',
          type: 'http' as const,
          enabled: true,
          http: {
            url: mcpServer.url
          }
        }
      ]
    };
    
    // 创建Agent
    const agent = createAgent(config);
    
    // 发送触发错误的消息
    console.info('发送消息: 使用error_test工具生成一个错误');
    const response = await agent.chat('使用error_test工具生成一个错误');
    
    // 验证工具调用
    expect(mcpServer.getCallCount()).toBeGreaterThan(0);
    
    // 验证响应包含错误信息或者错误处理结果
    expect(response).not.toBeUndefined();
    expect(response.length).toBeGreaterThan(0);
    console.info('响应:', response);
    // 如果系统设计为将工具错误传递给用户，应该包含错误信息
    if (!useRealAPI) {
      expect(response.includes('错误') || response.includes('error')).toBeTruthy();
    }
  }, TEST_TIMEOUT * 3);

  test('E2E-MCP-Error-02: 在MCP服务器连接失败时应正常降级', async () => {
    // 创建一个总是失败的服务器
    const { server, url } = await createFailingServer();
    
    try {
      // 创建Agent配置
      const config = {
        llm: {
          apiType: 'openai',
          model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
          apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
          apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
        },
        prompt: '你是一个有帮助的助手。',
        mcpServers: [
          {
            name: 'failing-server',
            type: 'http' as const,
            enabled: true,
            http: {
              url: url
            }
          }
        ]
      };
      
      // 创建Agent
      const agent = createAgent(config);
      
      // 发送消息，Agent应该能够降级处理
      const response = await agent.chat('你好，世界！');
      
      // 验证即使MCP服务器失败，Agent仍能回应
      expect(response).not.toBeUndefined();
      expect(response.length).toBeGreaterThan(0);
      console.info('失败服务器场景的响应:', response);
    } finally {
      // 关闭测试服务器
      if (server) server.close();
    }
  }, TEST_TIMEOUT);

  test('E2E-MCP-Error-03: 应能处理无效URL的MCP服务器配置', async () => {
    // 创建Agent配置
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: '你是一个有帮助的助手。',
      mcpServers: [
        {
          name: 'invalid-server',
          type: 'http' as const,
          enabled: true,
          http: {
            url: 'http://invalid-server-url.example'
          }
        }
      ]
    };
    
    // 创建Agent
    const agent = createAgent(config);
    
    // 发送消息，Agent应该能够降级处理
    const response = await agent.chat('你好，这是一个无效URL测试');
    
    // 验证即使MCP服务器URL无效，Agent仍能回应
    expect(response).not.toBeUndefined();
    expect(response.length).toBeGreaterThan(0);
    console.info('无效URL场景的响应:', response);
  }, TEST_TIMEOUT);
  
  test('E2E-MCP-Error-04: 应能处理多服务器场景下部分服务器故障', async () => {
    // 创建一个失败的服务器
    const { server, url } = await createFailingServer();
    
    try {
      // 创建Agent配置
      const config = {
        llm: {
          apiType: 'openai',
          model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
          apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
          apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
        },
        prompt: '你是一个有帮助的助手。',
        mcpServers: [
          {
            name: 'working-server',
            type: 'http' as const,
            enabled: true,
            http: {
              url: mcpServer.url
            }
          },
          {
            name: 'failing-server',
            type: 'http' as const,
            enabled: true,
            http: {
              url: url
            }
          }
        ]
      };
      
      // 创建Agent
      const agent = createAgent(config);
      
      // 发送消息，验证仍能使用正常的服务器
      const response = await agent.chat('请使用可用的工具');
      
      // 验证仍能回应
      expect(response).not.toBeUndefined();
      expect(response.length).toBeGreaterThan(0);
      console.info('部分服务器故障场景的响应:', response);
      
      // 验证正常的服务器被调用
      expect(mcpServer.getCallCount()).toBeGreaterThan(0);
    } finally {
      // 关闭测试服务器
      server.close();
    }
  }, TEST_TIMEOUT);
  
  test('E2E-MCP-Error-05: 应能处理DPML中缺少所有MCP配置的情况', async () => {
    // 创建不包含MCP配置的Agent配置
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: '你是一个有帮助的助手。'
      // 不包含mcpServers
    };
    
    // 创建Agent
    const agent = createAgent(config);
    
    // 发送消息，Agent应该能够正常工作，但不使用MCP
    const response = await agent.chat('你好，这是没有MCP配置的测试');
    
    // 验证Agent仍能正常回应
    expect(response).not.toBeUndefined();
    expect(response.length).toBeGreaterThan(0);
    console.info('无MCP配置场景的响应:', response);
    
    // 验证MCP服务器没有被调用
    expect(mcpServer.getCallCount()).toBe(0);
  }, TEST_TIMEOUT);
}); 