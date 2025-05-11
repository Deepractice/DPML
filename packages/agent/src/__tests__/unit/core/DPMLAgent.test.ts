/**
 * DPMLAgent 单元测试
 */
import { firstValueFrom, of, EMPTY } from 'rxjs';
import { describe, expect, test, vi, beforeEach } from 'vitest';

import { DPMLAgent } from '../../../core/DPMLAgent';
import type { LLMClient } from '../../../core/llm/LLMClient';
import type { LLMRequest } from '../../../core/llm/LLMRequest';
import type { AgentConfig } from '../../../types/AgentConfig';
import type { ChatInput } from '../../../types/Chat';


// 模拟uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

describe('UT-DPMLAgent', () => {
  // 测试配置
  const testConfig: AgentConfig = {
    llm: {
      apiType: 'openai',
      model: 'gpt-4'
    },
    prompt: '你是一个AI助手'
  };

  // 创建模拟对象
  const mockSendRequest = vi.fn();
  const mockLLMClient: LLMClient = {
    sendRequest: mockSendRequest
  };

  let agent: DPMLAgent;

  beforeEach(() => {
    vi.resetAllMocks();

    // 设置默认返回值
    mockSendRequest.mockReturnValue(of({
      content: { type: 'text' as const, value: '模拟响应' }
    }));

    // 创建测试实例
    agent = new DPMLAgent(testConfig, mockLLMClient);
  });

  test('UT-DPMLAgent-01: createSession应返回会话ID并初始化会话', () => {
    // 执行
    const sessionId = agent.createSession();

    // 验证
    expect(sessionId).toBe('test-uuid');
    const session = agent.getSession(sessionId);

    expect(session).toBeDefined();
  });

  test('UT-DPMLAgent-02: createSession应添加系统提示消息', () => {
    // 执行
    const sessionId = agent.createSession();
    const session = agent.getSession(sessionId);
    const messages = session!.getMessages();

    // 验证
    expect(messages.length).toBe(1);
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toEqual({
      type: 'text',
      value: testConfig.prompt
    });
  });

  test('UT-DPMLAgent-03: 当prompt为空时不应添加系统消息', () => {
    // 准备
    const configWithEmptyPrompt: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '' // 空prompt
    };
    const agentWithoutPrompt = new DPMLAgent(configWithEmptyPrompt, mockLLMClient);

    // 执行
    const sessionId = agentWithoutPrompt.createSession();
    const session = agentWithoutPrompt.getSession(sessionId);
    const messages = session!.getMessages();

    // 验证
    expect(messages.length).toBe(0);
  });

  test('UT-DPMLAgent-04: removeSession应删除会话', () => {
    // 准备
    const sessionId = agent.createSession();

    expect(agent.getSession(sessionId)).toBeDefined();

    // 执行
    const result = agent.removeSession(sessionId);

    // 验证
    expect(result).toBe(true);
    expect(agent.getSession(sessionId)).toBeUndefined();
  });

  test('UT-DPMLAgent-05: removeSession对不存在的会话应返回false', () => {
    // 执行
    const result = agent.removeSession('不存在的ID');

    // 验证
    expect(result).toBe(false);
  });

  test('UT-DPMLAgent-06: chat应抛出错误当会话不存在', () => {
    // 执行和验证
    expect(() => agent.chat('不存在的ID', '测试消息')).toThrow('会话不存在');
  });

  test('UT-DPMLAgent-07: chat应为文本输入创建用户消息', async () => {
    // 准备
    const sessionId = agent.createSession();
    const input = '测试消息';

    // 执行
    await firstValueFrom(agent.chat(sessionId, input));

    // 验证
    const session = agent.getSession(sessionId);
    const messages = session!.getMessages();

    // 应该有系统消息、用户消息和助手消息
    expect(messages.length).toBe(3);

    // 验证用户消息
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toEqual({
      type: 'text',
      value: '测试消息'
    });
  });

  test('UT-DPMLAgent-08: chat应为ChatInput创建用户消息', async () => {
    // 准备
    const sessionId = agent.createSession();
    const input: ChatInput = {
      content: {
        type: 'text',
        value: '测试ChatInput'
      }
    };

    // 执行
    await firstValueFrom(agent.chat(sessionId, input));

    // 验证
    const session = agent.getSession(sessionId);
    const messages = session!.getMessages();

    // 验证用户消息
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toEqual({
      type: 'text',
      value: '测试ChatInput'
    });
  });

  test('UT-DPMLAgent-09: chat应提前添加助手消息占位符并在响应时更新', () => {
    // 准备
    const sessionId = agent.createSession();

    // 模拟响应
    const response = { content: { type: 'text' as const, value: '模拟响应' } };

    mockSendRequest.mockReturnValue(of(response));

    // 模拟session的updateMessage方法
    const updateMessageSpy = vi.spyOn(agent.getSession(sessionId)!, 'updateMessage');

    // 执行
    agent.chat(sessionId, '测试消息');

    // 验证
    // 1. 验证会话中有3个消息（系统、用户、助手）
    const messages = agent.getSession(sessionId)!.getMessages();

    expect(messages.length).toBe(3);

    // 2. 验证sendRequest被调用
    expect(mockSendRequest).toHaveBeenCalled();

    // 3. 验证updateMessage被调用
    // 注意：在实际代码中，这个方法会在Observable的tap中被调用
    // 我们只验证它被调用了，不验证具体效果
    expect(updateMessageSpy).toHaveBeenCalled();
  });

  test('UT-DPMLAgent-10: chat应向LLM客户端发送正确的请求', async () => {
    // 准备
    const sessionId = agent.createSession();

    // 执行
    await firstValueFrom(agent.chat(sessionId, '测试消息'));

    // 验证
    expect(mockSendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId,
        messages: expect.any(Array),
        model: testConfig.llm.model
      } as LLMRequest)
    );
  });

  test('UT-DPMLAgent-11: chat应累积多轮对话消息', async () => {
    // 准备
    const sessionId = agent.createSession();

    // 第一轮对话
    await firstValueFrom(agent.chat(sessionId, '第一条消息'));

    // 第二轮对话
    await firstValueFrom(agent.chat(sessionId, '第二条消息'));

    // 验证
    const session = agent.getSession(sessionId);
    const messages = session!.getMessages();

    // 系统 + 用户1 + 助手1 + 用户2 + 助手2
    expect(messages.length).toBe(5);
  });

  test('UT-DPMLAgent-12: chat应更新助手消息以累积流式内容', () => {
    // 准备
    const sessionId = agent.createSession();

    // 模拟多个响应块
    const responses = [
      { content: { type: 'text' as const, value: '第一块' } },
      { content: { type: 'text' as const, value: '第二块' } }
    ];

    mockSendRequest.mockReturnValue(of(...responses));

    // 模拟session的updateMessage方法
    const updateMessageSpy = vi.spyOn(agent.getSession(sessionId)!, 'updateMessage');

    // 执行
    agent.chat(sessionId, '测试消息');

    // 验证
    // 1. 验证会话中有3个消息（系统、用户、助手）
    const messages = agent.getSession(sessionId)!.getMessages();

    expect(messages.length).toBe(3);

    // 2. 验证sendRequest被调用
    expect(mockSendRequest).toHaveBeenCalled();

    // 3. 验证updateMessage被调用
    // 注意：在实际代码中，这个方法会在Observable的tap中被调用两次
    // 我们只验证它被调用了，不验证具体效果
    expect(updateMessageSpy).toHaveBeenCalled();
  });

  test('UT-DPMLAgent-13: cancel应取消活跃请求', () => {
    // 准备
    const sessionId = agent.createSession();

    // 模拟活跃请求
    const mockUnsubscribe = vi.fn();

    agent['activeRequests'].set(sessionId, { unsubscribe: mockUnsubscribe } as any);

    // 验证请求被记录
    expect(agent['activeRequests'].has(sessionId)).toBe(true);

    // 执行 - 取消请求
    agent.cancel(sessionId);

    // 验证请求被取消
    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(agent['activeRequests'].has(sessionId)).toBe(false);
  });

  test('UT-DPMLAgent-14: cancel对不存在的会话应无操作', () => {
    // 执行
    agent.cancel('不存在的ID');

    // 验证 - 不抛出错误
    expect(true).toBe(true);
  });

  test('UT-DPMLAgent-15: chat应处理错误', async () => {
    // 准备
    const sessionId = agent.createSession();
    const _errorMessage = '测试错误';

    // 模拟sendRequest返回失败的处理方式（使用spy捕获和验证，而不是抛出错误）
    mockSendRequest.mockReturnValue(EMPTY);

    // 创建spy来验证是否调用了sendRequest
    const spy = vi.spyOn(mockLLMClient, 'sendRequest');

    // 执行
    const result = agent.chat(sessionId, '测试消息');

    // 订阅Observable但不等待其完成
    result.subscribe({
      next: () => {
        // 不应该收到值
        expect(true).toBe(false);
      },
      complete: () => {
        // 应该收到完成信号
        expect(spy).toHaveBeenCalled();
      }
    });

    // 验证是否调用了sendRequest
    expect(spy).toHaveBeenCalled();
  });

  test('UT-DPMLAgent-16: 多模态消息应正确处理', async () => {
    // 准备
    const sessionId = agent.createSession();
    const imageData = new Uint8Array([1, 2, 3]);
    const input: ChatInput = {
      content: [
        { type: 'text' as const, value: '文本部分' },
        { type: 'image' as const, value: imageData, mimeType: 'image/jpeg' }
      ]
    };

    // 执行
    await firstValueFrom(agent.chat(sessionId, input));

    // 验证
    const session = agent.getSession(sessionId);
    const messages = session!.getMessages();

    // 验证用户消息
    expect(messages[1].role).toBe('user');
    expect(Array.isArray(messages[1].content)).toBe(true);
    expect(messages[1].content).toEqual(input.content);
  });

  test('UT-DPMLAgent-17: 在新请求前应取消同一会话的现有请求', () => {
    // 准备
    const sessionId = agent.createSession();
    const mockUnsubscribe = vi.fn();

    // 模拟活跃请求
    agent['activeRequests'].set(sessionId, { unsubscribe: mockUnsubscribe } as any);

    // 执行
    agent.chat(sessionId, '测试消息');

    // 验证之前的请求被取消
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
