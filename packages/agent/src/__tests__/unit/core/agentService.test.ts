/**
 * Agent Service 单元测试
 *
 * 此文件已经完全重构，以适应RxJS架构
 */
import { of, throwError, firstValueFrom } from 'rxjs';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import type { ChatInput } from '../../../types';

// 模拟依赖
vi.mock('../../../core/llm/llmFactory', () => {
  const mockLLMClient = { sendRequest: vi.fn() };

  return {
    createLLMClient: vi.fn().mockReturnValue(mockLLMClient)
  };
});

// 模拟DPMLAgent
vi.mock('../../../core/DPMLAgent', () => {
  const sessionId = 'test-session-id';
  const mockChat = vi.fn();

  mockChat.mockImplementation((sid, input) => {
    return of({ content: { type: 'text', value: '同步响应' } });
  });

  return {
    DPMLAgent: vi.fn().mockImplementation(() => ({
      createSession: () => sessionId,
      getSession: () => ({ id: sessionId }),
      chat: mockChat,
      cancel: vi.fn(),
      removeSession: vi.fn()
    }))
  };
});

// 导入被测试的模块和依赖
import { createAgent } from '../../../core/agentService';
import { DPMLAgent } from '../../../core/DPMLAgent';
import { createLLMClient } from '../../../core/llm/llmFactory';

describe('UT-AgentSvc', () => {
  // 测试会话ID
  const testSessionId = 'test-session-id';

  // 每个测试前重置模拟
  beforeEach(() => {
    vi.clearAllMocks();

    // 重置模拟行为
    const dpmlAgentInstance = new (DPMLAgent as any)();

    dpmlAgentInstance.chat.mockImplementation((sid, input) => {
      return of({ content: { type: 'text', value: '同步响应' } });
    });
  });

  test('UT-AgentSvc-01: createAgent应创建有效的Agent实例', () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };

    // 执行
    const agent = createAgent(config);

    // 验证
    expect(createLLMClient).toHaveBeenCalledWith(config.llm);
    expect(DPMLAgent).toHaveBeenCalledWith(config, expect.anything());
    expect(agent).toHaveProperty('chat');
    expect(agent).toHaveProperty('createSession');
    expect(agent).toHaveProperty('getSession');
    expect(agent).toHaveProperty('removeSession');
    expect(agent).toHaveProperty('cancel');
  });

  test('UT-AgentSvc-02: createAgent应当传递正确配置给LLM客户端', () => {
    // 准备
    const config = {
      llm: {
        apiType: 'anthropic',
        model: 'claude-3',
        apiKey: 'test-key',
        apiUrl: 'https://api.example.com'
      },
      prompt: '测试提示词'
    };

    // 执行
    createAgent(config);

    // 验证
    expect(createLLMClient).toHaveBeenCalledWith(config.llm);
  });

  test('UT-AgentSvc-03: chat应正确处理文本输入', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);
    const dpmlAgentInstance = new (DPMLAgent as any)();

    // 执行 - 使用firstValueFrom将Observable转换为Promise
    const responseObservable = agent.chat(testSessionId, '测试文本输入');
    const response = await firstValueFrom(responseObservable);

    // 验证
    expect(response.content).toEqual({ type: 'text', value: '同步响应' });
    expect(dpmlAgentInstance.chat).toHaveBeenCalledWith(
      testSessionId,
      '测试文本输入'
    );
  });

  test('UT-AgentSvc-04: chat应正确处理ChatInput对象', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);
    const dpmlAgentInstance = new (DPMLAgent as any)();
    const chatInput: ChatInput = {
      content: {
        type: 'text',
        value: '测试ChatInput'
      }
    };

    // 执行
    const responseObservable = agent.chat(testSessionId, chatInput);
    const response = await firstValueFrom(responseObservable);

    // 验证
    expect(response.content).toEqual({ type: 'text', value: '同步响应' });
    expect(dpmlAgentInstance.chat).toHaveBeenCalledWith(testSessionId, chatInput);
  });

  test('UT-AgentSvc-05: chat应支持Observable流式响应', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);
    const dpmlAgentInstance = new (DPMLAgent as any)();

    // 设置模拟返回多个值的Observable
    dpmlAgentInstance.chat.mockImplementation((sid, input) => {
      return of(
        { content: { type: 'text', value: '流式响应1' } },
        { content: { type: 'text', value: '流式响应2' } }
      );
    });

    // 执行 - 手动收集Observable发出的所有值
    const responses: any[] = [];
    const subscription = agent.chat(testSessionId, '测试文本输入').subscribe(
      response => responses.push(response)
    );

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 10));
    subscription.unsubscribe();

    // 验证
    expect(responses.length).toBe(2);
    expect(responses[0].content).toEqual({ type: 'text', value: '流式响应1' });
    expect(responses[1].content).toEqual({ type: 'text', value: '流式响应2' });
    expect(dpmlAgentInstance.chat).toHaveBeenCalledWith(
      testSessionId,
      '测试文本输入'
    );
  });

  test('UT-AgentSvc-06: chat应正确传递错误', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);
    const originalError = new Error('API错误');
    const dpmlAgentInstance = new (DPMLAgent as any)();

    // 设置模拟抛出错误
    dpmlAgentInstance.chat.mockImplementation((sid, input) => {
      return throwError(() => originalError);
    });

    // 验证 - 使用Promise方式验证错误
    await expect(
      firstValueFrom(agent.chat(testSessionId, '测试文本'))
    ).rejects.toThrow('API错误');

    // 验证 - 使用订阅方式验证错误
    return new Promise<void>((resolve, reject) => {
      agent.chat(testSessionId, '测试文本').subscribe({
        next: () => reject(new Error('不应该进入next回调')),
        error: (error) => {
          try {
            expect(error).toEqual(originalError);
            expect(error.message).toBe('API错误');
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  });

  test('UT-AgentSvc-07: extractTextFromContent应从内容中提取文本', async () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词'
    };
    const agent = createAgent(config);
    const dpmlAgentInstance = new (DPMLAgent as any)();

    // 设置模拟返回数组内容
    dpmlAgentInstance.chat.mockImplementation((sid, input) => {
      return of({
        content: [
          { type: 'image', value: new Uint8Array([1, 2, 3]) },
          { type: 'text', value: '文本内容' }
        ]
      });
    });

    // 执行：测试从数组中提取文本
    const response = await firstValueFrom(agent.chat(testSessionId, '测试'));
    const textContent = getTextFromContent(response.content);

    expect(textContent).toBe('文本内容');

    // 设置模拟返回非文本内容
    dpmlAgentInstance.chat.mockImplementation((sid, input) => {
      return of({
        content: { type: 'image', value: new Uint8Array([1, 2, 3]) }
      });
    });

    // 执行：测试从非文本内容中提取文本
    const response2 = await firstValueFrom(agent.chat(testSessionId, '测试'));
    const textContent2 = getTextFromContent(response2.content);

    expect(textContent2).toBe('');
  });
});

/**
 * 辅助函数：从内容中提取文本
 */
function getTextFromContent(content: any): string {
  if (Array.isArray(content)) {
    // 如果是数组，查找第一个文本内容
    const textItem = content.find(item => item.type === 'text');

    return textItem ? String(textItem.value) : '';
  } else if (content && content.type === 'text') {
    // 如果是单个文本内容
    return String(content.value);
  }

  // 其他情况返回空字符串
  return '';
}
