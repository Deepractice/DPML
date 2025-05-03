/**
 * Agent配置端到端测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createAgent } from '../../src/api/agent';
import type { AgentConfig } from '../../src/types';
import { AgentError, AgentErrorType } from '../../src/types';

// 模拟依赖
vi.mock('../../src/core/llm/OpenAIClient', () => {
  const mockSendMessages = vi.fn().mockImplementation((messages, stream) => {
    // 查找系统提示
    const systemMessage = messages.find(msg => msg.role === 'system');
    const systemPrompt = systemMessage?.content?.type === 'text'
      ? systemMessage.content.value
      : '';

    // 返回反映系统提示的响应
    return {
      content: {
        type: 'text',
        value: `使用提示词: ${systemPrompt}`
      }
    };
  });

  return {
    OpenAIClient: vi.fn().mockImplementation(() => ({
      sendMessages: mockSendMessages
    }))
  };
});

// 直接模拟llmFactory，不使用importOriginal
vi.mock('../../src/core/llm/llmFactory', () => {
  return {
    createClient: vi.fn().mockImplementation((config) => {
      if (config.apiType === 'unsupported') {
        throw new AgentError(
          `不支持的API类型: ${config.apiType}`,
          AgentErrorType.CONFIG,
          'UNSUPPORTED_LLM_TYPE'
        );
      }

      return {
        sendMessages: vi.fn().mockImplementation((messages, stream) => {
          // 查找系统提示
          const systemMessage = messages.find(msg => msg.role === 'system');
          const systemPrompt = systemMessage?.content?.type === 'text'
            ? systemMessage.content.value
            : '';

          // 返回反映配置的响应
          return {
            content: {
              type: 'text',
              value: `使用API类型: ${config.apiType}, 模型: ${config.model}, 提示词: ${systemPrompt}`
            }
          };
        })
      };
    })
  };
});

describe('E2E-Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('E2E-Config-01: Agent应使用配置的系统提示词', async () => {
    // 准备
    const customPrompt = '你是一个专业的编程助手';
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: customPrompt
    };

    // 执行
    const agent = createAgent(config);
    const response = await agent.chat('测试提示词');

    // 验证响应中包含了配置的提示词
    expect(response).toContain(customPrompt);
  });

  test('E2E-Config-02: Agent应连接配置的LLM服务', async () => {
    // 准备
    const config: AgentConfig = {
      llm: {
        apiType: 'anthropic', // 不同的API类型
        model: 'claude-3',
        apiKey: 'test-key'
      },
      prompt: '测试提示词'
    };

    // 执行
    const agent = createAgent(config);
    const response = await agent.chat('测试API类型');

    // 验证使用了配置的API类型
    expect(response).toContain('API类型: anthropic');
    expect(response).toContain('模型: claude-3');
  });

  test('E2E-Config-03: Agent应使用配置的模型名称', async () => {
    // 准备
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4-turbo', // 特定模型名称
        apiKey: 'test-key'
      },
      prompt: '测试提示词'
    };

    // 执行
    const agent = createAgent(config);
    const response = await agent.chat('测试模型');

    // 验证使用了配置的模型
    expect(response).toContain('模型: gpt-4-turbo');
  });

  test('E2E-Config-04: Agent应验证配置并拒绝无效配置', async () => {
    // 准备
    const invalidConfig = {
      llm: {
        apiType: 'unsupported', // 不支持的API类型
        model: 'unknown-model'
      },
      prompt: '测试提示词'
    } as AgentConfig;

    // 执行和验证
    expect(() => createAgent(invalidConfig)).toThrow(AgentError);
    expect(() => createAgent(invalidConfig)).toThrow(/不支持的API类型/);
  });

  test('E2E-Config-05: 空提示词应被正确处理', async () => {
    // 准备
    const configWithEmptyPrompt: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4',
        apiKey: 'test-key'
      },
      prompt: '' // 空提示词
    };

    // 执行
    const agent = createAgent(configWithEmptyPrompt);
    const response = await agent.chat('测试空提示词');

    // 验证空提示词被正确处理
    expect(response).toContain('提示词:');
  });
});
