/**
 * Agent Types契约测试
 *
 * 验证Agent类型的结构稳定性。
 */
import { Observable, of } from 'rxjs';
import { describe, test, expect, vi } from 'vitest';

import type { Agent } from '../../../types/Agent';
import type { AgentConfig } from '../../../types/AgentConfig';
import type { AgentSession } from '../../../types/AgentSession';
import type { ChatInput, ChatOutput } from '../../../types/Chat';
import type { Content } from '../../../types/Content';
import { AgentError, AgentErrorType } from '../../../types/errors';

describe('CT-Type-Agent', () => {
  test('CT-Type-Agent-01: Agent接口应符合公开契约', () => {
    // 创建会话ID
    const sessionId = 'test-session';

    // 创建模拟会话
    const mockSession: AgentSession = {
      id: 'test-session',
      addMessage: vi.fn(),
      updateMessage: vi.fn(),
      getMessages: vi.fn().mockReturnValue([]),
      messages$: of([]),
      clear: vi.fn()
    };

    // 创建符合Agent接口的对象
    const agent: Agent = {
      chat: (sessionId: string, input: string | ChatInput) => {
        return of({
          content: { type: 'text', value: 'response' }
        });
      },
      cancel: (sessionId: string) => { /* 空实现 */ },
      createSession: () => 'new-session',
      getSession: (sessionId: string) => mockSession,
      removeSession: (sessionId: string) => true
    };

    // 验证接口结构
    expect(agent).toHaveProperty('chat');
    expect(agent).toHaveProperty('cancel');
    expect(agent).toHaveProperty('createSession');
    expect(agent).toHaveProperty('getSession');
    expect(agent).toHaveProperty('removeSession');

    expect(typeof agent.chat).toBe('function');
    expect(typeof agent.cancel).toBe('function');
    expect(typeof agent.createSession).toBe('function');
    expect(typeof agent.getSession).toBe('function');
    expect(typeof agent.removeSession).toBe('function');

    // 验证方法签名能正确工作
    const response = agent.chat(sessionId, '测试');

    expect(response).toBeInstanceOf(Observable);

    // 验证会话管理功能
    expect(agent.createSession()).toBe('new-session');
    expect(agent.getSession(sessionId)).toBe(mockSession);
    expect(agent.removeSession(sessionId)).toBe(true);
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

  test('CT-Type-Agent-06: ChatOutput类型应符合公开契约', () => {
    // 创建文本输出
    const textOutput: ChatOutput = {
      content: {
        type: 'text',
        value: '回复文本'
      }
    };

    // 创建多模态输出
    const multimodalOutput: ChatOutput = {
      content: [
        { type: 'text', value: '带图片的回复' },
        { type: 'image', value: new Uint8Array([1, 2, 3]), mimeType: 'image/png' }
      ]
    };

    // 验证结构
    expect(textOutput).toHaveProperty('content');
    expect(multimodalOutput).toHaveProperty('content');

    // 验证类型兼容性
    const outputs: ChatOutput[] = [textOutput, multimodalOutput];

    expect(outputs.length).toBe(2);
  });

  test('CT-Type-Agent-07: AgentSession接口应符合公开契约', () => {
    // 创建模拟消息
    const message = {
      id: 'test-message',
      role: 'user' as const,
      content: { type: 'text' as const, value: '测试消息' },
      timestamp: Date.now()
    };

    // 创建消息更新函数
    const updater = (msg: any) => ({ ...msg, content: { type: 'text', value: '更新后的消息' } });

    // 创建符合AgentSession接口的对象
    const session: AgentSession = {
      id: 'test-session',
      addMessage: (msg) => { /* 空实现 */ },
      updateMessage: (messageId, updater) => { /* 空实现 */ },
      getMessages: () => [message],
      messages$: new Observable(),
      clear: () => { /* 空实现 */ }
    };

    // 验证接口结构
    expect(session).toHaveProperty('id');
    expect(session).toHaveProperty('addMessage');
    expect(session).toHaveProperty('updateMessage');
    expect(session).toHaveProperty('getMessages');
    expect(session).toHaveProperty('messages$');
    expect(session).toHaveProperty('clear');

    expect(typeof session.addMessage).toBe('function');
    expect(typeof session.updateMessage).toBe('function');
    expect(typeof session.getMessages).toBe('function');
    expect(typeof session.clear).toBe('function');
    expect(session.messages$).toBeInstanceOf(Observable);

    // 验证方法签名能正确工作
    session.addMessage(message);
    session.updateMessage('test-message', updater);
    const messages = session.getMessages();

    expect(messages).toBeInstanceOf(Array);
    expect(messages[0]).toBe(message);
  });
});
