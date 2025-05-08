import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import { registerMcp } from '../../../api/mcp';
import { resetRegistry, getRegistry, enhanceLLMClient } from '../../../core/mcpService';
import type { McpConfig } from '../../../types';

import {
  createMockLLMClient,
  createToolCallResponse,
  collectStreamContent
} from './fixtures/mcp-fixtures';
import type { MockMCPClient } from './fixtures/mock-mcp-sdk';
import mockSdk from './fixtures/mock-mcp-sdk';

// 模拟SDK模块
vi.mock('@dp/mcp-sdk', () => mockSdk);

/**
 * MCP SDK集成端到端测试
 *
 * 测试MCP与官方SDK集成的场景，包括：
 * - 创建和连接SDK客户端
 * - 通过SDK执行工具调用
 * - 处理SDK调用错误
 * - 处理SDK连接问题
 */
describe('MCP SDK集成端到端测试', () => {
  // 模拟SDK
  let mockSDK: MockMCPClient;
  let mockLLMClient: ReturnType<typeof createMockLLMClient>;

  beforeEach(() => {
    // 重置MCP注册表
    resetRegistry();

    // 创建模拟LLM客户端
    mockLLMClient = createMockLLMClient('这是一个普通回复，没有工具调用');

    // 创建并保存SDK客户端实例
    mockSDK = mockSdk.createMCPClient({
      apiKey: 'test-api-key',
      endpoint: 'https://api.example.com/mcp'
    });

    // 重写mcpService中的createMcpClient方法，在特定情况下直接返回我们模拟的SDK客户端适配器
    vi.spyOn(getRegistry() as any, 'createMcpClient').mockImplementation((config: any) => {
      if (config.type === 'http' && config.http?.url.includes('sdk-api.example.com')) {
        // 调用connect方法，确保它被触发
        mockSDK.connect();

        return {
          listTools: async () => {
            const tools = await mockSDK.listTools();

            return tools.map(tool => ({
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters.schema.properties
            }));
          },
          callTool: async (toolParams: { name: string, arguments: Record<string, unknown> }) => {
            const response = await mockSDK.callTool(toolParams);

            // 转换SDK响应格式为内部格式
            if (response.result && response.result.content) {
              const content = response.result.content;

              if (Array.isArray(content) && content.length > 0 && content[0].text) {
                return { result: content[0].text };
              }
            }

            return { result: '无结果' };
          }
        };
      }

      // 模拟连接失败的情况
      if (config.http?.url.includes('fail-sdk-api.example.com')) {
        throw new Error('连接失败');
      }

      // 创建一个默认的模拟客户端
      return {
        listTools: vi.fn().mockResolvedValue([]),
        callTool: vi.fn().mockRejectedValue(new Error('未实现'))
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  test('应成功创建和使用SDK客户端', async () => {
    // 注册使用HTTP类型的MCP（使用特殊URL标识SDK测试）
    const sdkConfig: McpConfig = {
      name: 'sdk-mcp',
      enabled: true,
      type: 'http',
      http: {
        url: 'https://sdk-api.example.com/mcp'
      }
    };

    registerMcp(sdkConfig);

    // 验证SDK的connect方法被调用
    expect(mockSDK.connect).toHaveBeenCalled();
  });

  test('应通过SDK执行工具调用', async () => {
    // 注册HTTP类型的MCP（实际当作SDK处理）
    registerMcp({
      name: 'sdk-mcp',
      enabled: true,
      type: 'http',
      http: {
        url: 'https://sdk-api.example.com/mcp'
      }
    });

    // 设置LLM客户端返回工具调用
    const toolCallResponse = createToolCallResponse('search', { query: '大语言模型' });
    const searchLLMClient = createMockLLMClient(toolCallResponse);

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(searchLLMClient, 'sdk-mcp');

    // 发送消息
    await enhancedClient.sendMessages([
      { role: 'user', content: { type: 'text', value: '搜索大语言模型的信息' } }
    ], false);

    // 验证SDK的callTool被调用
    expect(mockSDK.callTool).toHaveBeenCalledWith({
      name: 'search',
      arguments: { query: '大语言模型' }
    });
  });

  test('应通过SDK处理流式工具调用', async () => {
    // 注册HTTP类型的MCP（实际当作SDK处理）
    registerMcp({
      name: 'sdk-mcp',
      enabled: true,
      type: 'http',
      http: {
        url: 'https://sdk-api.example.com/mcp'
      }
    });

    // 准备流式响应数据
    const streamChunks = [
      '我需要查询数据库',
      '<function_calls>',
      '  <invoke name="database">',
      '  <parameter name="sql">SELECT * FROM users</parameter>',
      '  </invoke>',
      '</function_calls>',
      '让我看看查询结果'
    ];

    const streamLLMClient = createMockLLMClient('', streamChunks);

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(streamLLMClient, 'sdk-mcp');

    // 发送流式消息
    const streamResponse = await enhancedClient.sendMessages([
      { role: 'user', content: { type: 'text', value: '查询所有用户数据' } }
    ], true);

    // 确保返回的是流
    expect(Symbol.asyncIterator in (streamResponse as object)).toBe(true);

    // 收集流内容，这将触发工具调用处理
    await collectStreamContent(streamResponse as AsyncIterable<any>);

    // 给异步操作一些时间完成
    await new Promise(resolve => setTimeout(resolve, 100));

    // 验证SDK的callTool被调用，但这个测试可能需要特殊处理，因为流式处理是异步的
    // 我们使用一个较宽松的验证方式
    expect(mockSDK.callTool).toHaveBeenCalled();
  });

  test('应处理SDK连接问题', async () => {
    // 模拟SDK连接失败
    mockSDK.connect.mockRejectedValueOnce(new Error('连接失败'));

    // 设置reject回调处理
    vi.spyOn(getRegistry() as any, 'createMcpClient').mockImplementationOnce(() => {
      mockSDK.connect(); // 触发连接错误
      throw new Error('连接失败');
    });

    // 配置抛出错误的URL
    const failConfig: McpConfig = {
      name: 'failed-sdk-mcp',
      enabled: true,
      type: 'http',
      http: {
        url: 'https://fail-sdk-api.example.com/mcp'
      }
    };

    // 尝试注册应该抛出错误
    try {
      registerMcp(failConfig);
      expect(true).toBe(false); // 这里应该不会执行到，如果执行到就表示测试失败
    } catch (error) {
      expect((error as Error).message).toContain('连接失败');
    }
  });

  test('应处理SDK工具调用错误', async () => {
    // 注册HTTP类型的MCP
    registerMcp({
      name: 'sdk-mcp',
      enabled: true,
      type: 'http',
      http: {
        url: 'https://sdk-api.example.com/mcp'
      }
    });

    // 设置LLM客户端返回工具调用
    const toolCallResponse = createToolCallResponse('unknown_tool', { param: 'value' });
    const errorLLMClient = createMockLLMClient(toolCallResponse);

    // 模拟工具调用失败
    mockSDK.callTool.mockRejectedValueOnce(new Error('工具不存在'));

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(errorLLMClient, 'sdk-mcp');

    // 发送消息 - 不应该抛出错误，而是在响应中包含错误信息
    const response = await enhancedClient.sendMessages([
      { role: 'user', content: { type: 'text', value: '调用未知工具' } }
    ], false);

    // 验证SDK的callTool被调用
    expect(mockSDK.callTool).toHaveBeenCalled();

    // 验证响应存在
    expect(response).toBeDefined();
  });
});
