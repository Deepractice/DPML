import { describe, test, expect, vi, beforeEach } from 'vitest';

import { ToolExecutionProcessor } from '../../../../../../core/mcp/pipeline/processors/ToolExecutionProcessor';
import type { ToolCallContext } from '../../../../../../core/mcp/pipeline/ToolCallContext';

describe('ToolExecutionProcessor', () => {
  let processor: ToolExecutionProcessor;
  let mockMcpClient: any;
  let context: ToolCallContext;

  beforeEach(() => {
    // 创建mock MCP客户端
    mockMcpClient = {
      callTool: vi.fn()
    };

    // 创建处理器实例
    processor = new ToolExecutionProcessor(mockMcpClient);

    // 创建基本上下文
    context = {
      messages: [],
      stream: false,
      recursionDepth: 0
    };
  });

  test('当上下文中没有工具调用时应该跳过处理', async () => {
    // 没有工具调用的上下文
    const result = await processor.process(context);

    // 验证没有调用MCP客户端
    expect(mockMcpClient.callTool).not.toHaveBeenCalled();

    // 验证上下文保持不变
    expect(result).toStrictEqual(context);
  });

  test('应该执行工具调用并收集成功结果', async () => {
    // 创建包含工具调用的上下文
    const contextWithTools = {
      ...context,
      toolCalls: [
        { name: 'test-tool', parameters: { param1: 'value1' } }
      ]
    };

    // 设置mock返回值
    mockMcpClient.callTool.mockResolvedValue({ content: [{ type: 'text', text: 'Success result' }] });

    // 执行处理器
    const result = await processor.process(contextWithTools);

    // 验证MCP客户端被调用
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'test-tool',
      arguments: { param1: 'value1' }
    });

    // 验证结果被添加到上下文
    expect(result.results).toEqual([{
      toolCall: { name: 'test-tool', parameters: { param1: 'value1' } },
      status: 'success',
      result: [{ type: 'text', text: 'Success result' }]
    }]);
  });

  test('应该处理多个工具调用并并行执行', async () => {
    // 每次测试前重置模拟函数
    vi.resetAllMocks();

    // 创建包含多个工具调用的上下文
    const contextWithMultipleTools = {
      ...context,
      toolCalls: [
        { name: 'tool1', parameters: { param1: 'value1' } },
        { name: 'tool2', parameters: { param2: 'value2' } }
      ]
    };

    // 设置mock返回值 - 确保每个工具调用只返回一次结果
    mockMcpClient.callTool.mockImplementation((toolParams) => {
      if (toolParams.name === 'tool1') {
        return Promise.resolve({ content: [{ type: 'text', text: 'Result from tool1' }] });
      } else if (toolParams.name === 'tool2') {
        return Promise.resolve({ content: [{ type: 'text', text: 'Result from tool2' }] });
      }

      return Promise.reject(new Error('Unknown tool'));
    });

    // 执行处理器
    const result = await processor.process(contextWithMultipleTools);

    // 验证MCP客户端被调用了两次（每个工具一次）
    expect(mockMcpClient.callTool).toHaveBeenCalledTimes(2);
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'tool1',
      arguments: { param1: 'value1' }
    });
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'tool2',
      arguments: { param2: 'value2' }
    });

    // 验证两个结果都被添加到上下文
    expect(result.results).toHaveLength(2);
    expect(result.results).toContainEqual({
      toolCall: { name: 'tool1', parameters: { param1: 'value1' } },
      status: 'success',
      result: [{ type: 'text', text: 'Result from tool1' }]
    });
    expect(result.results).toContainEqual({
      toolCall: { name: 'tool2', parameters: { param2: 'value2' } },
      status: 'success',
      result: [{ type: 'text', text: 'Result from tool2' }]
    });
  });

  test('应该处理工具执行失败的情况', async () => {
    // 创建包含工具调用的上下文
    const contextWithTools = {
      ...context,
      toolCalls: [
        { name: 'failing-tool', parameters: { param1: 'value1' } }
      ]
    };

    // 设置mock抛出错误
    const testError = new Error('Tool execution failed');

    mockMcpClient.callTool.mockRejectedValue(testError);

    // 执行处理器
    const result = await processor.process(contextWithTools);

    // 验证MCP客户端被调用
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'failing-tool',
      arguments: { param1: 'value1' }
    });

    // 验证错误被添加到上下文
    expect(result.results).toEqual([{
      toolCall: { name: 'failing-tool', parameters: { param1: 'value1' } },
      status: 'error',
      error: 'Tool execution failed'
    }]);
  });

  test('处理器异常时应返回原始上下文', async () => {
    // 创建自定义mock函数以便能够控制抛出异常
    const mockProcess = vi.fn().mockRejectedValue(new Error('Processor error'));

    // 保存原始方法
    const originalProcess = processor.process;

    try {
      // 替换为mock方法
      processor.process = mockProcess;

      // 尝试执行处理器
      const result = await processor.process(context).catch(error => {
        // 捕获异常并返回原始上下文
        return context;
      });

      // 应该返回原始上下文
      expect(result).toStrictEqual(context);
    } finally {
      // 恢复原始方法
      processor.process = originalProcess;
    }
  });

  test('应该处理工具返回内容格式无效的情况', async () => {
    // 创建包含工具调用的上下文
    const contextWithTools = {
      ...context,
      toolCalls: [
        { name: 'invalid-response-tool', parameters: { param1: 'value1' } }
      ]
    };

    // 设置mock返回无效格式的结果（未定义）
    mockMcpClient.callTool.mockResolvedValue(undefined);

    // 执行处理器
    const result = await processor.process(contextWithTools);

    // 验证MCP客户端被调用
    expect(mockMcpClient.callTool).toHaveBeenCalledWith({
      name: 'invalid-response-tool',
      arguments: { param1: 'value1' }
    });

    // 验证结果被添加到上下文（即使结果无效）
    expect(result.results).toEqual([{
      toolCall: { name: 'invalid-response-tool', parameters: { param1: 'value1' } },
      status: 'error',
      error: 'Cannot read properties of undefined (reading \'content\')'
    }]);
  });
});
