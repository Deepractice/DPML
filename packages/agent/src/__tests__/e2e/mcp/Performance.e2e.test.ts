import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import { registerMcp } from '../../../api/mcp';
import { resetRegistry, getRegistry, enhanceLLMClient } from '../../../core/mcpService';

import {
  createMockLLMClient,
  createMockMcpClient,
  createMockMcpConfig,
  createToolCallResponse,
  PerformanceHelper
} from './fixtures/mcp-fixtures';

/**
 * MCP性能和并发测试
 *
 * 测试MCP模块在高负载和并发情况下的性能表现，包括：
 * - 并行处理多个工具调用的能力
 * - 处理大型响应内容的性能
 * - 高负载下的内存使用情况
 * - 资源限制情况下的行为
 */
describe('MCP性能和并发测试', () => {
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

  test('应能并行处理多个工具调用', async () => {
    // 创建包含多个工具调用的响应
    const multiToolResponse = PerformanceHelper.createMultiToolCallContent(5); // 5个工具调用

    mockLLMClient = createMockLLMClient(multiToolResponse);

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(mockLLMClient, 'test-mcp');

    // 监视工具执行方法
    const executeSpy = vi.spyOn(mockMcpClient, 'callTool');

    // 模拟工具执行，添加随机延迟以模拟真实情况
    executeSpy.mockImplementation(async (params) => {
      const { name, arguments: args } = params;
      // 添加随机延迟，介于50-200毫秒之间
      const delay = 50 + Math.random() * 150;

      await new Promise(resolve => setTimeout(resolve, delay));

      // 返回结果
      switch (name) {
        case 'search':
          return { result: `搜索"${args.query}"的结果` };
        case 'weather':
          return { result: `${args.city}的天气：晴天，25°C` };
        case 'calculator':
          try {
            const result = eval(String(args.expression));

            return { result: `计算结果：${result}` };
          } catch (error) {
            return { result: `计算错误：${(error as Error).message}` };
          }

        default:
          return { result: '未知工具' };
      }
    });

    // 使用PerformanceHelper测量执行时间
    const { result, duration } = await PerformanceHelper.measureAsync('multiToolExecution', async () => {
      // 发送消息
      return enhancedClient.sendMessages([
        { role: 'user', content: { type: 'text', value: '执行多个工具调用' } }
      ], false);
    });

    // 验证工具被并行调用，而非串行（总时间应该小于所有工具单独执行时间之和）
    expect(executeSpy).toHaveBeenCalledTimes(5);

    // 假设每个工具平均执行125ms，5个工具串行执行需要625ms
    // 并行执行应该显著少于这个时间（大约是最长延迟的工具时间，例如约200ms加上一些处理开销）
    expect(duration).toBeLessThan(500); // 500ms是一个宽松的上限，并行执行应该远低于串行时间

    // 验证响应包含结果
    expect(result).toBeDefined();
  });

  test('应在处理大型内容时保持性能', async () => {
    // 创建大型内容的响应
    const largeContent = PerformanceHelper.createLargeContent(100) + '\n\n' +
      createToolCallResponse('search', { query: '大型查询' }, false);

    mockLLMClient = createMockLLMClient(largeContent);

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(mockLLMClient, 'test-mcp');

    // 监视工具执行方法
    const executeSpy = vi.spyOn(mockMcpClient, 'callTool');

    executeSpy.mockResolvedValue({ result: '搜索结果' });

    // 使用PerformanceHelper测量执行时间
    const { result, duration } = await PerformanceHelper.measureAsync('largeContentProcessing', async () => {
      // 发送消息
      return enhancedClient.sendMessages([
        { role: 'user', content: { type: 'text', value: '处理大型内容' } }
      ], false);
    });

    // 验证工具被调用
    expect(executeSpy).toHaveBeenCalledWith({
      name: 'search',
      arguments: { query: '大型查询' }
    });

    // 验证响应包含结果
    expect(result).toBeDefined();

    // 验证性能在合理范围内
    // 即使是大型内容，提取和处理工具调用也应该相对高效（通常不超过100-200ms）
    // 这里的具体阈值需要根据实际情况进行调整
    expect(duration).toBeLessThan(500);
  });

  test('应在多轮工具调用时保持内存使用稳定', async () => {
    // 这个测试验证多轮工具调用不会导致内存泄漏或使用过多内存
    // 我们将模拟10轮工具调用，每轮都生成一个新的工具调用

    // 准备递增的轮次计数器
    let round = 0;

    // 准备模拟LLM客户端，每次都返回一个新的工具调用
    mockLLMClient.sendMessages = vi.fn().mockImplementation(() => {
      round++;

      return Promise.resolve({
        content: {
          type: 'text',
          value: createToolCallResponse('search', { query: `查询${round}` })
        }
      });
    });

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(mockLLMClient, 'test-mcp');

    // 监视工具执行方法
    const executeSpy = vi.spyOn(mockMcpClient, 'callTool');

    executeSpy.mockImplementation((params) => {
      const { arguments: args } = params;

      return Promise.resolve({
        result: `搜索"${args.query}"的结果`
      });
    });

    // 记录初始内存使用
    const initialMemoryUsage = process.memoryUsage().heapUsed;

    // 执行10轮工具调用
    for (let i = 0; i < 10; i++) {
      await enhancedClient.sendMessages([
        { role: 'user', content: { type: 'text', value: `轮次${i + 1}` } }
      ], false);
    }

    // 记录最终内存使用
    const finalMemoryUsage = process.memoryUsage().heapUsed;

    // 计算内存增长
    const memoryGrowth = finalMemoryUsage - initialMemoryUsage;

    // 验证工具被调用了10次
    expect(executeSpy).toHaveBeenCalledTimes(10);

    // 验证内存使用是合理的
    // 注意：这是一个粗略的检查，因为内存使用受到许多因素的影响，包括测试环境
    // 理想情况下，增长应该相对较小且线性，而不是指数级
    console.log(`内存使用增长: ${memoryGrowth} 字节`);

    // 由于JavaScript的垃圾回收机制，我们不能保证精确的内存使用量
    // 但我们可以检查它是否在合理范围内（例如，小于20MB）
    // 注意：这个阈值可能需要调整，取决于实际实现
    expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024); // 20MB
  });

  test('应优雅处理高并发请求', async () => {
    // 这个测试验证MCP模块在高并发请求下的表现
    // 我们将同时发送多个请求，每个请求都包含工具调用

    // 创建包含工具调用的响应
    const toolCallResponse = createToolCallResponse('search', { query: '测试查询' });

    mockLLMClient = createMockLLMClient(toolCallResponse);

    // 获取增强的LLM客户端
    const enhancedClient = enhanceLLMClient(mockLLMClient, 'test-mcp');

    // 监视工具执行方法
    const executeSpy = vi.spyOn(mockMcpClient, 'callTool');

    executeSpy.mockResolvedValue({ result: '搜索结果' });

    // 同时发送10个请求
    const concurrentRequests = 10;
    const startTime = performance.now();

    // 创建并发请求
    const requests = Array.from({ length: concurrentRequests }, (_, i) =>
      enhancedClient.sendMessages([
        { role: 'user', content: { type: 'text', value: `并发请求 ${i + 1}` } }
      ], false)
    );

    // 等待所有请求完成
    const responses = await Promise.all(requests);

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // 验证所有请求都成功完成
    expect(responses).toHaveLength(concurrentRequests);
    responses.forEach(response => {
      expect(response).toBeDefined();
    });

    // 验证工具被调用了10次
    expect(executeSpy).toHaveBeenCalledTimes(concurrentRequests);

    // 验证总时间是合理的（假设串行执行需要10 * x毫秒，并行应该显著更快）
    console.log(`处理${concurrentRequests}个并发请求的总时间: ${totalTime}ms`);

    // 验证处理时间在合理范围内
    // 这个阈值需要根据实际情况调整
    expect(totalTime).toBeLessThan(1000); // 假设1秒内应该能完成10个并发请求
  });
});
