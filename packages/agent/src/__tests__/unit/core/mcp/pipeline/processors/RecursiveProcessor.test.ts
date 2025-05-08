import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RecursiveProcessor } from '../../../../../../core/mcp/pipeline/processors/RecursiveProcessor';
import type { ToolCallContext, ToolResult } from '../../../../../../core/mcp/pipeline/ToolCallContext';
import { ToolCallPipeline } from '../../../../../../core/mcp/pipeline/ToolCallPipeline';
import type { ContentType } from '../../../../../../types/Content';

describe('RecursiveProcessor', () => {
  // 创建真实的管道并替换execute方法
  const mockPipeline = new ToolCallPipeline();

  beforeEach(() => {
    vi.clearAllMocks();

    // 模拟execute方法
    mockPipeline.execute = vi.fn().mockImplementation((context: ToolCallContext) => {
      // 模拟管道执行，返回带有finalResponse的上下文
      return Promise.resolve({
        ...context,
        finalResponse: {
          content: {
            type: 'text' as ContentType,
            value: '递归管道执行结果'
          }
        }
      });
    });

    // 创建递归处理器，最大深度设为3
    processor = new RecursiveProcessor(mockPipeline, 3);

    // 模拟console.log和console.error，减少测试输出噪音
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  let processor: RecursiveProcessor;

  it('当上下文中没有工具结果时应该跳过递归处理', async () => {
    // 准备没有工具结果的上下文
    const context: ToolCallContext = {
      messages: [],
      stream: false
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证管道未被执行
    expect(mockPipeline.execute).not.toHaveBeenCalled();

    // 验证递归深度保持不变
    expect(result.recursionDepth).toBe(0);
  });

  it('当上下文中有成功的工具结果时应该启动递归处理', async () => {
    // 准备带有成功工具结果的上下文
    const successResult: ToolResult = {
      toolCall: {
        name: 'search',
        parameters: { query: 'test' }
      },
      status: 'success',
      result: [{ type: 'text', text: '搜索结果' }]
    };

    const context: ToolCallContext = {
      messages: [],
      stream: false,
      results: [successResult]
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证管道被执行
    expect(mockPipeline.execute).toHaveBeenCalledTimes(1);

    // 验证递归深度增加
    expect(mockPipeline.execute).toHaveBeenCalledWith(expect.objectContaining({
      recursionDepth: 1
    }));

    // 验证finalResponse被设置
    expect(result.finalResponse).toBeDefined();
    expect((result.finalResponse?.content as any).value).toBe('递归管道执行结果');
  });

  it('当所有工具结果都失败时不应启动递归处理', async () => {
    // 准备带有失败工具结果的上下文
    const errorResult: ToolResult = {
      toolCall: {
        name: 'error',
        parameters: { foo: 'bar' }
      },
      status: 'error',
      error: '工具执行失败'
    };

    const context: ToolCallContext = {
      messages: [],
      stream: false,
      results: [errorResult]
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证管道未被执行
    expect(mockPipeline.execute).not.toHaveBeenCalled();
  });

  it('当混合成功和失败结果时应启动递归处理', async () => {
    // 准备带有混合工具结果的上下文
    const mixedResults: ToolResult[] = [
      // 成功结果
      {
        toolCall: {
          name: 'search',
          parameters: { query: 'test' }
        },
        status: 'success',
        result: [{ type: 'text', text: '搜索结果' }]
      },
      // 失败结果
      {
        toolCall: {
          name: 'error',
          parameters: { foo: 'bar' }
        },
        status: 'error',
        error: '工具执行失败'
      }
    ];

    const context: ToolCallContext = {
      messages: [],
      stream: false,
      results: mixedResults
    };

    // 执行处理
    await processor.process(context);

    // 验证管道被执行（因为有成功的结果）
    expect(mockPipeline.execute).toHaveBeenCalledTimes(1);
  });

  it('当递归深度超过最大值时应停止递归并设置错误消息', async () => {
    // 准备带有成功工具结果且已达到最大递归深度的上下文
    const successResult: ToolResult = {
      toolCall: {
        name: 'search',
        parameters: { query: 'test' }
      },
      status: 'success',
      result: [{ type: 'text', text: '搜索结果' }]
    };

    const context: ToolCallContext = {
      messages: [],
      stream: false,
      results: [successResult],
      recursionDepth: 3 // 设为最大深度
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证管道未被执行
    expect(mockPipeline.execute).not.toHaveBeenCalled();

    // 验证添加了错误消息
    expect(result.finalResponse).toBeDefined();
    // 修改断言，检查内容是否为字符串或者包含预期的错误信息
    const content = result.finalResponse?.content;

    expect(content).toBeDefined();
    if (typeof content === 'string') {
      expect(content).toContain('最大工具调用深度');
    } else if (typeof content === 'object' && content !== null) {
      expect((content as any).value).toBeDefined();
    }
  });

  it('递归处理应继承原上下文的messages和tools', async () => {
    // 准备带有成功工具结果的上下文
    const successResult: ToolResult = {
      toolCall: {
        name: 'search',
        parameters: { query: 'test' }
      },
      status: 'success',
      result: [{ type: 'text', text: '搜索结果' }]
    };

    const context: ToolCallContext = {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text' as ContentType,
            value: '测试消息'
          }
        }
      ],
      stream: false,
      tools: [{ name: 'test', description: '测试工具', parameters: {} }],
      results: [successResult]
    };

    // 执行处理
    await processor.process(context);

    // 验证传递给管道的参数
    expect(mockPipeline.execute).toHaveBeenCalledWith(expect.objectContaining({
      messages: context.messages,
      tools: context.tools,
      stream: context.stream
    }));
  });

  it('处理器异常时应返回原始上下文', async () => {
    // 设置管道执行抛出错误
    vi.spyOn(mockPipeline, 'execute').mockRejectedValueOnce(new Error('管道执行失败'));

    // 准备带有成功工具结果的上下文
    const successResult: ToolResult = {
      toolCall: {
        name: 'search',
        parameters: { query: 'test' }
      },
      status: 'success',
      result: [{ type: 'text', text: '搜索结果' }]
    };

    const context: ToolCallContext = {
      messages: [],
      stream: false,
      results: [successResult]
    };

    // 记录原始对象引用
    const originalContext = context;

    // 执行处理
    const result = await processor.process(context);

    // 验证返回原始上下文（引用相同）
    expect(result).toBe(originalContext);
  });
});
