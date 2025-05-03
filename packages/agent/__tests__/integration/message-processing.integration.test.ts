/**
 * 消息处理流程集成测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import type { AgentConfig, ChatOutput } from '../../src/types';
import type { Message } from '../../src/core/types';

// 存储消息历史
const messageHistory: Message[] = [];

// 模拟依赖
vi.mock('../../src/core/llm/llmFactory', () => {
  const mockSendMessages = vi.fn();

  return {
    createClient: vi.fn().mockReturnValue({
      sendMessages: mockSendMessages
    })
  };
});

// 模拟会话
vi.mock('../../src/core/session/InMemoryAgentSession', () => ({
  InMemoryAgentSession: vi.fn().mockImplementation(() => ({
    addMessage: vi.fn((message) => {
      messageHistory.push(message);
    }),
    getMessages: vi.fn(() => [...messageHistory])
  }))
}));

// 导入被测试的模块
import { createAgent } from '../../src/api/agent';
import { createClient } from '../../src/core/llm/llmFactory';

describe('IT-Msg', () => {
  let testConfig: AgentConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    // 清空消息历史
    messageHistory.length = 0;

    // 设置默认响应
    const mockLLMClient = createClient({} as any);

    vi.mocked(mockLLMClient.sendMessages).mockResolvedValue({
      content: { type: 'text', value: '模拟响应' }
    } as ChatOutput);

    testConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4',
        apiKey: 'sk-test123'
      },
      prompt: '你是一个AI助手'
    };
  });

  test('IT-Msg-01: 消息流程应从Agent到Runner再到LLM', async () => {
    // 准备
    const agent = createAgent(testConfig);
    const input = '测试消息';

    // 执行
    await agent.chat(input);

    // 获取模拟的LLM客户端
    const mockLLMClient = createClient({} as any);

    // 验证消息流
    expect(mockLLMClient.sendMessages).toHaveBeenCalled();

    // 验证发送的消息内容
    const sentMessages = vi.mocked(mockLLMClient.sendMessages).mock.calls[0][0];

    expect(sentMessages).toContainEqual(
      expect.objectContaining({
        role: 'user',
        content: expect.objectContaining({
          type: 'text',
          value: input
        })
      })
    );
  });

  test('IT-Msg-02: 文本消息应被标准化为ChatInput', async () => {
    // 准备
    const agent = createAgent(testConfig);
    const input = '文本输入';

    // 执行
    await agent.chat(input);

    // 获取模拟的LLM客户端
    const mockLLMClient = createClient({} as any);

    // 验证标准化
    expect(mockLLMClient.sendMessages).toHaveBeenCalled();

    // 检查用户消息格式
    const sentMessages = vi.mocked(mockLLMClient.sendMessages).mock.calls[0][0];
    const userMessages = sentMessages.filter(msg => msg.role === 'user');

    expect(userMessages[0].content).toEqual({ type: 'text', value: input });
  });

  test('IT-Msg-03: 消息应被添加到会话历史', async () => {
    // 准备
    const agent = createAgent(testConfig);

    // 执行第一次对话
    await agent.chat('第一条消息');

    // 验证消息被添加到历史
    expect(messageHistory.length).toBe(1);
    expect(messageHistory[0]).toEqual({
      role: 'user',
      content: { type: 'text', value: '第一条消息' }
    });

    // 添加助手响应到历史
    messageHistory.push({
      role: 'assistant',
      content: { type: 'text', value: '模拟响应' }
    });

    // 执行第二次对话
    await agent.chat('第二条消息');

    // 验证第二条消息被添加，而且历史消息被包含在发送的消息中
    expect(messageHistory.length).toBe(3);

    // 获取模拟的LLM客户端
    const mockLLMClient = createClient({} as any);

    // 第二次调用sendMessages应该包含了历史消息
    const secondCallMessages = vi.mocked(mockLLMClient.sendMessages).mock.calls[1][0];

    expect(secondCallMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: expect.objectContaining({ value: '第一条消息' })
        }),
        expect.objectContaining({
          role: 'assistant',
          content: expect.objectContaining({ value: '模拟响应' })
        }),
        expect.objectContaining({
          role: 'user',
          content: expect.objectContaining({ value: '第二条消息' })
        })
      ])
    );
  });

  test('IT-Msg-04: 返回的LLM响应应提取文本内容', async () => {
    // 准备
    const agent = createAgent(testConfig);

    // 获取模拟的LLM客户端
    const mockLLMClient = createClient({} as any);

    // 设置LLM响应
    vi.mocked(mockLLMClient.sendMessages).mockResolvedValue({
      content: { type: 'text', value: '这是LLM返回的响应' }
    } as ChatOutput);

    // 执行
    const response = await agent.chat('提取响应测试');

    // 验证返回的内容被提取为文本
    expect(response).toBe('这是LLM返回的响应');
  });

  test('IT-Msg-05: 流式消息应正确处理', async () => {
    // 准备
    const agent = createAgent(testConfig);

    // 获取模拟的LLM客户端
    const mockLLMClient = createClient({} as any);

    // 模拟流式响应
    const streamResponse = {
      [Symbol.asyncIterator]: async function* () {
        yield { content: { type: 'text', value: '流式块1' } } as ChatOutput;
        yield { content: { type: 'text', value: '流式块2' } } as ChatOutput;
      }
    };

    vi.mocked(mockLLMClient.sendMessages).mockResolvedValue(streamResponse as any);

    // 执行
    const stream = agent.chatStream('流式测试');

    // 验证stream是AsyncIterable
    expect(stream[Symbol.asyncIterator]).toBeDefined();

    // 收集流式块
    const chunks: string[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // 验证收到的块
    expect(chunks).toEqual(['流式块1', '流式块2']);
  });

  test('IT-Msg-06: 错误应在各层之间正确传播', async () => {
    // 准备
    const agent = createAgent(testConfig);

    // 获取模拟的LLM客户端
    const mockLLMClient = createClient({} as any);

    // 模拟LLM错误
    const errorMessage = 'LLM服务错误';

    vi.mocked(mockLLMClient.sendMessages).mockRejectedValue(new Error(errorMessage));

    // 执行和验证
    await expect(agent.chat('触发错误测试')).rejects.toThrow();
  });
});
