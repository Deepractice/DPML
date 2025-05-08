import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ResultFormattingProcessor } from '../../../../../../core/mcp/pipeline/processors/ResultFormattingProcessor';
import type { ToolCallContext, ToolResult } from '../../../../../../core/mcp/pipeline/ToolCallContext';
import type { ContentType } from '../../../../../../types/Content';
import { mockToolCalls } from '../../../../../fixtures/mcp.fixture';

describe('ResultFormattingProcessor', () => {
  let processor: ResultFormattingProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new ResultFormattingProcessor();
    // 模拟console.log和console.error，减少测试输出噪音
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('当上下文中没有工具结果时应该跳过处理', async () => {
    // 准备没有工具结果的上下文
    const context: ToolCallContext = {
      messages: [],
      stream: false
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证消息列表未改变
    expect(result.messages).toEqual([]);

    // 验证finalResponse未设置
    expect(result.finalResponse).toBeUndefined();
  });

  it('应该将成功的工具结果格式化为消息', async () => {
    // 准备工具结果
    const successResult: ToolResult = {
      toolCall: mockToolCalls[0], // 搜索工具调用
      status: 'success',
      result: [{
        type: 'text',
        text: '关于"TypeScript"的搜索结果：TypeScript是微软开发的JavaScript的超集编程语言。'
      }]
    };

    // 准备上下文
    const context: ToolCallContext = {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text' as ContentType,
            value: '什么是TypeScript？'
          }
        }
      ],
      stream: false,
      toolCalls: [mockToolCalls[0]],
      results: [successResult]
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证消息列表增加了两条消息
    expect(result.messages.length).toBe(3);

    // 验证第二条消息是助手消息，包含工具调用
    expect(result.messages[1].role).toBe('assistant');
    const assistantContent = result.messages[1].content as any;

    expect(assistantContent.type).toBe('text');
    expect(assistantContent.value).toContain('<function_calls>');
    expect(assistantContent.value).toContain(`<invoke name="${mockToolCalls[0].name}">`);
    expect(assistantContent.value).toContain(`<parameter name="query">TypeScript</parameter>`);

    // 验证第三条消息是系统消息，包含工具结果
    expect(result.messages[2].role).toBe('system');
    const resultContent = result.messages[2].content as any;

    expect(resultContent.type).toBe('text');
    expect(resultContent.value).toContain('工具执行结果');
    expect(resultContent.value).toContain('工具: search');
    expect(resultContent.value).toContain('状态: 成功');
    expect(resultContent.value).toContain('关于"TypeScript"的搜索结果');

    // 验证finalResponse已设置
    expect(result.finalResponse).toBeDefined();
    expect(result.finalResponse?.content).toEqual({
      type: 'text',
      value: ''
    });
  });

  it('应该正确处理失败的工具结果', async () => {
    // 准备失败的工具结果
    const errorResult: ToolResult = {
      toolCall: {
        name: 'error',
        parameters: { foo: 'bar' }
      },
      status: 'error',
      error: '工具执行失败了'
    };

    // 准备上下文
    const context: ToolCallContext = {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text' as ContentType,
            value: '请执行一个命令'
          }
        }
      ],
      stream: false,
      toolCalls: [{ name: 'error', parameters: { foo: 'bar' } }],
      results: [errorResult]
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证系统消息包含错误信息
    const resultContent = result.messages[2].content as any;

    expect(resultContent.value).toContain('状态: 失败');
    expect(resultContent.value).toContain('错误: 工具执行失败了');
  });

  it('应该能处理多个工具结果', async () => {
    // 准备多个工具结果
    const results: ToolResult[] = [
      // 搜索结果
      {
        toolCall: mockToolCalls[0],
        status: 'success',
        result: [{
          type: 'text',
          text: '关于"TypeScript"的搜索结果：TypeScript是微软开发的JavaScript的超集编程语言。'
        }]
      },
      // 计算器结果
      {
        toolCall: mockToolCalls[1],
        status: 'success',
        result: [{
          type: 'text',
          text: '计算结果为：42'
        }]
      }
    ];

    // 准备上下文
    const context: ToolCallContext = {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text' as ContentType,
            value: '什么是TypeScript？并计算6*7'
          }
        }
      ],
      stream: false,
      toolCalls: mockToolCalls,
      results
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证助手消息包含两个工具调用
    const assistantContent = result.messages[1].content as any;

    expect(assistantContent.value).toContain(`<invoke name="${mockToolCalls[0].name}">`);
    expect(assistantContent.value).toContain(`<invoke name="${mockToolCalls[1].name}">`);

    // 验证系统消息包含两个工具结果
    const resultContent = result.messages[2].content as any;

    expect(resultContent.value).toContain('工具: search');
    expect(resultContent.value).toContain('工具: calculator');
    expect(resultContent.value).toContain('关于"TypeScript"的搜索结果');
    expect(resultContent.value).toContain('计算结果为：42');
  });

  it('应该能处理非文本类型的工具结果', async () => {
    // 准备包含非文本类型结果的工具结果
    const complexResult: ToolResult = {
      toolCall: {
        name: 'getData',
        parameters: { type: 'json' }
      },
      status: 'success',
      result: [{
        type: 'json',
        data: {
          name: '测试数据',
          items: [1, 2, 3],
          metadata: { source: 'test' }
        }
      }]
    };

    // 准备上下文
    const context: ToolCallContext = {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text' as ContentType,
            value: '获取数据'
          }
        }
      ],
      stream: false,
      toolCalls: [{ name: 'getData', parameters: { type: 'json' } }],
      results: [complexResult]
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证系统消息包含JSON字符串
    const resultContent = result.messages[2].content as any;

    expect(resultContent.value).toContain('工具: getData');
    expect(resultContent.value).toContain('"type": "json"');
    expect(resultContent.value).toContain('"name": "测试数据"');
    expect(resultContent.value).toContain('"items": [');
  });

  it('处理器异常时应返回原始上下文', async () => {
    // 创建一个会导致处理器抛出异常的上下文
    const badContext: ToolCallContext = {
      messages: [],
      stream: false,
      toolCalls: [{ name: 'test', parameters: {} }],
      results: [{
        toolCall: null as any, // 这将导致createToolResultsMessage方法出错
        status: 'success' as const,
        result: [{ type: 'text', text: 'test' }]
      }]
    };

    // 记录原始对象引用
    const originalContext = badContext;

    // 执行处理
    const result = await processor.process(badContext);

    // 验证返回原始上下文（引用相同）
    expect(result).toBe(originalContext);
  });
});
