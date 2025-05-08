import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import { registerMcp } from '../../../api/mcp';
import { resetRegistry, getRegistry, enhanceLLMClient } from '../../../core/mcpService';

import {
  createMockLLMClient,
  createMockMcpClient,
  createMockMcpConfig,
  createToolCallResponse,
  collectStreamContent
} from './fixtures/mcp-fixtures';

/**
 * MCP用户交互端到端测试
 *
 * 测试用户与MCP功能交互的完整场景，包括：
 * - 普通对话（无工具调用）
 * - 单次工具调用
 * - 多轮工具调用
 * - 流式输出与工具调用
 */
describe('MCP用户交互端到端测试', () => {
  // Mock MCP客户端和LLM客户端
  let mockMcpClient: ReturnType<typeof createMockMcpClient>;
  let mockLLMClient: ReturnType<typeof createMockLLMClient>;

  beforeEach(() => {
    // 重置MCP注册表
    resetRegistry();

    // 创建模拟客户端
    mockMcpClient = createMockMcpClient();
    mockLLMClient = createMockLLMClient('这是一个普通回复，没有工具调用');

    // 模拟MCP客户端创建
    vi.spyOn(getRegistry() as any, 'createMcpClient')
      .mockReturnValue(mockMcpClient);

    // 注册MCP增强器
    registerMcp(createMockMcpConfig('test-mcp'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('应支持普通对话（无工具调用）', async () => {
    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(mockLLMClient, 'test-mcp');

    // 发送消息
    const response = await enhancedClient.sendMessages([
      { role: 'user', content: { type: 'text', value: '什么是JavaScript？' } }
    ], false);

    // 验证响应
    expect(response).toBeDefined();
    if ('content' in response) {
      const content = response.content;

      if (typeof content === 'object' && 'type' in content && content.type === 'text') {
        expect(content.value).toBe('这是一个普通回复，没有工具调用');
      } else {
        expect.fail('响应内容格式不正确');
      }
    } else {
      expect.fail('响应不是ChatOutput类型');
    }

    // 验证工具没有被调用
    expect(mockMcpClient.callTool).not.toHaveBeenCalled();
  });

  test('应支持单次工具调用对话', async () => {
    // 创建包含工具调用的响应
    const toolCallResponse = createToolCallResponse('weather', { city: '北京' });
    const weatherLLMClient = createMockLLMClient(toolCallResponse);

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(weatherLLMClient, 'test-mcp');

    // 发送消息
    await enhancedClient.sendMessages([
      { role: 'user', content: { type: 'text', value: '北京今天天气如何？' } }
    ], false);

    // 验证工具被调用，使用匹配实际调用格式的断言
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'weather',
      arguments: { city: '北京' }
    });
  });

  test('应支持多轮工具调用对话', async () => {
    // 创建第一轮工具调用的响应（使用weather工具）
    const firstToolCallResponse = createToolCallResponse('weather', { city: '上海' });
    const firstLLMClient = createMockLLMClient(firstToolCallResponse);

    // 创建增强的LLM客户端
    const enhancedClient = enhanceLLMClient(firstLLMClient, 'test-mcp');

    // 连接客户端，确保可以调用工具
    await mockMcpClient.connect();

    // 第一次发送消息，使用weather工具
    await enhancedClient.sendMessages([
      { role: 'user', content: { type: 'text', value: '上海今天天气如何？' } }
    ], false);

    // 验证weather工具被调用
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'weather',
      arguments: { city: '上海' }
    });

    // 清除前一次调用的记录
    vi.clearAllMocks();

    // 为第二轮准备新的模拟响应
    const secondToolCallResponse = createToolCallResponse('weather', { city: '北京' });

    // 模拟LLM客户端返回第二个响应
    firstLLMClient.sendMessages = vi.fn().mockResolvedValue({
      content: {
        type: 'text',
        value: secondToolCallResponse
      }
    });

    // 重新为callTool方法创建一个新的spy以跟踪第二次调用
    vi.spyOn(mockMcpClient, 'callTool');

    // 第二次发送消息
    await enhancedClient.sendMessages([
      { role: 'user', content: { type: 'text', value: '北京今天温度是多少？' } }
    ], false);

    // 验证第二次调用使用了预期的参数
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'weather',
      arguments: { city: '北京' }
    });
  });

  test('应支持流式输出与工具调用', async () => {
    // 准备流式响应数据
    const streamChunks = [
      '我需要查询天气信息',
      '<function_calls>',
      '  <invoke name="weather">',
      '  <parameter name="city">北京</parameter>',
      '  </invoke>',
      '</function_calls>',
      '让我看看天气结果'
    ];

    const streamLLMClient = createMockLLMClient('', streamChunks);

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(streamLLMClient, 'test-mcp');

    // 连接客户端，确保可以调用工具
    await mockMcpClient.connect();

    // 发送流式消息
    const streamResponse = await enhancedClient.sendMessages([
      { role: 'user', content: { type: 'text', value: '北京今天天气如何？' } }
    ], true);

    // 确保返回的是流
    expect(Symbol.asyncIterator in (streamResponse as object)).toBe(true);

    // 手动触发流处理 (通过收集内容强制处理流)
    await collectStreamContent(streamResponse as AsyncIterable<any>);

    // 验证工具被调用，使用匹配实际调用格式的断言
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'weather',
      arguments: { city: '北京' }
    });
  });
});
