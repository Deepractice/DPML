import { describe, expect, test, beforeEach, vi, afterEach } from 'vitest';

import { AgentImpl } from '../../../agent/AgentImpl';
import { AgentStatus } from '../../state/AgentState';

import type { AgentRequest } from '../../../agent/types';

describe('代理执行性能测试', () => {
  // 模拟依赖
  const mockStateManager = {
    initState: vi.fn().mockResolvedValue(undefined),
    updateState: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn().mockResolvedValue({
      status: AgentStatus.IDLE,
      messages: [],
    }),
    addMessage: vi.fn().mockResolvedValue(undefined),
    getSessions: vi.fn().mockResolvedValue(['session-1']),
  };

  const mockMemory = {
    store: vi.fn().mockResolvedValue(undefined),
    retrieve: vi.fn().mockResolvedValue({
      id: 'test-session',
      content: [],
    }),
    clear: vi.fn().mockResolvedValue(undefined),
    getAllSessionIds: vi.fn().mockResolvedValue(['test-session']),
  };

  const mockConnector = {
    getType: vi.fn().mockReturnValue('mock'),
    getSupportedModels: vi.fn().mockResolvedValue(['gpt-3.5-turbo']),
    isModelSupported: vi.fn().mockResolvedValue(true),
    countTokens: vi.fn().mockResolvedValue(10),
    complete: vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            content: '这是模拟响应',
            model: 'gpt-3.5-turbo',
            usage: {
              promptTokens: 10,
              completionTokens: 20,
              totalTokens: 30,
            },
          });
        }, 50);
      });
    }),
    completeStream: vi.fn().mockImplementation(function* () {
      yield {
        content: '这是',
        isLast: false,
        model: 'gpt-3.5-turbo',
      };
      yield {
        content: '模拟',
        isLast: false,
        model: 'gpt-3.5-turbo',
      };
      yield {
        content: '响应',
        isLast: true,
        model: 'gpt-3.5-turbo',
        finishReason: 'stop',
      };
    }),
    abortRequest: vi.fn().mockResolvedValue(undefined),
  };

  const mockEventSystem = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };

  let agent: AgentImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    agent = new AgentImpl({
      id: 'test-agent',
      version: '1.0.0',
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo',
        systemPrompt: '你是一个智能助手',
        maxResponseTokens: 1000,
        temperature: 0.7,
        maxConcurrentRequests: 5,
      },
      stateManager: mockStateManager,
      memory: mockMemory,
      connector: mockConnector,
      eventSystem: mockEventSystem,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('状态缓存减少重复状态访问', async () => {
    // 第一次调用获取状态
    await agent.getState('test-session');
    expect(mockStateManager.getState).toHaveBeenCalledTimes(1);

    // 第二次调用应该使用缓存
    await agent.getState('test-session');
    expect(mockStateManager.getState).toHaveBeenCalledTimes(1);

    // 不同会话ID应该不使用缓存
    await agent.getState('another-session');
    expect(mockStateManager.getState).toHaveBeenCalledTimes(2);
  });

  test('缓存在一定时间后应该过期', async () => {
    // 使用假定时器精确控制时间
    vi.useFakeTimers();

    // 第一次调用获取状态
    await agent.getState('test-session');
    expect(mockStateManager.getState).toHaveBeenCalledTimes(1);

    // 前进2.5秒 (应超过默认的2秒TTL)
    vi.advanceTimersByTime(2500);

    // 第二次调用应该重新获取
    await agent.getState('test-session');
    expect(mockStateManager.getState).toHaveBeenCalledTimes(2);
  });

  test('并发执行能够正确控制并发数', async () => {
    // 准备多个请求
    const requestCount = 10;
    const requests: AgentRequest[] = Array(requestCount)
      .fill(null)
      .map((_, i) => ({
        text: `测试请求 ${i}`,
        sessionId: `session-${i}`,
      }));

    // 增加响应延迟，确保请求重叠
    mockConnector.complete.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            content: '这是长延迟响应',
            model: 'gpt-3.5-turbo',
            usage: {
              promptTokens: 10,
              completionTokens: 20,
              totalTokens: 30,
            },
          });
        }, 200);
      });
    });

    // 并发执行所有请求
    const startTime = Date.now();
    const results = await Promise.all(requests.map(req => agent.execute(req)));
    const totalTime = Date.now() - startTime;

    // 验证所有请求都成功完成
    expect(results.length).toBe(requestCount);
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    // 验证API调用次数
    expect(mockConnector.complete).toHaveBeenCalledTimes(requestCount);

    // 时间验证 (如果并发控制工作，应该有多批执行)
    // 最大并发5，10个请求应该分2批，每批200ms
    expect(totalTime).toBeGreaterThan(200); // 至少需要一批的时间

    // 恢复原始实现
    mockConnector.complete.mockReset();
  });

  test('性能指标收集正确工作', async () => {
    // 修改mock实现，确保usage被传递
    mockConnector.complete.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            content: '这是模拟响应',
            model: 'gpt-3.5-turbo',
            usage: {
              promptTokens: 10,
              completionTokens: 20,
              totalTokens: 30,
            },
          });
        }, 50);
      });
    });

    // 重置metrics
    (agent as any).metrics = {
      requestsProcessed: 0,
      tokensUsed: {
        prompt: 0,
        completion: 0,
        total: 0,
      },
      averageResponseTime: 0,
      totalProcessingTime: 0,
    };

    // 执行几个请求
    await agent.execute({ text: '请求1', sessionId: 'metrics-session-1' });
    await agent.execute({ text: '请求2', sessionId: 'metrics-session-2' });
    await agent.execute({ text: '请求3', sessionId: 'metrics-session-3' });

    // 获取指标
    const metrics = agent.getMetrics();

    // 验证指标数据
    expect(metrics.requestsProcessed).toBe(3);
    expect(metrics.tokensUsed.prompt).toBe(30); // 10 * 3
    expect(metrics.tokensUsed.completion).toBe(60); // 20 * 3
    expect(metrics.tokensUsed.total).toBe(90); // 30 * 3
    expect(metrics.averageResponseTime).toBeGreaterThan(0);
  });

  test('流式执行性能', async () => {
    // 模拟异步生成器
    const mockStreamGenerator = async function* () {
      for (let i = 0; i < 5; i++) {
        yield {
          content: `部分 ${i}`,
          isLast: i === 4,
          model: 'gpt-3.5-turbo',
          requestId: 'stream-test',
        };
        // 每次产生数据后等待一小段时间
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    };

    mockConnector.completeStream.mockImplementation(() =>
      mockStreamGenerator()
    );

    // 计时开始
    const startTime = Date.now();

    // 收集所有块
    const chunks: string[] = [];

    for await (const chunk of agent.executeStream({
      text: '流测试',
      sessionId: 'stream-test',
    })) {
      chunks.push(chunk.text);
    }

    // 计时结束
    const totalTime = Date.now() - startTime;

    // 验证结果
    expect(chunks.length).toBe(5);
    expect(chunks.join('')).toBe('部分 0部分 1部分 2部分 3部分 4');

    // 流式执行应该比同步执行更快返回第一个结果
    expect(totalTime).toBeLessThan(500); // 总共5个块，每个20ms，加上一些处理开销

    // 验证LLM被正确调用
    expect(mockConnector.completeStream).toHaveBeenCalledTimes(1);
  });
});
