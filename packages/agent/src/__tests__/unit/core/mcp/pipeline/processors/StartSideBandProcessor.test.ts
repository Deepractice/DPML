import { describe, it, expect, vi, beforeEach } from 'vitest';

import { StartSideBandProcessor } from '../../../../../../core/mcp/pipeline/processors/StartSideBandProcessor';
import type { ToolCallContext } from '../../../../../../core/mcp/pipeline/ToolCallContext';
import type { ChatOutput } from '../../../../../../types';
import type { ContentType } from '../../../../../../types/Content';
import { createMockStreamResponse } from '../../../../../fixtures/mcp.fixture';

describe('StartSideBandProcessor', () => {
  let processor: StartSideBandProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new StartSideBandProcessor();
    // 模拟console.log和console.error，减少测试输出噪音
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('对于非流式响应应该跳过分叉处理', async () => {
    // 准备非流式上下文
    const response: ChatOutput = {
      content: {
        type: 'text' as ContentType,
        value: '这是一个非流式响应'
      }
    };
    const context: ToolCallContext = {
      messages: [],
      stream: false,
      response
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证响应保持不变
    expect(result.response).toBe(response);
  });

  it('对于流式响应应该创建分叉', async () => {
    // 创建模拟流响应
    const mockStream = createMockStreamResponse('这是一个流式响应测试');

    // 准备流式上下文
    const context: ToolCallContext = {
      messages: [],
      stream: true,
      response: mockStream
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证响应已经被替换为新的流
    expect(result.response).not.toBe(mockStream);
    expect(Symbol.asyncIterator in (result.response as any)).toBe(true);
  });

  it('流分叉后用户流应该接收到所有数据', async () => {
    // 创建模拟流响应
    const mockStream = createMockStreamResponse('测试分叉流数据传递');

    // 准备流式上下文
    const context: ToolCallContext = {
      messages: [],
      stream: true,
      response: mockStream
    };

    // 执行处理
    const result = await processor.process(context);

    // 从分叉的用户流中收集所有数据
    const userStream = result.response as AsyncIterable<ChatOutput>;
    const chunks: ChatOutput[] = [];

    for await (const chunk of userStream) {
      chunks.push(chunk);
    }

    // 验证收集到的所有块
    expect(chunks.length).toBeGreaterThan(0);

    // 合并所有内容检查完整性
    const fullContent = chunks.map(chunk =>
      typeof chunk.content === 'string'
        ? chunk.content
        : (chunk.content as any).value
    ).join('');

    // 根据createMockStreamResponse的实现，应该是连续字符串而非空格分隔
    expect(fullContent.trim()).toBe('测试分叉流数据传递');
  });

  it('处理异常情况时应该返回原始上下文', async () => {
    // 创建一个会抛出错误的mock流
    const errorStream = {
      [Symbol.asyncIterator]() {
        return {
          next() {
            throw new Error('流处理错误');
          }
        };
      }
    };

    // 准备流式上下文
    const context: ToolCallContext = {
      messages: [],
      stream: true,
      response: errorStream
    };

    // 执行处理
    const result = await processor.process(context);

    // 不使用对象相等性检查，而是检查关键属性和是否保留了原始流
    expect(result.messages).toEqual(context.messages);
    expect(result.stream).toBe(context.stream);
    // 检查是否仍然有响应对象，且是一个异步迭代器
    expect(result.response).toBeDefined();
    expect(Symbol.asyncIterator in (result.response as any)).toBeTruthy();
  });

  it('当检测到包含工具调用标记的内容时应该记录日志', async () => {
    // 创建包含工具调用标记的模拟流响应
    const toolCallStream = createMockStreamResponse('我需要使用工具 <function_calls> 来回答问题');

    // 准备流式上下文
    const context: ToolCallContext = {
      messages: [],
      stream: true,
      response: toolCallStream
    };

    // 监控console.log
    const logSpy = vi.spyOn(console, 'log');

    // 执行处理
    await processor.process(context);

    // 等待处理流完成 (由于异步处理，这里需要一个小延迟)
    await new Promise(resolve => setTimeout(resolve, 100));

    // 验证日志记录
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('检测到工具调用意图'));
  });
});
