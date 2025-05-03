/**
 * AgentRunner 单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { AgentRunner } from '../../../src/core/AgentRunner';
import type { LLMClient } from '../../../src/core/llm/LLMClient';
import type { AgentSession } from '../../../src/core/session/AgentSession';
import type { Message } from '../../../src/core/types';
import { AgentError, AgentErrorType } from '../../../src/types';
import type { ChatInput } from '../../../src/types';

describe('UT-Runner', () => {
  // 模拟依赖
  const mockSendMessages = vi.fn();
  const mockAddMessage = vi.fn();
  const mockGetMessages = vi.fn();

  // 创建模拟对象
  const mockLLMClient: LLMClient = {
    sendMessages: mockSendMessages
  };

  const mockSession: AgentSession = {
    addMessage: mockAddMessage,
    getMessages: mockGetMessages
  };

  const testConfig = {
    llm: {
      apiType: 'openai',
      model: 'gpt-4'
    },
    prompt: '你是一个AI助手'
  };

  let runner: AgentRunner;

  beforeEach(() => {
    vi.resetAllMocks();

    // 设置默认返回值
    mockGetMessages.mockReturnValue([]);
    mockSendMessages.mockResolvedValue({
      content: { type: 'text' as const, value: '模拟响应' }
    });

    // 创建测试实例
    runner = new AgentRunner(testConfig, mockLLMClient, mockSession);
  });

  test('UT-Runner-01: sendMessage应处理同步消息', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 执行
    const result = await runner.sendMessage(input, false);

    // 验证
    expect(result).toEqual({
      content: { type: 'text', value: '模拟响应' }
    });
    expect(mockSendMessages).toHaveBeenCalledWith(expect.any(Array), false);
  });

  test('UT-Runner-02: sendMessage应处理流式消息', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 模拟流式响应
    const mockStreamResponse = {
      [Symbol.asyncIterator]: async function* () {
        yield { content: { type: 'text' as const, value: '流式块1' } };
        yield { content: { type: 'text' as const, value: '流式块2' } };
      }
    };

    mockSendMessages.mockResolvedValue(mockStreamResponse);

    // 执行
    const result = await runner.sendMessage(input, true);

    // 验证
    expect(result).toBe(mockStreamResponse);
    expect(mockSendMessages).toHaveBeenCalledWith(expect.any(Array), true);
  });

  test('UT-Runner-03: sendMessage应将用户消息添加到会话', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证
    expect(mockAddMessage).toHaveBeenCalledWith({
      role: 'user',
      content: input.content
    });
  });

  test('UT-Runner-04: prepareMessages应添加系统提示词', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证系统提示词被添加
    expect(mockSendMessages).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'system',
          content: expect.objectContaining({
            type: 'text',
            value: testConfig.prompt
          })
        })
      ]),
      false
    );
  });

  test('UT-Runner-05: prepareMessages应包含历史消息', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 模拟历史消息
    const historyMessages: Message[] = [
      { role: 'user', content: { type: 'text' as const, value: '历史消息1' } },
      { role: 'assistant', content: { type: 'text' as const, value: '历史回复1' } }
    ];

    mockGetMessages.mockReturnValue(historyMessages);

    // 执行
    await runner.sendMessage(input, false);

    // 验证历史消息被添加到发送列表
    expect(mockSendMessages).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: expect.objectContaining({
            value: '历史消息1'
          })
        }),
        expect.objectContaining({
          role: 'assistant',
          content: expect.objectContaining({
            value: '历史回复1'
          })
        })
      ]),
      false
    );
  });

  test('UT-Runner-06: sendMessage应处理LLMClient错误', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };
    const errorMessage = 'LLM API错误';
    const originalError = new Error(errorMessage);

    // 模拟错误
    mockSendMessages.mockRejectedValue(originalError);

    // 执行和验证
    await expect(runner.sendMessage(input, false)).rejects.toThrow(originalError);
  });

  test('UT-Runner-07: sendMessage应处理并适当封装网络错误', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };
    const networkError = new Error('网络连接失败');

    networkError.name = 'NetworkError';

    // 模拟网络错误
    mockSendMessages.mockRejectedValue(networkError);

    // 执行和验证
    await expect(runner.sendMessage(input, false)).rejects.toThrow(networkError);
  });

  test('UT-Runner-08: sendMessage应处理API限流错误', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };
    const rateLimitError = new Error('超出API调用限制');

    // 模拟API限流错误
    mockSendMessages.mockRejectedValue(rateLimitError);

    // 执行和验证
    await expect(runner.sendMessage(input, false)).rejects.toThrow(rateLimitError);
  });

  test('UT-Runner-09: sendMessage应处理图像内容', async () => {
    // 准备
    const imageData = new Uint8Array([1, 2, 3, 4]); // 模拟图像数据
    const input: ChatInput = {
      content: {
        type: 'image' as const,
        value: imageData,
        mimeType: 'image/jpeg'
      }
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证
    expect(mockAddMessage).toHaveBeenCalledWith({
      role: 'user',
      content: input.content
    });
    expect(mockSendMessages).toHaveBeenCalled();
  });

  test('UT-Runner-10: sendMessage应处理多模态内容数组', async () => {
    // 准备
    const input: ChatInput = {
      content: [
        { type: 'text' as const, value: '这是一张图片:' },
        { type: 'image' as const, value: new Uint8Array([1, 2, 3, 4]), mimeType: 'image/jpeg' }
      ]
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证
    expect(mockAddMessage).toHaveBeenCalledWith({
      role: 'user',
      content: input.content
    });
    expect(mockSendMessages).toHaveBeenCalled();
  });

  test('UT-Runner-11: 当prompt为空字符串时不应添加系统消息', async () => {
    // 准备
    const configWithEmptyPrompt = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '' // 空字符串
    };
    const runner = new AgentRunner(configWithEmptyPrompt, mockLLMClient, mockSession);
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证没有系统消息
    const calls = mockSendMessages.mock.calls;
    const messages = calls[0][0];
    const systemMessages = messages.filter(m => m.role === 'system');

    expect(systemMessages.length).toBe(0);
  });

  test('UT-Runner-12: 连续发送消息时历史记录应累积', async () => {
    // 准备
    const messageHistory: Message[] = [];

    // 模拟addMessage将消息添加到历史
    mockAddMessage.mockImplementation((message: Message) => {
      messageHistory.push(message);
    });

    // 模拟getMessages返回当前历史
    mockGetMessages.mockImplementation(() => {
      return [...messageHistory]; // 返回副本，避免修改
    });

    // 执行第一条消息
    await runner.sendMessage({
      content: { type: 'text' as const, value: '第一条消息' }
    }, false);

    // 模拟助手响应添加到历史
    messageHistory.push({
      role: 'assistant',
      content: { type: 'text' as const, value: '助手回复第一条' }
    });

    // 执行第二条消息
    await runner.sendMessage({
      content: { type: 'text' as const, value: '第二条消息' }
    }, false);

    // 验证第二次调用包含了之前的消息
    const secondCallMessages = mockSendMessages.mock.calls[1][0];

    expect(secondCallMessages.length).toBeGreaterThan(1);
    expect(secondCallMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: expect.objectContaining({ value: '第一条消息' })
        }),
        expect.objectContaining({
          role: 'assistant',
          content: expect.objectContaining({ value: '助手回复第一条' })
        })
      ])
    );
  });

  test('UT-Runner-13: 构造函数应正确初始化配置', () => {
    // 准备
    const customConfig = {
      llm: {
        apiType: 'anthropic',
        model: 'claude-3'
      },
      prompt: '你是一个专业助手'
    };

    // 执行
    const customRunner = new AgentRunner(customConfig, mockLLMClient, mockSession);

    // 验证
    // 使用sendMessage触发内部调用，检查配置是否被正确使用
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    customRunner.sendMessage(input, false);

    // 验证系统提示词使用了自定义配置
    expect(mockSendMessages).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'system',
          content: expect.objectContaining({
            value: customConfig.prompt
          })
        })
      ]),
      false
    );
  });

  test('UT-Runner-14: sendMessage应处理音频内容', async () => {
    // 准备
    const audioData = new Uint8Array([10, 20, 30, 40]); // 模拟音频数据
    const input: ChatInput = {
      content: {
        type: 'audio' as const,
        value: audioData,
        mimeType: 'audio/mp3'
      }
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证
    expect(mockAddMessage).toHaveBeenCalledWith({
      role: 'user',
      content: input.content
    });
    expect(mockSendMessages).toHaveBeenCalled();
  });

  test('UT-Runner-15: sendMessage应处理文件内容', async () => {
    // 准备
    const fileData = new Uint8Array([5, 10, 15, 20]); // 模拟文件数据
    const input: ChatInput = {
      content: {
        type: 'file' as const,
        value: fileData,
        mimeType: 'application/pdf'
      }
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证
    expect(mockAddMessage).toHaveBeenCalledWith({
      role: 'user',
      content: input.content
    });
    expect(mockSendMessages).toHaveBeenCalled();
  });

  test('UT-Runner-16: sendMessage应处理视频内容', async () => {
    // 准备
    const videoData = new Uint8Array([25, 35, 45, 55]); // 模拟视频数据
    const input: ChatInput = {
      content: {
        type: 'video' as const,
        value: videoData,
        mimeType: 'video/mp4'
      }
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证
    expect(mockAddMessage).toHaveBeenCalledWith({
      role: 'user',
      content: input.content
    });
    expect(mockSendMessages).toHaveBeenCalled();
  });

  test('UT-Runner-17: 空历史记录时应只发送系统消息和当前用户消息', async () => {
    // 准备
    mockGetMessages.mockReturnValue([
      { role: 'user', content: { type: 'text' as const, value: '测试消息' } }
    ]); // 模拟会话中已添加了当前用户消息

    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 执行
    await runner.sendMessage(input, false);

    // 验证
    expect(mockSendMessages).toHaveBeenCalledWith(
      [
        {
          role: 'system',
          content: {
            type: 'text',
            value: testConfig.prompt
          }
        },
        {
          role: 'user',
          content: {
            type: 'text',
            value: '测试消息'
          }
        }
      ],
      false
    );

    // 确认只发送了系统消息和用户消息
    const messages = mockSendMessages.mock.calls[0][0];

    expect(messages.length).toBe(2);
  });

  test('UT-Runner-18: LLMClient返回不同类型内容时应正确处理', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 模拟LLM返回图像内容
    const imageResponse = {
      content: {
        type: 'image' as const,
        value: new Uint8Array([1, 2, 3, 4]),
        mimeType: 'image/png'
      }
    };

    mockSendMessages.mockResolvedValue(imageResponse);

    // 执行
    const result = await runner.sendMessage(input, false);

    // 验证
    expect(result).toEqual(imageResponse);
  });

  test('UT-Runner-19: LLMClient抛出特定错误类型时应正确传递', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 创建特定错误
    const specificError = new AgentError(
      '模型调用失败',
      AgentErrorType.LLM_SERVICE,
      'MODEL_ERROR'
    );

    // 模拟错误
    mockSendMessages.mockRejectedValue(specificError);

    // 执行和验证
    await expect(runner.sendMessage(input, false)).rejects.toThrow(specificError);
    await expect(runner.sendMessage(input, false)).rejects.toHaveProperty('type', AgentErrorType.LLM_SERVICE);
    await expect(runner.sendMessage(input, false)).rejects.toHaveProperty('code', 'MODEL_ERROR');
  });

  test('UT-Runner-20: prepareMessages应按正确顺序排列消息', async () => {
    // 准备
    const input: ChatInput = {
      content: { type: 'text' as const, value: '测试消息' }
    };

    // 模拟历史消息（包括当前消息，因为addMessage会先执行）
    const historyMessages: Message[] = [
      { role: 'user', content: { type: 'text' as const, value: '历史消息1' } },
      { role: 'assistant', content: { type: 'text' as const, value: '历史回复1' } },
      { role: 'user', content: { type: 'text' as const, value: '历史消息2' } },
      { role: 'assistant', content: { type: 'text' as const, value: '历史回复2' } },
      { role: 'user', content: { type: 'text' as const, value: '测试消息' } } // 当前消息
    ];

    mockGetMessages.mockReturnValue(historyMessages);

    // 执行
    await runner.sendMessage(input, false);

    // 验证消息顺序
    const messages = mockSendMessages.mock.calls[0][0];

    // 系统消息应该在第一位
    expect(messages[0].role).toBe('system');

    // 历史消息应该按时间顺序排列
    expect(messages[1].role).toBe('user');
    expect(messages[1].content.value).toBe('历史消息1');

    expect(messages[2].role).toBe('assistant');
    expect(messages[2].content.value).toBe('历史回复1');

    expect(messages[3].role).toBe('user');
    expect(messages[3].content.value).toBe('历史消息2');

    expect(messages[4].role).toBe('assistant');
    expect(messages[4].content.value).toBe('历史回复2');

    // 当前用户消息应该在最后
    expect(messages[5].role).toBe('user');
    expect(messages[5].content.value).toBe('测试消息');
  });
});
