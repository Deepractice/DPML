/**
 * LLM工厂单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createClient } from '../../../../core/llm/llmFactory';
import { OpenAIClient } from '../../../../core/llm/OpenAIClient';
import { AgentError, AgentErrorType } from '../../../../types';

// 模拟OpenAIClient
vi.mock('../../../../core/llm/OpenAIClient', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    sendMessages: vi.fn()
  }))
}));

describe('UT-LLMFact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('UT-LLMFact-01: createClient应为OpenAI配置创建OpenAIClient', () => {
    // 准备
    const config = {
      apiType: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test123'
    };

    // 执行
    const client = createClient(config);

    // 验证
    expect(OpenAIClient).toHaveBeenCalledWith(config);
    expect(client).toBeDefined();
  });

  test('UT-LLMFact-02: createClient应忽略apiType大小写', () => {
    // 准备
    const config = {
      apiType: 'OpenAI', // 首字母大写
      model: 'gpt-4',
      apiKey: 'sk-test123'
    };

    // 执行
    const client = createClient(config);

    // 验证
    expect(OpenAIClient).toHaveBeenCalledWith(config);
    expect(client).toBeDefined();
  });

  test('UT-LLMFact-03: createClient应对不支持的API类型抛出错误', () => {
    // 准备
    const config = {
      apiType: 'unknown',
      model: 'unknown-model',
      apiKey: 'test-key'
    };

    // 执行和验证
    expect(() => createClient(config)).toThrow(AgentError);
    expect(() => createClient(config)).toThrow('不支持的API类型');

    try {
      createClient(config);
    } catch (error) {
      expect(error).toBeInstanceOf(AgentError);
      const agentError = error as AgentError;

      expect(agentError.type).toBe(AgentErrorType.CONFIG);
      expect(agentError.code).toBe('UNSUPPORTED_LLM_TYPE');
    }
  });
});
