/**
 * LLM适配器集成测试
 *
 * 已更新以适配RxJS架构
 */
import { of } from 'rxjs';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createLLMClient } from '../../core/llm/llmFactory';
import type { LLMRequest } from '../../core/llm/LLMRequest';
import { OpenAIClient } from '../../core/llm/OpenAIClient';
import { AgentError, AgentErrorType } from '../../types/errors';
import type { LLMConfig } from '../../types/LLMConfig';

// 模拟OpenAI客户端
vi.mock('../../core/llm/OpenAIClient', () => {
  return {
    OpenAIClient: vi.fn().mockImplementation(() => ({
      sendRequest: vi.fn().mockReturnValue(of({
        content: { type: 'text', value: 'OpenAI响应' }
      }))
    }))
  };
});

describe('IT-LLM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('IT-LLM-01: 工厂应根据配置创建正确的LLM客户端', () => {
    // 准备
    const openaiConfig: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test123'
    };

    // 执行
    const client = createLLMClient(openaiConfig);

    // 验证
    expect(OpenAIClient).toHaveBeenCalledWith(openaiConfig);
    expect(client).toBeDefined();
  });

  test('IT-LLM-02: LLM客户端应正确转换消息格式', () => {
    // 准备
    const config: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test123'
    };

    const client = createLLMClient(config);

    // 创建测试请求
    const request: LLMRequest = {
      sessionId: 'test-session',
      messages: [
        {
          id: 'msg-1',
          role: 'system',
          content: { type: 'text', value: '系统提示词' },
          timestamp: Date.now()
        },
        {
          id: 'msg-2',
          role: 'user',
          content: { type: 'text', value: '用户消息' },
          timestamp: Date.now()
        }
      ]
    };

    // 执行
    client.sendRequest(request);

    // 验证OpenAIClient被构造并调用
    expect(OpenAIClient).toHaveBeenCalledWith(config);

    // 获取模拟的OpenAIClient实例并验证sendRequest被调用
    const mockInstance = vi.mocked(OpenAIClient).mock.results[0].value;

    expect(mockInstance.sendRequest).toHaveBeenCalled();
  });

  test('IT-LLM-03: 应在工厂层正确处理不支持的适配器错误', () => {
    // 准备
    const unsupportedConfig: LLMConfig = {
      apiType: 'unsupported',
      model: 'unknown-model'
    };

    // 执行和验证
    expect(() => createLLMClient(unsupportedConfig)).toThrow(AgentError);
    expect(() => createLLMClient(unsupportedConfig)).toThrow(/不支持的API类型/);

    try {
      createLLMClient(unsupportedConfig);
    } catch (error) {
      expect(error).toBeInstanceOf(AgentError);
      const agentError = error as AgentError;

      expect(agentError.type).toBe(AgentErrorType.CONFIG);
      expect(agentError.code).toBe('UNSUPPORTED_LLM_TYPE');
    }
  });

  test('IT-LLM-04: 配置不正确的客户端应抛出错误', () => {
    // 准备
    const invalidConfig: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4'
      // 缺少apiKey
    };

    // 执行和验证
    expect(() => createLLMClient(invalidConfig)).toThrow();
  });
});
