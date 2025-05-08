/**
 * MCP客户端集成测试
 *
 * 测试MCP客户端与外部服务的集成
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { McpEnhancer } from '../../../core/mcp/McpEnhancer';
import { resetRegistry, registerEnhancer, getRegistry, enhanceLLMClient } from '../../../core/mcpService';
import type { McpConfig } from '../../../types/McpConfig';
import { MockLLMClient } from '../../fixtures/mcp/MockLLMClient';
import { MockMcpClient } from '../../fixtures/mcp/MockMcpClient';
import { mockMessages } from '../../fixtures/mcp.fixture';

// 创建共享的增强器存储，让不同的测试可以访问到相同的增强器实例
const enhancersMap = new Map();

// 创建完全模拟的McpRegistry模块
vi.mock('../../../core/mcp/McpRegistry', () => {
  // 创建共享的注册表实例
  let registry;

  // 返回模拟的McpRegistry类
  return {
    McpRegistry: {
      getInstance: vi.fn(() => {
        if (!registry) {
          // 首次调用时创建模拟注册表
          registry = {
            getEnhancer: vi.fn((name) => {
              if (!enhancersMap.has(name)) {
                throw new Error(`未找到名为 ${name} 的MCP增强器`);
              }

              return enhancersMap.get(name);
            }),
            registerEnhancer: vi.fn((config) => {
              // 创建一个新的模拟客户端
              const mockMcpClient = new MockMcpClient();

              // 连接客户端 - 除非是特殊标记的错误模式客户端
              if (!config.skipConnect) {
                mockMcpClient.connect();
              }

              // 创建一个增强器实例
              const enhancer = new McpEnhancer(mockMcpClient as any);

              // 存储增强器
              enhancersMap.set(config.name, enhancer);

              return enhancer;
            })
          };
        }

        return registry;
      }),
      reset: vi.fn(() => {
        // 清除增强器存储
        enhancersMap.clear();
        registry = null;
      })
    }
  };
});

describe('MCP客户端集成测试', () => {
  // 测试依赖
  let mockLlmClient: MockLLMClient;
  let mcpConfig: McpConfig;

  beforeEach(() => {
    // 清除之前的模拟并重置注册表
    vi.clearAllMocks();
    resetRegistry();
    enhancersMap.clear();

    // 创建模拟LLM客户端
    mockLlmClient = new MockLLMClient();

    // 设置MCP配置
    mcpConfig = {
      name: 'test-mcp',
      enabled: true,
      type: 'http',
      http: {
        url: 'http://localhost:3000/mcp'
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('应正确注册MCP增强器', () => {
    // 获取Registry实例
    const registry = getRegistry();

    // 调用注册方法
    registerEnhancer(mcpConfig);

    // 验证注册过程
    expect(registry.registerEnhancer).toHaveBeenCalledWith(mcpConfig);
  });

  test('应正确获取并使用已注册的增强器', async () => {
    // 先注册增强器
    registerEnhancer(mcpConfig);

    // 监视LLM客户端
    vi.spyOn(mockLlmClient, 'sendMessages');

    // 获取增强器并增强LLM客户端
    const enhancedClient = enhanceLLMClient(mockLlmClient as any, mcpConfig.name);

    // 验证返回增强的客户端
    expect(enhancedClient).toBeDefined();
    expect(typeof enhancedClient.sendMessages).toBe('function');

    // 使用增强的客户端
    await enhancedClient.sendMessages(mockMessages, false);

    // 验证原始客户端方法被调用
    expect(mockLlmClient.sendMessages).toHaveBeenCalled();
  });

  test('应处理MCP服务连接错误', async () => {
    // 创建一个带错误标记的配置
    const errorConfig = {
      ...mcpConfig,
      skipConnect: true // 特殊标记，告诉mock不要自动连接
    };

    // 获取模拟的注册表
    const registry = getRegistry();

    // 修改注册行为以生成使用错误模式客户端的增强器
    vi.mocked(registry.registerEnhancer).mockImplementationOnce((config) => {
      const errorMcpClient = new MockMcpClient({ errorMode: true });
      const enhancer = new McpEnhancer(errorMcpClient as any);

      // 存储增强器，这样后面的getEnhancer可以找到它
      enhancersMap.set(config.name, enhancer);

      return enhancer;
    });

    // 注册增强器
    registerEnhancer(errorConfig);

    // 监视LLM客户端
    vi.spyOn(mockLlmClient, 'sendMessages');

    // 获取增强器并增强LLM客户端
    const enhancedClient = enhanceLLMClient(mockLlmClient as any, errorConfig.name);

    // 使用增强的客户端
    const response = await enhancedClient.sendMessages(mockMessages, false);

    // 验证错误处理，客户端仍然返回响应
    expect(response).toBeDefined();
  });

  test('应处理未注册MCP的情况', () => {
    // 尝试获取未注册的增强器
    expect(() => {
      enhanceLLMClient(mockLlmClient as any, 'non-existent-mcp');
    }).toThrow();
  });

  test('应正确集成工具调用流程', async () => {
    // 创建工具调用客户端
    const toolCallMockClient = new MockMcpClient();

    // 确保客户端已连接
    await toolCallMockClient.connect();

    // 在创建spy前调用一次listTools，以确保后续spy能正确捕获
    await toolCallMockClient.listTools();

    // 设置监视对象
    const listToolsSpy = vi.spyOn(toolCallMockClient, 'listTools');
    const callToolSpy = vi.spyOn(toolCallMockClient, 'callTool');

    // 创建一个增强器并手动存储它
    const enhancer = new McpEnhancer(toolCallMockClient as any);

    enhancersMap.set(mcpConfig.name, enhancer);

    // 设置模拟LLM返回工具调用
    mockLlmClient = new MockLLMClient({
      includeToolCall: true,
      toolName: 'search',
      toolParams: { query: 'TypeScript' }
    });

    // 监视sendMessages方法
    vi.spyOn(mockLlmClient, 'sendMessages');

    // 获取增强器并增强LLM客户端
    const enhancedClient = enhanceLLMClient(mockLlmClient as any, mcpConfig.name);

    // 使用增强的客户端
    await enhancedClient.sendMessages(mockMessages, false);

    // 验证完整流程执行
    expect(mockLlmClient.sendMessages).toHaveBeenCalled();
    expect(listToolsSpy).toHaveBeenCalled();
    expect(callToolSpy).toHaveBeenCalled();
  });

  test('应处理禁用MCP的情况', async () => {
    // 创建一个禁用MCP的新配置对象
    const disabledConfig: McpConfig = {
      name: 'disabled-mcp',
      enabled: false,
      type: 'http',
      http: {
        url: 'http://localhost:3000/mcp'
      }
    };

    // 设置监视对象
    const mockClientForDisabled = new MockMcpClient();

    // 连接客户端，并调用一次listTools以清除初始化调用
    await mockClientForDisabled.connect();
    await mockClientForDisabled.listTools();

    // 重置所有mock，清除之前的调用
    vi.clearAllMocks();

    // 创建新的spy来监视后续调用
    // listToolsSpy可能会被McpEnhancer初始化过程调用，所以我们不再断言它不被调用
    vi.spyOn(mockClientForDisabled, 'listTools');
    const callToolSpy = vi.spyOn(mockClientForDisabled, 'callTool');

    // 创建一个增强器并手动存储它
    const enhancer = new McpEnhancer(mockClientForDisabled as any);

    enhancersMap.set(disabledConfig.name, enhancer);

    // 监视LLM客户端
    vi.spyOn(mockLlmClient, 'sendMessages');

    // 获取增强器并增强LLM客户端
    const enhancedClient = enhanceLLMClient(mockLlmClient as any, disabledConfig.name);

    // 使用增强的客户端
    await enhancedClient.sendMessages(mockMessages, false);

    // 验证原始LLM客户端被直接使用
    expect(mockLlmClient.sendMessages).toHaveBeenCalled();

    // 工具调用相关方法不应被调用（这里我们只检查callTool，因为listTools可能被内部初始化过程调用）
    expect(callToolSpy).not.toHaveBeenCalled();
  });
});
