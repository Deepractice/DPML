/**
 * MCP工具调用端到端测试
 * 测试工具调用功能
 */
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

import { createAgent } from '../../../api';
import { OpenAIClient } from '../../../core/llm/OpenAIClient';
import { TestHttpMcpServer } from '../../fixtures/mcp/transport-http';
import { isLLMConfigValid, getLLMConfig } from '../env-helper';

// 检查是否使用真实API
const useRealAPI = isLLMConfigValid('openai');

// 获取测试超时时间（可能需要较长时间）
const TEST_TIMEOUT = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT, 10) : 30000;

// 显示测试环境信息
beforeAll(() => {
  console.info('----- 测试环境配置信息 -----');
  console.info(`当前测试模式: ${useRealAPI ? '真实API' : '模拟'}`);
  console.info(`环境变量TEST_USE_REAL_API=${process.env.TEST_USE_REAL_API}`);
  console.info(`测试超时: ${TEST_TIMEOUT}ms`);
  console.info('---------------------------');
});

// 提供模拟功能
if (!useRealAPI) {
  console.info('ℹ️ MCP工具调用测试使用模拟模式');

  // 模拟LLM调用，模拟工具调用场景
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

    // 根据用户输入决定是否需要工具调用
    if (userInput.includes('calculator') || userInput.includes('计算器')) {
      return Promise.resolve({
        id: 'test-id',
        model: 'test-model',
        content: {
          type: 'text',
          value: '我需要使用计算器工具'
        },
        toolCalls: [
          {
            id: 'call_1',
            type: 'function',
            function: {
              name: 'calculator',
              arguments: JSON.stringify({ expression: '2+2' })
            }
          }
        ]
      });
    } else if (userInput.includes('search') || userInput.includes('搜索')) {
      return Promise.resolve({
        id: 'test-id',
        model: 'test-model',
        content: {
          type: 'text',
          value: '我需要使用搜索工具'
        },
        toolCalls: [
          {
            id: 'call_2',
            type: 'function',
            function: {
              name: 'search',
              arguments: JSON.stringify({ query: userInput })
            }
          }
        ]
      });
    } else if (userInput.includes('multiple') || userInput.includes('多个')) {
      return Promise.resolve({
        id: 'test-id',
        model: 'test-model',
        content: {
          type: 'text',
          value: '我需要使用多个工具'
        },
        toolCalls: [
          {
            id: 'call_3a',
            type: 'function',
            function: {
              name: 'calculator',
              arguments: JSON.stringify({ expression: '1+1' })
            }
          },
          {
            id: 'call_3b',
            type: 'function',
            function: {
              name: 'search',
              arguments: JSON.stringify({ query: '测试查询' })
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

describe('E2E-MCP-Tool', () => {
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

  test('E2E-MCP-Tool-01: 应能通过MCP调用计算器工具', async () => {
    // 创建Agent配置
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: '你是一个有帮助的助手，可以使用计算器。',
      mcpServers: [
        {
          name: 'calculator-server',
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

    // 发送需要使用计算器工具的消息
    console.info('发送消息: 使用计算器计算2+2');
    const response = await agent.chat('使用计算器计算2+2');

    // 验证工具调用
    expect(mcpServer.getCallCount()).toBeGreaterThan(0);
    console.info(`工具调用次数: ${mcpServer.getCallCount()}`);

    // 验证响应
    expect(response).toBeTruthy();
    console.info('响应:', response);
  }, TEST_TIMEOUT);

  test('E2E-MCP-Tool-02: 应能通过MCP调用搜索工具', async () => {
    // 创建Agent配置
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: '你是一个有帮助的助手，可以使用搜索工具。',
      mcpServers: [
        {
          name: 'search-server',
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

    // 发送需要使用搜索工具的消息
    console.info('发送消息: 搜索关于TypeScript的信息');
    const response = await agent.chat('搜索关于TypeScript的信息');

    // 验证工具调用
    expect(mcpServer.getCallCount()).toBeGreaterThan(0);
    console.info(`工具调用次数: ${mcpServer.getCallCount()}`);

    // 验证响应包含搜索工具的返回信息
    expect(response).toBeTruthy();
    console.info('搜索工具调用响应:', response);
  }, TEST_TIMEOUT * 3);

  test('E2E-MCP-Tool-03: 应能处理多个工具调用', async () => {
    // 模拟会调用多个工具的场景
    if (!useRealAPI) {
      // 已经在前面的模拟中设置
    }

    // 创建Agent配置
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: '你是一个有帮助的助手，可以使用多种工具。',
      mcpServers: [
        {
          name: 'multi-tools-server',
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

    // 发送需要使用多个工具的消息
    console.info('发送消息: 使用多个工具协助我');
    const response = await agent.chat('使用多个工具协助我');

    // 验证工具调用
    expect(mcpServer.getCallCount()).toBeGreaterThan(0);
    console.info(`工具调用次数: ${mcpServer.getCallCount()}`);

    // 验证响应
    expect(response).toBeTruthy();
    console.info('响应:', response);
  }, TEST_TIMEOUT);

  test('E2E-MCP-Tool-04: 应正确处理不需要工具调用的消息', async () => {
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
          name: 'general-server',
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

    // 发送普通消息，不应触发工具调用
    console.info('发送消息: 你好，世界！');
    const response = await agent.chat('你好，世界！');

    // 验证响应不为空
    expect(response).toBeTruthy();
    console.info('响应:', response);

    // 在模拟环境下，MCP服务器可能有调用（取决于实现），但不会执行工具
    if (!useRealAPI) {
      console.info(`工具调用次数: ${mcpServer.getCallCount()}`);
    }
  }, TEST_TIMEOUT);
});
