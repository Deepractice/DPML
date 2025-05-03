/**
 * Agent API契约测试
 *
 * 验证Agent API层的稳定性和一致性。
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import type { AgentConfig } from '../../../types';
import { AgentError, AgentErrorType } from '../../../types';

// 使用vi.mock的工厂函数模式进行模拟
vi.mock('../../../core/agentService', () => {
  return {
    createAgent: vi.fn().mockReturnValue({
      chat: async () => '模拟响应',
      chatStream: async function* () {
        yield '模拟流式响应';
      }
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
    expect(typeof agent.chatStream).toBe('function');

    // 验证Core层被正确调用
    expect(createAgent).toHaveBeenCalledWith(config);
  });

  test('CT-API-Agent-03: Agent.chat方法应符合公开契约', async () => {
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
    const response = await agent.chat('测试输入');

    // 验证返回类型为Promise<string>
    expect(typeof response).toBe('string');
  });

  test('CT-API-Agent-04: Agent.chatStream方法应符合公开契约', async () => {
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
    const stream = agent.chatStream('测试输入');

    // 验证返回值符合AsyncIterable接口
    expect(stream[Symbol.asyncIterator]).toBeDefined();

    // 验证可以迭代
    const chunks: string[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  });

  test('CT-API-Agent-05: createAgent应正确处理配置错误', () => {
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
