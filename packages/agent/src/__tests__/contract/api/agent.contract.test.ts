/**
 * Agent API契约测试
 *
 * 验证Agent API层的稳定性和一致性。
 */
import { Observable, of } from 'rxjs';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import type { AgentConfig } from '../../../types/AgentConfig';
import { AgentError, AgentErrorType } from '../../../types/errors';

// 模拟会话ID
const mockSessionId = 'test-session';

// 使用vi.mock的工厂函数模式进行模拟
vi.mock('../../../core/agentService', () => {
  return {
    createAgent: vi.fn().mockReturnValue({
      chat: () => of({ content: { type: 'text', value: '模拟响应' } }),
      cancel: vi.fn(),
      createSession: () => mockSessionId,
      getSession: () => ({ id: mockSessionId }),
      removeSession: () => true
    })
  };
});

// 导入被测试的模块和被模拟的模块
import { createAgent as apiCreateAgent } from '../../../api/agent';
import { createAgent } from '../../../core/agentService';

describe('CT-API-Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('CT-API-Agent-01: createAgent函数应符合公开契约', () => {
    // 验证函数存在且为函数类型
    expect(typeof apiCreateAgent).toBe('function');
  });

  test('CT-API-Agent-02: createAgent函数应接受AgentConfig并返回Agent', () => {
    // 准备完整的AgentConfig对象
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '你是一个AI助手'
    };

    // 执行测试
    const agent = apiCreateAgent(config);

    // 验证返回对象实现了Agent接口
    expect(agent).toBeDefined();
    expect(typeof agent.chat).toBe('function');
    expect(typeof agent.cancel).toBe('function');
    expect(typeof agent.createSession).toBe('function');
    expect(typeof agent.getSession).toBe('function');
    expect(typeof agent.removeSession).toBe('function');

    // 验证Core层被正确调用
    expect(createAgent).toHaveBeenCalledWith(config);
  });

  test('CT-API-Agent-03: Agent.chat方法应符合公开契约', () => {
    // 准备
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '你是一个AI助手'
    };
    const agent = apiCreateAgent(config);
    const sessionId = agent.createSession();

    // 执行
    const response = agent.chat(sessionId, '测试输入');

    // 验证返回类型为Observable
    expect(response).toBeInstanceOf(Observable);
  });

  test('CT-API-Agent-04: Agent.createSession方法应符合公开契约', () => {
    // 准备
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '你是一个AI助手'
    };
    const agent = apiCreateAgent(config);

    // 执行
    const sessionId = agent.createSession();

    // 验证返回值为字符串
    expect(typeof sessionId).toBe('string');
    expect(sessionId).toBe(mockSessionId);
  });

  test('CT-API-Agent-05: Agent.getSession方法应符合公开契约', () => {
    // 准备
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '你是一个AI助手'
    };
    const agent = apiCreateAgent(config);
    const sessionId = agent.createSession();

    // 执行
    const session = agent.getSession(sessionId);

    // 验证返回值符合AgentSession接口
    expect(session).toBeDefined();
    expect(session?.id).toBe(sessionId);
  });

  test('CT-API-Agent-06: Agent.removeSession方法应符合公开契约', () => {
    // 准备
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '你是一个AI助手'
    };
    const agent = apiCreateAgent(config);
    const sessionId = agent.createSession();

    // 执行
    const result = agent.removeSession(sessionId);

    // 验证返回值为布尔值
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });

  test('CT-API-Agent-07: createAgent应正确处理配置错误', () => {
    // 模拟Core层抛出错误
    vi.mocked(createAgent).mockImplementationOnce(() => {
      throw new AgentError('配置错误', AgentErrorType.CONFIG);
    });

    // 准备无效的AgentConfig
    const invalidConfig = {
      llm: {
        apiType: 'unknown',
        model: ''
      }
    } as AgentConfig;

    // 验证抛出预期的错误
    expect(() => apiCreateAgent(invalidConfig)).toThrow(AgentError);
  });
});
