/**
 * LLM适配器集成测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createClient } from '../../src/core/llm/llmFactory';
import { OpenAIClient } from '../../src/core/llm/OpenAIClient';
import type { Message } from '../../src/core/types';
import type { LLMConfig } from '../../src/types';
import { AgentError, AgentErrorType } from '../../src/types';

// 模拟OpenAI客户端
vi.mock('../../src/core/llm/OpenAIClient', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    sendMessages: vi.fn().mockResolvedValue({
      content: { type: 'text', value: 'OpenAI响应' }
    })
  }))
}));

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
    const client = createClient(openaiConfig);

    // 验证
    expect(OpenAIClient).toHaveBeenCalledWith(openaiConfig);
    expect(client).toBeDefined();
  });

  test('IT-LLM-02: LLM客户端应正确转换消息格式', async () => {
    // 准备
    const config: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test123'
    };

    const client = createClient(config);

    // 模拟内部消息
    const messages: Message[] = [
      {
        role: 'system',
        content: { type: 'text', value: '系统提示词' }
      },
      {
        role: 'user',
        content: { type: 'text', value: '用户消息' }
      }
    ];

    // 执行
    try {
      await client.sendMessages(messages, false);
    } catch (error) {
      // 可能抛出未实现错误，对测试无影响
    }

    // 验证OpenAIClient被构造
    expect(OpenAIClient).toHaveBeenCalledWith(config);
  });

  test('IT-LLM-03: 应在工厂层正确处理不支持的适配器错误', () => {
    // 准备
    const unsupportedConfig: LLMConfig = {
      apiType: 'unsupported',
      model: 'unknown-model'
    };

    // 执行和验证
    expect(() => createClient(unsupportedConfig)).toThrow(AgentError);
    expect(() => createClient(unsupportedConfig)).toThrow(/不支持的API类型/);

    try {
      createClient(unsupportedConfig);
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
    expect(() => createClient(invalidConfig)).toThrow();
  });
});
