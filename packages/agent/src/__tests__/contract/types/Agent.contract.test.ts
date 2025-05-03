/**
 * Agent Types契约测试
 *
 * 验证Agent类型的结构稳定性。
 */
import { describe, test, expect } from 'vitest';

import type { Agent, AgentConfig, ChatInput, Content } from '../../../types';
import { AgentError, AgentErrorType } from '../../../types';

describe('CT-Type-Agent', () => {
  test('CT-Type-Agent-01: Agent接口应符合公开契约', () => {
    // 创建符合Agent接口的对象
    const agent: Agent = {
      chat: async (input: string | ChatInput) => 'response',
      chatStream: async function* (input: string | ChatInput) {
        yield 'stream response';
      }
    };

    // 验证接口结构
    expect(agent).toHaveProperty('chat');
    expect(agent).toHaveProperty('chatStream');
    expect(typeof agent.chat).toBe('function');
    expect(typeof agent.chatStream).toBe('function');

    // 验证方法签名能正确工作
    expect(agent.chat('测试')).resolves.toBeDefined();
    expect(agent.chatStream('测试')[Symbol.asyncIterator]).toBeDefined();
  });

  test('CT-Type-Agent-02: AgentConfig类型应符合公开契约', () => {
    // 创建符合AgentConfig类型的对象
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4',
        apiKey: 'test-key',
        apiUrl: 'https://api.example.com'
      },
      prompt: '你是一个AI助手'
    };

    // 验证结构稳定性
    expect(config).toHaveProperty('llm');
    expect(config).toHaveProperty('prompt');
    expect(config.llm).toHaveProperty('apiType');
    expect(config.llm).toHaveProperty('model');

    // 验证可选属性
    const minimalConfig: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '系统提示词'
    };

    // 确保最小配置仍然有效
    expect(minimalConfig).toBeDefined();
  });

  test('CT-Type-Agent-03: ChatInput类型应符合公开契约', () => {
    // 创建文本ChatInput
    const textInput: ChatInput = {
      content: {
        type: 'text',
        value: '测试文本输入'
      }
    };

    // 创建多模态ChatInput
    const multimodalInput: ChatInput = {
      content: [
        {
          type: 'text',
          value: '这是图片分析'
        },
        {
          type: 'image',
          value: new Uint8Array([0, 1, 2, 3]),
          mimeType: 'image/jpeg'
        }
      ]
    };

    // 验证结构
    expect(textInput).toHaveProperty('content');
    expect(multimodalInput).toHaveProperty('content');
    expect(Array.isArray(multimodalInput.content)).toBe(true);

    // 验证类型兼容性
    const inputs: ChatInput[] = [textInput, multimodalInput];

    expect(inputs.length).toBe(2);
  });

  test('CT-Type-Agent-04: Content类型应支持多种内容类型', () => {
    // 文本内容
    const textContent: Content = {
      type: 'text',
      value: '测试文本'
    };

    // 图像内容
    const imageContent: Content = {
      type: 'image',
      value: new Uint8Array([0, 1, 2, 3]),
      mimeType: 'image/jpeg'
    };

    // 内容数组
    const contentArray: Content = [
      { type: 'text', value: '文本部分' },
      { type: 'image', value: new Uint8Array([0, 1, 2, 3]), mimeType: 'image/png' }
    ];

    // 验证类型兼容性
    const contents: Content[] = [textContent, imageContent, contentArray];

    expect(contents.length).toBe(3);

    // 验证类型判断
    if (Array.isArray(contentArray)) {
      expect(contentArray.length).toBe(2);
      expect(contentArray[0].type).toBe('text');
      expect(contentArray[1].type).toBe('image');
    }
  });

  test('CT-Type-Agent-05: AgentError类型应符合公开契约', () => {
    // 创建不同类型的错误
    const configError = new AgentError('配置错误', AgentErrorType.CONFIG);
    const serviceError = new AgentError('服务错误', AgentErrorType.LLM_SERVICE);
    const unknownError = new AgentError('未知错误');

    // 验证错误结构
    expect(configError).toBeInstanceOf(AgentError);
    expect(configError).toBeInstanceOf(Error);
    expect(configError).toHaveProperty('type');
    expect(configError).toHaveProperty('code');
    expect(configError).toHaveProperty('message');

    // 验证类型和默认值
    expect(configError.type).toBe(AgentErrorType.CONFIG);
    expect(serviceError.type).toBe(AgentErrorType.LLM_SERVICE);
    expect(unknownError.type).toBe(AgentErrorType.UNKNOWN);

    // 验证错误继承特性
    const errors: Error[] = [configError, serviceError, unknownError];

    errors.forEach(error => {
      expect(error instanceof Error).toBe(true);
    });
  });
});
