/**
 * Agent创建流程集成测试
 *
 * 已更新以适配RxJS架构
 */
import { firstValueFrom, of } from 'rxjs';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createAgent } from '../../api/agent';
import { createLLMClient } from '../../core/llm/llmFactory';
import type { AgentConfig } from '../../types/AgentConfig';
import { extractTextContent } from '../../utils/contentHelpers';

// 模拟依赖
vi.mock('../../core/llm/llmFactory', () => ({
  createLLMClient: vi.fn().mockReturnValue({
    sendRequest: vi.fn().mockReturnValue(of({
      content: { type: 'text', value: '模拟响应' }
    }))
  })
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-session-id')
}));

describe('IT-Agent', () => {
  let testConfig: AgentConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    testConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4',
        apiKey: 'sk-test123'
      },
      prompt: '你是一个AI助手'
    };
  });

  test('IT-Agent-01: API层应委托Core层创建Agent', async () => {
    // 执行
    const agent = createAgent(testConfig);

    // 验证
    expect(agent).toBeDefined();
    expect(typeof agent.chat).toBe('function');
    expect(typeof agent.createSession).toBe('function');
    expect(typeof agent.getSession).toBe('function');
    expect(typeof agent.removeSession).toBe('function');
    expect(typeof agent.cancel).toBe('function');
  });

  test('IT-Agent-02: Agent创建应包含正确的LLM客户端创建', async () => {
    // 执行
    createAgent(testConfig);

    // 验证
    expect(createLLMClient).toHaveBeenCalledWith(testConfig.llm);
  });

  test('IT-Agent-03: Agent应支持会话管理', async () => {
    // 执行
    const agent = createAgent(testConfig);

    // 创建会话
    const sessionId = agent.createSession();

    // 验证会话ID
    expect(sessionId).toBe('test-session-id');

    // 获取会话
    const session = agent.getSession(sessionId);

    // 验证会话存在
    expect(session).toBeDefined();
    expect(session?.id).toBe(sessionId);

    // 删除会话
    const result = agent.removeSession(sessionId);

    // 验证删除成功
    expect(result).toBe(true);

    // 验证会话已删除
    expect(agent.getSession(sessionId)).toBeUndefined();
  });

  test('IT-Agent-04: Agent应能正确处理消息', async () => {
    // 执行
    const agent = createAgent(testConfig);
    const sessionId = agent.createSession();

    // 发送消息并获取响应
    const response = await firstValueFrom(agent.chat(sessionId, '测试消息'));

    // 验证响应
    expect(response).toBeDefined();
    expect(extractTextContent(response.content)).toBe('模拟响应');
  });
});
