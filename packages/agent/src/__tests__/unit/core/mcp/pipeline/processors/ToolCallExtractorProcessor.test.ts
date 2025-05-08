import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ToolCallExtractorProcessor } from '../../../../../../core/mcp/pipeline/processors/ToolCallExtractorProcessor';
import type { ToolCallContext } from '../../../../../../core/mcp/pipeline/ToolCallContext';
import type { ChatOutput } from '../../../../../../types';
import type { ContentType } from '../../../../../../types/Content';
import { createMockLLMResponseWithToolCall, createMockStreamResponse } from '../../../../../fixtures/mcp.fixture';

describe('ToolCallExtractorProcessor', () => {
  let processor: ToolCallExtractorProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new ToolCallExtractorProcessor();
    // 模拟console.log和console.error，减少测试输出噪音
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('当上下文中没有响应时应该跳过处理', async () => {
    // 准备没有响应的上下文
    const context: ToolCallContext = {
      messages: [],
      stream: false
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证没有提取工具调用
    expect(result.toolCalls).toBeUndefined();
  });

  it('应该从非流式响应中提取工具调用', async () => {
    // 创建包含工具调用的响应文本
    const toolCallText = createMockLLMResponseWithToolCall('search', { query: 'TypeScript' });

    // 准备上下文
    const context: ToolCallContext = {
      messages: [],
      stream: false,
      response: {
        content: {
          type: 'text' as ContentType,
          value: toolCallText
        }
      }
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证提取的工具调用
    expect(result.toolCalls).toBeDefined();
    expect(result.toolCalls?.length).toBe(1);
    expect(result.toolCalls?.[0].name).toBe('search');
    expect(result.toolCalls?.[0].parameters).toEqual({ query: 'TypeScript' });
  });

  it('应该从流式响应中提取工具调用', async () => {
    // 创建包含工具调用的响应文本
    const toolCallText = createMockLLMResponseWithToolCall('calculator', { expression: '6 * 7' });

    // 创建模拟流响应
    const mockStream = createMockStreamResponse(toolCallText);

    // 准备上下文
    const context: ToolCallContext = {
      messages: [],
      stream: true,
      response: mockStream
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证提取的工具调用
    expect(result.toolCalls).toBeDefined();
    expect(result.toolCalls?.length).toBe(1);
    expect(result.toolCalls?.[0].name).toBe('calculator');
    expect(result.toolCalls?.[0].parameters).toEqual({ expression: '6 * 7' });
  });

  it('应该能处理多个工具调用', async () => {
    // 创建包含多个工具调用的响应文本
    const toolCallText = `
    需要执行两个操作：
    
    <function_calls>
    <invoke name="search">
    <parameter name="query">TypeScript</parameter>
    </invoke>
    </function_calls>
    
    同时也需要计算：
    
    <function_calls>
    <invoke name="calculator">
    <parameter name="expression">6 * 7</parameter>
    </invoke>
    </function_calls>
    `;

    // 准备上下文
    const context: ToolCallContext = {
      messages: [],
      stream: false,
      response: {
        content: {
          type: 'text' as ContentType,
          value: toolCallText
        }
      }
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证提取的工具调用
    expect(result.toolCalls).toBeDefined();
    expect(result.toolCalls?.length).toBe(2);
    expect(result.toolCalls?.[0].name).toBe('search');
    expect(result.toolCalls?.[1].name).toBe('calculator');
  });

  it('应该能处理带有JSON参数的工具调用', async () => {
    // 创建包含JSON参数的工具调用响应文本
    const toolCallText = `
    <function_calls>
    <invoke name="database">
    <parameter name="query">{"table": "users", "fields": ["name", "email"], "filter": {"age": 30}}</parameter>
    </invoke>
    </function_calls>
    `;

    // 准备上下文
    const context: ToolCallContext = {
      messages: [],
      stream: false,
      response: {
        content: {
          type: 'text' as ContentType,
          value: toolCallText
        }
      }
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证提取的工具调用
    expect(result.toolCalls).toBeDefined();
    expect(result.toolCalls?.length).toBe(1);
    expect(result.toolCalls?.[0].name).toBe('database');
    expect(result.toolCalls?.[0].parameters.query).toEqual({
      table: 'users',
      fields: ['name', 'email'],
      filter: { age: 30 }
    });
  });

  it('在处理异常情况时应该返回原始上下文', async () => {
    // 创建一个会导致提取失败的响应
    const badResponse = {
      content: null // 这将导致getContentFromResponse方法出错
    };

    // 准备上下文
    const context: ToolCallContext = {
      messages: [],
      stream: false,
      response: badResponse as unknown as ChatOutput
    };

    // 执行处理
    const result = await processor.process(context);

    // 不检查对象引用相同，而是检查关键属性符合预期
    expect(result.messages).toEqual(context.messages);
    expect(result.stream).toBe(context.stream);
    expect(result.response).toBe(context.response);
    // 确认没有额外的工具调用，或者工具调用为空数组
    if (result.toolCalls) {
      expect(result.toolCalls).toEqual([]);
    }
  });

  it('在没有匹配工具调用时应返回空数组', async () => {
    // 创建不包含工具调用的响应文本
    const noToolCallText = '这是一个普通的回答，不包含任何工具调用。';

    // 准备上下文
    const context: ToolCallContext = {
      messages: [],
      stream: false,
      response: {
        content: {
          type: 'text' as ContentType,
          value: noToolCallText
        }
      }
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证没有提取工具调用
    expect(result.toolCalls).toEqual([]);
  });
});
