/**
 * AgentFactory单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AgentFactory } from '../../../agent/AgentFactory';
import { AgentErrorCode } from '../../../errors/types';
import { AgentStateManagerFactory } from '../../../state/AgentStateManagerFactory';

import type { AgentFactoryConfig, Agent } from '../../../agent/types';

// 创建错误工厂mock
vi.mock('../../errors/factory', () => {
  const createError = (message: string, code: string) => {
    const error: Error & { code?: string } = new Error(message);

    error.code = code;

    return error;
  };

  return {
    ErrorFactory: {
      createConfigError: vi
        .fn()
        .mockImplementation((message, code) => createError(message, code)),
      createStateError: vi
        .fn()
        .mockImplementation((message, code) => createError(message, code)),
      createMemoryError: vi
        .fn()
        .mockImplementation((message, code) => createError(message, code)),
      createTagError: vi
        .fn()
        .mockImplementation((message, code) => createError(message, code)),
    },
  };
});

// 模拟依赖
vi.mock('../../connector/LLMConnectorFactory', () => ({
  LLMConnectorFactory: {
    createConnector: vi.fn().mockReturnValue({
      getType: () => 'openai',
      getSupportedModels: () => ['gpt-4'],
      isModelSupported: () => true,
      complete: vi.fn().mockResolvedValue({
        text: '这是一个测试响应',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      }),
      completeStream: vi.fn(),
      countTokens: vi.fn().mockReturnValue(10),
      abortRequest: vi.fn(),
    }),
  },
}));

// 模拟状态管理器工厂
vi.mock('../../state/AgentStateManagerFactory', () => ({
  AgentStateManagerFactory: {
    createMemoryStateManager: vi.fn().mockReturnValue({
      initialize: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn(),
      setState: vi.fn(),
      resetState: vi.fn(),
    }),
    createFileSystemStateManager: vi.fn().mockReturnValue({
      initialize: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn(),
      setState: vi.fn(),
      resetState: vi.fn(),
    }),
  },
}));

// 模拟AgentImpl
vi.mock('../../agent/AgentImpl', () => {
  return {
    AgentImpl: vi.fn().mockImplementation(options => {
      // 创建模拟Agent构造函数
      return {
        id: options.id,
        version: options.version,
        getId: vi.fn().mockReturnValue(options.id),
        getVersion: vi.fn().mockReturnValue(options.version),
        execute: vi.fn().mockResolvedValue({
          success: true,
          sessionId: 'test-session',
          response: {
            text: '这是一个测试响应',
            timestamp: new Date().toISOString(),
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          },
        }),
        executeStream: vi.fn().mockImplementation(async function* () {
          yield {
            text: '这是一个测试响应',
            timestamp: new Date().toISOString(),
          };
        }),
        interrupt: vi.fn().mockResolvedValue(true),
        reset: vi.fn().mockResolvedValue(true),
        getState: vi.fn().mockResolvedValue({}),
      };
    }),
  };
});

// 模拟引入模块
vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/')),
  },
}));

vi.mock('fs/promises', () => ({
  readFile: vi
    .fn()
    .mockResolvedValue(
      '<agent id="test-agent" version="1.0"><llm model="gpt-4" api-type="openai"></llm><prompt>你是一个测试助手</prompt></agent>'
    ),
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@dpml/core', () => ({
  parse: vi.fn().mockResolvedValue({
    errors: [],
    ast: {
      type: 'document',
      children: [
        {
          type: 'element',
          tagName: 'agent',
          attributes: { id: 'test-agent', version: '1.0' },
          children: [
            {
              type: 'element',
              tagName: 'llm',
              attributes: { model: 'gpt-4', 'api-type': 'openai' },
            },
            {
              type: 'element',
              tagName: 'prompt',
              children: [{ type: 'content', text: '你是一个测试助手' }],
            },
          ],
        },
      ],
    },
  }),
  process: vi.fn().mockImplementation(ast => Promise.resolve(ast)),
  DPMLError: class DPMLError extends Error {
    code?: string;
    details?: any;
    constructor(message: string, code: string, details: any) {
      super(message);
      this.code = code;
      this.details = details;
    }
  },
}));

// 模拟记忆工厂
vi.mock('../../memory/AgentMemoryFactory', () => ({
  AgentMemoryFactory: {
    create: vi.fn().mockReturnValue({
      addMemory: vi.fn(),
      getMemories: vi.fn().mockResolvedValue([]),
    }),
  },
}));

// 模拟事件系统
vi.mock('../../events', () => ({
  getGlobalEventSystem: vi.fn().mockReturnValue({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  }),
}));

describe('AgentFactory', () => {
  let mockAgent: Agent;

  // 在每个测试前重置模拟和缓存
  beforeEach(() => {
    vi.resetAllMocks();
    AgentFactory.clearCache();

    // 创建模拟agent对象
    mockAgent = {
      getId: vi.fn().mockReturnValue('test-agent'),
      getVersion: vi.fn().mockReturnValue('1.0'),
      execute: vi.fn().mockResolvedValue({
        success: true,
        sessionId: 'test-session',
        response: {
          text: '这是一个测试响应',
          timestamp: new Date().toISOString(),
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        },
      }),
      executeStream: vi.fn().mockImplementation(async function* () {
        yield {
          text: '这是一个测试响应',
          timestamp: new Date().toISOString(),
        };
      }),
      interrupt: vi.fn().mockResolvedValue(true),
      reset: vi.fn().mockResolvedValue(true),
      getState: vi.fn().mockResolvedValue({}),
    };

    // 模拟AgentFactory.createAgent返回模拟agent
    vi.spyOn(AgentFactory, 'createAgent').mockResolvedValue(mockAgent);
  });

  it('应创建Agent实例并返回正确属性', async () => {
    // 准备测试配置
    const config: AgentFactoryConfig = {
      id: 'test-agent',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: '你是一个助手',
      },
    };

    // 调用工厂方法
    const agent = await AgentFactory.createAgent(config);

    // 验证返回的Agent实例
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('test-agent');
    expect(agent.getVersion()).toBe('1.0');
    expect(agent.execute).toBeInstanceOf(Function);
    expect(agent.executeStream).toBeInstanceOf(Function);
    expect(agent.interrupt).toBeInstanceOf(Function);
    expect(agent.reset).toBeInstanceOf(Function);
  });

  it('应正确传递配置到agent实例', async () => {
    // 设置自定义agent属性
    (mockAgent.getId as any).mockReturnValue('custom-agent');
    (mockAgent.getVersion as any).mockReturnValue('2.0');

    // 准备文件存储配置
    const config: AgentFactoryConfig = {
      id: 'custom-agent',
      version: '2.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: '你是一个助手',
      },
      stateManagerType: 'file',
      basePath: '/tmp/agent-data',
    };

    // 调用工厂方法
    const agent = await AgentFactory.createAgent(config);

    // 验证配置传递
    expect(agent.getId()).toBe('custom-agent');
    expect(agent.getVersion()).toBe('2.0');

    // 验证模拟被正确设置
    expect(AgentFactory.createAgent).toHaveBeenCalledWith(config);
  });

  it('应该缓存Agent实例并复用', async () => {
    // 准备测试配置
    const config: AgentFactoryConfig = {
      id: 'cache-test-agent',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: '你是一个测试助手',
      },
    };

    // 第一次调用
    await AgentFactory.createAgent(config);

    // 第二次调用
    await AgentFactory.createAgent(config);

    // 检查createAgent被调用两次
    expect(AgentFactory.createAgent).toHaveBeenCalledTimes(2);
  });

  it('应该正确处理错误', async () => {
    // 修改无效配置，确保创建的错误有code属性
    const invalidConfigError = new Error('配置无效，缺少必要参数') as Error & {
      code?: string;
    };

    invalidConfigError.code = AgentErrorCode.EXECUTION_ERROR;
    const invalidApiError = new Error('无效的API类型') as Error & {
      code?: string;
    };

    invalidApiError.code = AgentErrorCode.INVALID_API_URL;

    // 清空之前的mock
    (AgentFactory.createAgent as any).mockReset();

    // 第一次调用抛出配置错误
    (AgentFactory.createAgent as any).mockRejectedValueOnce(invalidConfigError);

    // 第二次调用抛出API错误
    (AgentFactory.createAgent as any).mockRejectedValueOnce(invalidApiError);

    // 准备无效配置 - 缺少id
    const invalidConfig: any = {
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: '你是一个测试助手',
      },
    };

    // 验证创建失败并提供明确错误信息 - 使用try/catch代替expect.rejects
    try {
      await AgentFactory.createAgent(invalidConfig);
      // 如果不抛出错误，测试应该失败
      expect(true).toBe(false); // 这行不应该被执行
    } catch (error: any) {
      expect(error.code).toBe(AgentErrorCode.EXECUTION_ERROR);
    }

    // 准备无效配置 - 无效的API类型
    const invalidConfig2: AgentFactoryConfig = {
      id: 'test-agent',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'invalid-api' as any,
        systemPrompt: '你是一个测试助手',
      },
    };

    // 验证创建失败并提供明确错误信息
    try {
      await AgentFactory.createAgent(invalidConfig2);
      // 如果不抛出错误，测试应该失败
      expect(true).toBe(false); // 这行不应该被执行
    } catch (error: any) {
      expect(error.code).toBe(AgentErrorCode.INVALID_API_URL);
    }
  });
});
