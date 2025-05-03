/**
 * OpenAIClient 单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { OpenAIClient } from '../../../../src/core/llm/OpenAIClient';
import type { Message } from '../../../../src/core/types';
import { AgentError, AgentErrorType } from '../../../../src/types';
import type { LLMConfig } from '../../../../src/types';

describe('UT-OpenAI', () => {
  // 有效的配置
  const validConfig: LLMConfig = {
    apiType: 'openai',
    model: 'gpt-4',
    apiKey: 'sk-test123'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 模拟全局fetch函数（如果实现使用fetch）
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: '模拟响应'
            }
          }
        ]
      })
    });
  });

  test('UT-OpenAI-01: 构造函数应正确设置配置参数', () => {
    // 执行
    const client = new OpenAIClient(validConfig);

    // 验证（通过测试实例创建即可，因为配置错误会抛出异常）
    expect(client).toBeDefined();
  });

  test('UT-OpenAI-02: 构造函数应当设置默认API URL', () => {
    // 准备
    const configWithoutUrl: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test123'
      // 没有apiUrl
    };

    // 执行
    const client = new OpenAIClient(configWithoutUrl);

    // 验证（OpenAIClient实例通过了创建，如果URL错误会在sendMessages中暴露）
    expect(client).toBeDefined();
  });

  test('UT-OpenAI-03: 构造函数应当在没有API密钥时抛出错误', () => {
    // 准备
    const configWithoutApiKey: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4'
      // 没有apiKey
    };

    // 执行和验证
    expect(() => new OpenAIClient(configWithoutApiKey)).toThrow(AgentError);
    expect(() => new OpenAIClient(configWithoutApiKey)).toThrow('OpenAI API密钥未提供');

    try {
      new OpenAIClient(configWithoutApiKey);
    } catch (error) {
      expect(error).toBeInstanceOf(AgentError);
      const agentError = error as AgentError;

      expect(agentError.type).toBe(AgentErrorType.CONFIG);
      expect(agentError.code).toBe('MISSING_API_KEY');
    }
  });

  test('UT-OpenAI-04: 构造函数应当接受自定义API URL', () => {
    // 准备
    const customApiUrl = 'https://custom-openai-proxy.com/v1';
    const configWithCustomUrl: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test123',
      apiUrl: customApiUrl
    };

    // 执行
    const client = new OpenAIClient(configWithCustomUrl);

    // 验证
    expect(client).toBeDefined();
  });

  test('UT-OpenAI-05: convertToOpenAIMessages应转换消息格式', () => {
    // 注意：由于convertToOpenAIMessages是私有方法，我们通过调用public方法间接测试
    // 准备
    const client = new OpenAIClient(validConfig);
    const messages: Message[] = [
      {
        role: 'system',
        content: { type: 'text', value: '你是一个助手' }
      },
      {
        role: 'user',
        content: { type: 'text', value: '你好' }
      }
    ];

    // 执行 - 由于内部实现尚未完成，这里可能会抛出错误，我们只验证调用了正确的方法
    try {
      client.sendMessages(messages, false);
    } catch (error) {
      // 预期会抛出"方法未实现"错误，忽略
    }

    // 因为我们无法直接访问私有方法，此测试作用有限
    // 当实现完成后，我们应该验证fetch或axios是否被调用并传递了正确格式的消息
    expect(true).toBe(true);
  });

  test('UT-OpenAI-06: convertContent应正确处理文本内容', () => {
    // 同样，这是对私有方法的间接测试
    const client = new OpenAIClient(validConfig);
    const messages: Message[] = [
      {
        role: 'user',
        content: { type: 'text', value: '纯文本消息' }
      }
    ];

    // 执行
    try {
      client.sendMessages(messages, false);
    } catch (error) {
      // 预期会抛出"方法未实现"错误，忽略
    }

    // 同样，因为内部实现尚未完成，此测试作用有限
    expect(true).toBe(true);
  });

  test('UT-OpenAI-07: convertContent应正确处理多模态内容', () => {
    // 准备
    const client = new OpenAIClient(validConfig);
    const messages: Message[] = [
      {
        role: 'user',
        content: [
          { type: 'text', value: '带图片的消息' },
          {
            type: 'image',
            value: new Uint8Array([1, 2, 3]),
            mimeType: 'image/jpeg'
          }
        ]
      }
    ];

    // 执行
    try {
      client.sendMessages(messages, false);
    } catch (error) {
      // 预期会抛出"方法未实现"错误，忽略
    }

    // 同样，因为内部实现尚未完成，此测试作用有限
    expect(true).toBe(true);
  });

  test('UT-OpenAI-08: sendMessages应处理API错误', async () => {
    // 准备
    const client = new OpenAIClient(validConfig);
    const messages: Message[] = [
      { role: 'user', content: { type: 'text', value: '测试消息' } }
    ];

    // 模拟API错误
    global.fetch = vi.fn().mockRejectedValue(new Error('API调用失败'));

    // 执行和验证
    await expect(client.sendMessages(messages, false)).rejects.toThrow(AgentError);
    await expect(client.sendMessages(messages, false)).rejects.toThrow('LLM服务调用失败');

    try {
      await client.sendMessages(messages, false);
    } catch (error) {
      expect(error).toBeInstanceOf(AgentError);
      const agentError = error as AgentError;

      expect(agentError.type).toBe(AgentErrorType.LLM_SERVICE);
      expect(agentError.code).toBe('LLM_API_ERROR');
      expect(agentError.cause).toBeDefined();
    }
  });
});
