/**
 * AgentImpl 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AgentImpl } from '../../../agent/AgentImpl';
import { AgentStatus } from '../../../state/AgentState';

import type { CompletionResult } from '../../../connector/LLMConnector';

// 模拟依赖
vi.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('AgentImpl', () => {
  // 创建模拟对象
  const mockStateManager = {
    getState: vi.fn(),
    updateState: vi.fn(),
    addMessage: vi.fn(),
    resetState: vi.fn(),
    getSessions: vi.fn(),
    initState: vi.fn(),
  };

  const mockMemory = {
    store: vi.fn(),
    retrieve: vi.fn(),
    clear: vi.fn(),
    getAllSessionIds: vi.fn(),
  };

  const mockConnector = {
    complete: vi.fn(),
    completeStream: vi.fn(),
    abortRequest: vi.fn(),
    getType: vi.fn().mockReturnValue('test'),
    getSupportedModels: vi.fn(),
    isModelSupported: vi.fn(),
    countTokens: vi.fn(),
  };

  const mockEventSystem = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };

  // 测试的Agent实例
  let agent: any;

  // 基本配置
  const testConfig = {
    id: 'test-agent',
    version: '1.0',
    executionConfig: {
      defaultModel: 'gpt-4',
      apiType: 'openai',
      systemPrompt: '你是一个助手',
      defaultTimeoutMs: 30000,
    },
  };

  // 每个测试前重置模拟和创建新实例
  beforeEach(() => {
    vi.clearAllMocks();

    // 常见状态对象
    const mockState = {
      id: 'test-agent',
      status: AgentStatus.IDLE,
      sessionId: 'test-session',
      updatedAt: Date.now(),
      statusStartedAt: Date.now(),
      timeoutMs: 0,
      messages: [],
      metadata: {},
    };

    // 设置模拟行为
    mockStateManager.getState.mockResolvedValue(mockState);
    mockStateManager.updateState.mockImplementation((_, updates) => {
      return Promise.resolve({ ...mockState, ...updates });
    });
    mockStateManager.addMessage.mockImplementation((_, message) => {
      const newState = { ...mockState };

      newState.messages = [...newState.messages, message];

      return Promise.resolve(newState);
    });
    mockStateManager.getSessions.mockResolvedValue(['test-session']);
    mockStateManager.initState.mockImplementation(sessionId => {
      return Promise.resolve({
        ...mockState,
        sessionId,
        messages: [],
      });
    });

    // 模拟记忆系统
    mockMemory.retrieve.mockResolvedValue({
      id: 'test-session',
      content: [
        { text: '你好', role: 'user', timestamp: Date.now() - 1000 },
        {
          text: '你好！有什么可以帮助你的吗？',
          role: 'assistant',
          timestamp: Date.now() - 500,
        },
      ],
    });

    // 模拟LLM连接器
    const mockCompletionResult: CompletionResult = {
      content: '这是测试回复',
      model: 'gpt-4',
      usage: {
        promptTokens: 50,
        completionTokens: 10,
        totalTokens: 60,
      },
      requestId: 'test-request-id',
    };

    mockConnector.complete.mockResolvedValue(mockCompletionResult);
    mockConnector.completeStream.mockImplementation(function* () {
      yield {
        content: '这是',
        isLast: false,
        model: 'gpt-4',
        requestId: 'test-request-id',
      };
      yield {
        content: '测试',
        isLast: false,
        model: 'gpt-4',
        requestId: 'test-request-id',
      };
      yield {
        content: '回复',
        isLast: true,
        finishReason: 'stop',
        model: 'gpt-4',
        requestId: 'test-request-id',
      };
    });

    // 创建Agent实例
    agent = new AgentImpl({
      ...testConfig,
      stateManager: mockStateManager,
      memory: mockMemory,
      connector: mockConnector,
      eventSystem: mockEventSystem,
    });
  });

  // 测试用例

  describe('基本属性和状态', () => {
    it('应返回正确的代理ID', () => {
      expect(agent.getId()).toBe('test-agent');
    });

    it('应返回正确的版本', () => {
      expect(agent.getVersion()).toBe('1.0');
    });

    it('应正确获取状态', async () => {
      const state = await agent.getState('test-session');

      expect(mockStateManager.getState).toHaveBeenCalledWith('test-session');
      expect(state).toMatchObject({
        id: 'test-agent',
        sessionId: 'test-session',
      });
    });

    it('未提供sessionId时应使用第一个会话', async () => {
      await agent.getState();

      expect(mockStateManager.getSessions).toHaveBeenCalled();
      expect(mockStateManager.getState).toHaveBeenCalledWith('test-session');
    });

    it('没有会话时应创建新会话', async () => {
      mockStateManager.getSessions.mockResolvedValue([]);

      await agent.getState();

      expect(mockStateManager.initState).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('执行功能', () => {
    it('应正确执行同步请求', async () => {
      const result = await agent.execute({
        text: '测试查询',
        sessionId: 'test-session',
      });

      // 验证状态更新
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          status: AgentStatus.THINKING,
        })
      );
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          status: AgentStatus.RESPONDING,
        })
      );
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          status: AgentStatus.DONE,
        })
      );

      // 验证消息添加
      expect(mockStateManager.addMessage).toHaveBeenCalledTimes(2);
      expect(mockStateManager.addMessage).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          role: 'user',
          content: '测试查询',
        })
      );
      expect(mockStateManager.addMessage).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          role: 'assistant',
          content: '这是测试回复',
        })
      );

      // 验证记忆存储
      expect(mockMemory.store).toHaveBeenCalledTimes(2);

      // 验证事件触发
      expect(mockEventSystem.emit).toHaveBeenCalledWith(
        'agent:thinking',
        expect.anything()
      );
      expect(mockEventSystem.emit).toHaveBeenCalledWith(
        'agent:responding',
        expect.anything()
      );
      expect(mockEventSystem.emit).toHaveBeenCalledWith(
        'agent:llm:before',
        expect.anything()
      );
      expect(mockEventSystem.emit).toHaveBeenCalledWith(
        'agent:llm:success',
        expect.anything()
      );
      expect(mockEventSystem.emit).toHaveBeenCalledWith(
        'agent:done',
        expect.anything()
      );

      // 验证返回结果
      expect(result).toMatchObject({
        text: '这是测试回复',
        sessionId: 'test-session',
        finishReason: 'done',
        usage: {
          promptTokens: 50,
          completionTokens: 10,
          totalTokens: 60,
        },
      });
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('应处理执行错误', async () => {
      mockConnector.complete.mockRejectedValue(new Error('LLM错误'));

      const result = await agent.execute({
        text: '测试查询',
        sessionId: 'test-session',
      });

      // 验证状态更新到ERROR
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          status: AgentStatus.ERROR,
        })
      );

      // 验证错误事件
      expect(mockEventSystem.emit).toHaveBeenCalledWith(
        'agent:error',
        expect.anything()
      );

      // 验证错误结果
      expect(result).toMatchObject({
        text: expect.stringContaining('LLM错误'),
        sessionId: 'test-session',
        finishReason: 'error',
      });
    });

    it('应正确中断执行', async () => {
      // 模拟进行中的状态
      mockStateManager.getState.mockResolvedValue({
        id: 'test-agent',
        status: AgentStatus.RESPONDING,
        sessionId: 'test-session',
        updatedAt: Date.now(),
        statusStartedAt: Date.now(),
        timeoutMs: 0,
        messages: [],
        metadata: {},
      });

      // 设置mock AbortController
      const mockAbort = vi.fn();
      const mockAbortController = { abort: mockAbort };

      (agent as any).abortControllers.set('test-session', mockAbortController);

      // 执行中断
      await agent.interrupt('test-session');

      // 验证是否调用了abort
      expect(mockAbort).toHaveBeenCalled();

      // 验证状态更新为PAUSED
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({
          status: AgentStatus.PAUSED,
        })
      );

      // 验证中断事件
      expect(mockEventSystem.emit).toHaveBeenCalledWith(
        'agent:interrupted',
        expect.anything()
      );
    });

    it('应正确重置状态', async () => {
      await agent.reset('test-session');

      // 验证状态重置
      expect(mockStateManager.resetState).toHaveBeenCalledWith('test-session');

      // 验证记忆清除
      expect(mockMemory.clear).toHaveBeenCalledWith('test-session');

      // 验证重置事件
      expect(mockEventSystem.emit).toHaveBeenCalledWith(
        'agent:reset',
        expect.anything()
      );
    });
  });
});
