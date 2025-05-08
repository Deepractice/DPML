/**
 * MCP端到端测试夹具
 * 提供用于MCP端到端测试的工具和辅助函数
 */

import { vi } from 'vitest';

import type { LLMClient } from '../../../../core/llm/LLMClient';
import type { Message } from '../../../../core/types';
import type { McpConfig, ChatOutput } from '../../../../types';

/**
 * 创建模拟的LLM客户端响应
 */
export async function* createMockAsyncResponse(content: string | string[]): AsyncIterable<ChatOutput> {
  if (typeof content === 'string') {
    yield {
      content: { type: 'text', value: content }
    };
  } else {
    for (const chunk of content) {
      yield {
        content: { type: 'text', value: chunk }
      };
      // 添加小延迟模拟真实流
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

/**
 * 创建包含工具调用的响应
 */
export function createToolCallResponse(
  toolName: string,
  params: Record<string, unknown> = {},
  surroundingText = true
): string {
  const paramStr = Object.entries(params)
    .map(([key, value]) => `<parameter name="${key}">${value}</parameter>`)
    .join('\n  ');

  const toolCall =
    '<function_calls>\n' +
    `  <invoke name="${toolName}">\n` +
    `  ${paramStr}\n` +
    '  </invoke>\n' +
    '</function_calls>';

  if (!surroundingText) {
    return toolCall;
  }

  return `以下是我的回答：\n\n我需要使用工具获取信息。\n\n${toolCall}\n\n让我使用这个工具的结果来回答你的问题。`;
}

/**
 * 创建模拟的LLM客户端
 * @param responseContent 响应内容
 * @param streamContent 流式响应内容
 */
export function createMockLLMClient(
  responseContent: string,
  streamContent: string[] = []
): LLMClient {
  return {
    sendMessages: vi.fn().mockImplementation(async (messages: Message[], stream: boolean): Promise<ChatOutput | AsyncIterable<ChatOutput>> => {
      if (stream) {
        return createMockAsyncResponse(streamContent.length > 0 ? streamContent : [responseContent]);
      } else {
        return {
          content: { type: 'text', value: responseContent }
        };
      }
    })
  };
}

/**
 * 创建工具执行结果
 */
export function createToolResult(content: string): Record<string, unknown> {
  return { result: content };
}

/**
 * 创建模拟的MCP客户端
 */
export function createMockMcpClient(toolResults: Record<string, string | Error> = {}) {
  const mockTools = [
    {
      name: 'search',
      description: '搜索互联网获取信息',
      parameters: {
        query: { type: 'string', description: '搜索查询' }
      }
    },
    {
      name: 'weather',
      description: '获取指定城市的天气信息',
      parameters: {
        city: { type: 'string', description: '城市名称' }
      }
    },
    {
      name: 'calculator',
      description: '执行数学计算',
      parameters: {
        expression: { type: 'string', description: '数学表达式' }
      }
    },
    {
      name: 'errorTool',
      description: '总是产生错误的工具',
      parameters: {
        param: { type: 'string', description: '任意参数' }
      }
    }
  ];

  // 使用vi.fn()创建可监视的模拟函数，使用正确的方法名
  const listTools = vi.fn().mockResolvedValue(mockTools);

  // 创建callTool模拟函数，支持两种调用格式
  const callTool = vi.fn().mockImplementation((nameOrParams: string | { name: string; arguments: Record<string, unknown> }, paramsOrNothing?: Record<string, unknown>) => {
    let toolName: string;
    let toolParams: Record<string, unknown>;

    // 判断调用方式并提取参数
    if (typeof nameOrParams === 'string') {
      // 格式1: callTool(name, params)
      toolName = nameOrParams;
      toolParams = paramsOrNothing || {};
    } else if (nameOrParams && typeof nameOrParams === 'object') {
      // 格式2: callTool({ name, arguments })
      toolName = nameOrParams.name;
      toolParams = nameOrParams.arguments || {};
    } else {
      throw new Error('无效的调用格式');
    }

    // 如果工具名称存在于预设结果中
    if (toolName in toolResults) {
      const result = toolResults[toolName];

      // 如果结果是Error类型，抛出错误
      if (result instanceof Error) {
        throw result;
      }

      // 否则返回结果
      return Promise.resolve({ result });
    }

    // 默认工具行为
    switch (toolName) {
      case 'search':
        return Promise.resolve({ result: `搜索"${toolParams.query}"的结果：这是一些搜索结果。` });
      case 'weather':
        return Promise.resolve({ result: `${toolParams.city}的天气：晴天，25°C` });
      case 'calculator':
        try {

          const result = eval(String(toolParams.expression));

          return Promise.resolve({ result: `计算结果：${result}` });
        } catch (error) {
          return Promise.resolve({ result: `计算错误：${(error as Error).message}` });
        }

      case 'errorTool':
        throw new Error('工具执行失败');
      default:
        throw new Error(`未知工具：${toolName}`);
    }
  });

  // 返回客户端对象，使用正确的方法名
  return {
    listTools,
    callTool,
    isConnected: vi.fn().mockReturnValue(true),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined)
  };
}

/**
 * 创建测试用的MCP配置
 */
export function createMockMcpConfig(name = 'test-mcp'): McpConfig {
  return {
    name,
    enabled: true,
    type: 'http',
    http: {
      url: 'http://localhost:3000/mcp'
    }
  };
}

/**
 * 收集流式响应内容
 */
export async function collectStreamContent(stream: AsyncIterable<ChatOutput>): Promise<string> {
  let content = '';

  for await (const chunk of stream) {
    if (typeof chunk.content === 'object') {
      if (Array.isArray(chunk.content)) {
        for (const item of chunk.content) {
          if (item.type === 'text') {
            content += String(item.value);
          }
        }
      } else if (chunk.content.type === 'text') {
        content += String(chunk.content.value);
      }
    } else {
      content += JSON.stringify(chunk.content);
    }
  }

  return content;
}

/**
 * 包含性能测试的工具
 */
export class PerformanceHelper {
  // 存储性能计时器
  private static timers = new Map<string, number>();

  /**
   * 开始性能计时
   */
  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * 结束性能计时并返回耗时（毫秒）
   */
  static endTimer(name: string): number {
    const startTime = this.timers.get(name);

    if (startTime === undefined) {
      throw new Error(`未找到名为 ${name} 的性能计时器`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 清除计时器
    this.timers.delete(name);

    return duration;
  }

  /**
   * 执行带计时的函数
   */
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    this.startTimer(name);
    const result = await fn();
    const duration = this.endTimer(name);

    return { result, duration };
  }

  /**
   * 创建大型文本内容（用于性能测试）
   */
  static createLargeContent(size: number): string {
    const paragraph = '这是一个用于性能测试的大型文本内容。它包含了足够多的字符来测试系统在处理大量数据时的表现。';
    let result = '';

    for (let i = 0; i < size; i++) {
      result += paragraph + ' ';
    }

    return result;
  }

  /**
   * 创建包含多个工具调用的内容（用于性能测试）
   */
  static createMultiToolCallContent(toolCount: number): string {
    let result = '我需要使用多个工具来回答你的问题。\n\n';

    for (let i = 0; i < toolCount; i++) {
      const toolName = i % 3 === 0 ? 'search' : i % 3 === 1 ? 'weather' : 'calculator';
      const params = i % 3 === 0
        ? { query: `测试查询${i}` }
        : i % 3 === 1
          ? { city: `城市${i}` }
          : { expression: `${i} + ${i + 1}` };

      result += createToolCallResponse(toolName, params, false) + '\n\n';
    }

    result += '让我使用这些工具的结果来回答你的问题。';

    return result;
  }
}
