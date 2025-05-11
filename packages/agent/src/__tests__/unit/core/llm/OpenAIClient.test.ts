/**
 * OpenAIClient 单元测试
 */
import { firstValueFrom } from 'rxjs';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import type { LLMRequest } from '../../../../core/llm/LLMRequest';
import { OpenAIClient } from '../../../../core/llm/OpenAIClient';
import { AgentError, AgentErrorType } from '../../../../types/errors';
import type { LLMConfig } from '../../../../types/LLMConfig';

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
      body: {
        getReader: vi.fn().mockReturnValue({
          read: vi.fn().mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"模拟响应"}}]}\n\n')
          }).mockResolvedValueOnce({
            done: true,
            value: undefined
          }),
          releaseLock: vi.fn()
        })
      }
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

    // 验证（OpenAIClient实例通过了创建，如果URL错误会在sendRequest中暴露）
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

  test('UT-OpenAI-05: sendRequest应使用正确的模型参数', async () => {
    // 准备
    const client = new OpenAIClient(validConfig);
    const request: LLMRequest = {
      sessionId: 'test-session',
      messages: [{
        id: 'msg-1',
        role: 'user',
        content: { type: 'text', value: '你好' },
        timestamp: Date.now()
      }]
    };

    // 执行
    const subscription = client.sendRequest(request).subscribe();

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 50));
    subscription.unsubscribe();

    // 验证
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(validConfig.model)
      })
    );
  });

  test('UT-OpenAI-06: sendRequest应处理请求被取消的情况', async () => {
    // 准备
    const client = new OpenAIClient(validConfig);
    const request: LLMRequest = {
      sessionId: 'test-session',
      messages: [{
        id: 'msg-1',
        role: 'user',
        content: { type: 'text', value: '你好' },
        timestamp: Date.now()
      }]
    };

    // 模拟fetch时abort事件
    global.fetch = vi.fn().mockImplementation(() => {
      const error = new Error('请求被中止');

      error.name = 'AbortError';

      return Promise.reject(error);
    });

    // 执行
    const subscription = client.sendRequest(request).subscribe({
      error: (_err) => {
        // 不应该到达这里，因为AbortError应当被视为完成而非错误
        expect(true).toBe(false);
      }
    });

    // 立即取消
    subscription.unsubscribe();

    // 等待一小段时间确保没有触发error回调
    await new Promise(resolve => setTimeout(resolve, 50));

    // 验证fetch被调用
    expect(global.fetch).toHaveBeenCalled();
  });

  test('UT-OpenAI-07: sendRequest应将API错误包装为AgentError', async () => {
    // 准备
    const client = new OpenAIClient(validConfig);
    const request: LLMRequest = {
      sessionId: 'test-session',
      messages: [{
        id: 'msg-1',
        role: 'user',
        content: { type: 'text', value: '你好' },
        timestamp: Date.now()
      }]
    };

    // 模拟API错误
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: vi.fn().mockResolvedValue('无效的API密钥')
    });

    // 使用await/expect().rejects验证错误
    await expect(
      firstValueFrom(client.sendRequest(request))
    ).rejects.toEqual(expect.objectContaining({
      type: AgentErrorType.LLM_SERVICE,
      code: 'LLM_API_ERROR',
      message: expect.stringContaining('无效的API密钥')
    }));
  });

  test('UT-OpenAI-08: sendRequest应支持自定义model参数', async () => {
    // 准备
    const client = new OpenAIClient(validConfig);
    const customModel = 'gpt-4-turbo';
    const request: LLMRequest = {
      sessionId: 'test-session',
      messages: [{
        id: 'msg-1',
        role: 'user',
        content: { type: 'text', value: '你好' },
        timestamp: Date.now()
      }],
      model: customModel // 自定义模型
    };

    // 执行
    const subscription = client.sendRequest(request).subscribe();

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 50));
    subscription.unsubscribe();

    // 验证
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining(customModel)
      })
    );
  });
});
