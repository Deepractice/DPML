/**
 * Agent Service 单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import type { ChatInput } from '../../../types';
import { AgentError, AgentErrorType } from '../../../types';

// 模拟依赖
vi.mock('../../../core/llm/llmFactory', () => {
  const mockLLMClient = { sendMessages: vi.fn() };

  return {
    createClient: vi.fn().mockReturnValue(mockLLMClient)
  };
});

vi.mock('../../../core/AgentRunner', () => {
  const mockSendMessage = vi.fn();

  mockSendMessage.mockImplementation((input, stream) => {
    if (stream) {
      return {
        [Symbol.asyncIterator]: async function* () {
          yield { content: { type: 'text', value: '流式响应1' } };
          yield { content: { type: 'text', value: '流式响应2' } };
        }
      };
    } else {
      return Promise.resolve({ content: { type: 'text', value: '同步响应' } });
    }
  });

  return {
    AgentRunner: vi.fn().mockImplementation(() => ({
      sendMessage: mockSendMessage
    }))
  };
});

vi.mock('../../../core/session/InMemoryAgentSession', () => {
  const mockGetMessages = vi.fn().mockReturnValue([]);
  const mockAddMessage = vi.fn();

  return {
    InMemoryAgentSession: vi.fn().mockImplementation(() => ({
      addMessage: mockAddMessage,
      getMessages: mockGetMessages
    }))
  };
});

// 导入被模拟的模块和被测试的模块
import { AgentRunner } from '../../../core/AgentRunner';
import { createAgent } from '../../../core/agentService';
import { createClient } from '../../../core/llm/llmFactory';
import { InMemoryAgentSession } from '../../../core/session/InMemoryAgentSession';

describe('UT-AgentSvc', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 重置默认模拟行为
    const agentRunnerInstance = new (AgentRunner as any)();

    agentRunnerInstance.sendMessage.mockImplementation((input, stream) => {
      if (stream) {
        return {
          [Symbol.asyncIterator]: async function* () {
            yield { content: { type: 'text', value: '流式响应1' } };
            yield { content: { type: 'text', value: '流式响应2' } };
          }
        };
      } else {
        return Promise.resolve({ content: { type: 'text', value: '同步响应' } });
      }
    });
  });

  test('UT-AgentSvc-01: createAgent应创建有效的Agent实例', () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };

    // 执行
    const agent = createAgent(config);

    // 验证
    expect(createClient).toHaveBeenCalledWith(config.llm);
    expect(InMemoryAgentSession).toHaveBeenCalled();
    expect(AgentRunner).toHaveBeenCalledWith(config, expect.anything(), expect.anything());
    expect(agent).toHaveProperty('chat');
    expect(agent).toHaveProperty('chatStream');
  });

  test('UT-AgentSvc-02: createAgent应当传递正确配置给LLM客户端', () => {
    // 准备
    const config = {
      llm: {
        apiType: 'anthropic',
        model: 'claude-3',
        apiKey: 'test-key',
        apiUrl: 'https://api.example.com'
      },
      prompt: '测试提示词'
    };

    // 执行
    createAgent(config);

    // 验证
    expect(createClient).toHaveBeenCalledWith(config.llm);
  });

  test('UT-AgentSvc-03: handleChat应正确处理文本输入', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);

    // 获取模拟的AgentRunner实例
    const agentRunnerInstance = new (AgentRunner as any)();

    // 执行
    const response = await agent.chat('测试文本输入');

    // 验证
    expect(response).toBe('同步响应');
    expect(agentRunnerInstance.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          type: 'text',
          value: '测试文本输入'
        })
      }),
      false
    );
  });

  test('UT-AgentSvc-04: handleChat应正确处理ChatInput对象', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);
    const chatInput: ChatInput = {
      content: {
        type: 'text',
        value: '测试ChatInput'
      }
    };

    // 获取模拟的AgentRunner实例
    const agentRunnerInstance = new (AgentRunner as any)();

    // 执行
    const response = await agent.chat(chatInput);

    // 验证
    expect(response).toBe('同步响应');
    expect(agentRunnerInstance.sendMessage).toHaveBeenCalledWith(chatInput, false);
  });

  test('UT-AgentSvc-05: handleChatStream应返回有效的AsyncIterable', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);

    // 获取模拟的AgentRunner实例
    const agentRunnerInstance = new (AgentRunner as any)();

    // 执行
    const stream = agent.chatStream('测试文本输入');

    // 验证
    expect(stream[Symbol.asyncIterator]).toBeDefined();

    // 收集流式响应
    const chunks: string[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['流式响应1', '流式响应2']);
    expect(agentRunnerInstance.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          type: 'text',
          value: '测试文本输入'
        })
      }),
      true
    );
  });

  test('UT-AgentSvc-06: handleChat应处理底层错误并转换为AgentError', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);
    const originalError = new Error('API错误');

    // 获取模拟的AgentRunner实例并直接替换实现
    const agentRunnerInstance = new (AgentRunner as any)();

    // 完全重新设置模拟以确保错误正确抛出
    vi.mocked(agentRunnerInstance.sendMessage).mockImplementation(() => {
      throw originalError;
    });

    // 验证
    await expect(agent.chat('测试文本')).rejects.toThrow(AgentError);

    // 重置模拟以测试后续断言
    vi.mocked(agentRunnerInstance.sendMessage).mockImplementation(() => {
      throw originalError;
    });

    try {
      await agent.chat('测试文本');
    } catch (error) {
      expect(error).toBeInstanceOf(AgentError);
      expect(error).toMatchObject({
        type: AgentErrorType.UNKNOWN,
        code: 'CHAT_PROCESSING_ERROR'
      });
    }
  });

  test('UT-AgentSvc-07: normalizeChatInput应将字符串转换为ChatInput', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);

    // 获取模拟的AgentRunner实例
    const agentRunnerInstance = new (AgentRunner as any)();

    // 执行
    await agent.chat('测试文本');

    // 验证转换后的格式
    expect(agentRunnerInstance.sendMessage).toHaveBeenCalledWith(
      {
        content: {
          type: 'text',
          value: '测试文本'
        }
      },
      false
    );
  });

  test('UT-AgentSvc-08: extractTextFromContent应从内容中提取文本', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);

    // 获取模拟的AgentRunner实例
    const agentRunnerInstance = new (AgentRunner as any)();

    // 模拟不同的响应内容类型
    agentRunnerInstance.sendMessage.mockResolvedValueOnce({
      content: [
        { type: 'image', value: new Uint8Array([1, 2, 3]) },
        { type: 'text', value: '文本内容' }
      ]
    });

    // 执行：数组内容
    const arrayResponse = await agent.chat('测试');

    expect(arrayResponse).toBe('文本内容');

    // 模拟非文本单一内容
    agentRunnerInstance.sendMessage.mockResolvedValueOnce({
      content: { type: 'image', value: new Uint8Array([1, 2, 3]) }
    });

    // 执行：非文本内容
    const nonTextResponse = await agent.chat('测试');

    expect(nonTextResponse).toBe('');
  });
});
