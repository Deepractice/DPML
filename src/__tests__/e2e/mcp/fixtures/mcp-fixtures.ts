/**
 * MCP端到端测试夹具
 * 提供用于MCP端到端测试的工具和辅助函数
 */

import type { LLMClient } from '../../../../core/llm/LLMClient';
import type { McpConfig } from '../../../../types'; 
import type { ChatOutput, Content } from '../../../../types';
import type { Message } from '../../../../core/types';
import { vi } from 'vitest';

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
 * 创建模拟配置
 */
export function createMockMcpConfig(name: string): McpConfig {
  return {
    name,
    enabled: true,
    type: 'http',
    http: {
      url: `https://${name}.example.com/api`
    }
  };
}

/**
 * 收集流内容
 */
export async function collectStreamContent(stream: AsyncIterable<ChatOutput>): Promise<string> {
  let content = '';
  
  console.log('收集到完整流内容');
  
  for await (const chunk of stream) {
    if (chunk.content && typeof chunk.content === 'object' && 'type' in chunk.content && chunk.content.type === 'text') {
      content += chunk.content.value;
    }
  }
  
  return content;
}

/**
 * 性能测试辅助函数
 */
export class PerformanceHelper {
  /**
   * 测量异步操作的执行时间
   */
  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    return { result, duration };
  }
  
  /**
   * 创建大型内容
   */
  static createLargeContent(lines: number): string {
    return Array.from({ length: lines }, (_, i) => `这是第${i + 1}行内容，用于测试大型内容的处理性能。`).join('\n');
  }
  
  /**
   * 创建多个工具调用的内容
   */
  static createMultiToolCallContent(count: number): string {
    const tools = [
      { name: 'search', params: { query: '人工智能' } },
      { name: 'weather', params: { city: '北京' } },
      { name: 'calculator', params: { expression: '15 * 7' } }
    ];
    
    let content = '我需要使用多个工具来回答你的问题。\n\n';
    
    // 生成指定数量的工具调用
    for (let i = 0; i < count; i++) {
      const tool = tools[i % tools.length];
      content += createToolCallResponse(tool.name, tool.params, false) + '\n\n';
    }
    
    return content;
  }
}

/**
 * 创建模拟的MCP客户端
 */
export function createMockMcpClient(toolResults: Record<string, string | Error> = {}) {
  // 模拟可用工具列表
  const mockTools = [
    {
      name: 'search',
      description: '搜索互联网获取信息',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索查询' }
        },
        required: ['query']
      }
    },
    {
      name: 'weather',
      description: '获取指定城市的天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称' }
        },
        required: ['city']
      }
    },
    {
      name: 'calculator',
      description: '执行数学计算',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: '数学表达式' }
        },
        required: ['expression']
      }
    },
    {
      name: 'errorTool',
      description: '总是产生错误的工具',
      parameters: {
        type: 'object',
        properties: {
          param: { type: 'string', description: '任意参数' }
        },
        required: ['param']
      }
    }
  ];
  
  // 创建listTools模拟函数，符合SDK的格式
  const listTools = vi.fn().mockResolvedValue({
    tools: mockTools
  });
  
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
          // eslint-disable-next-line no-eval
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

  // 返回客户端对象，包括SDk兼容的listTools方法
  return {
    listTools,
    callTool,
    isConnected: vi.fn().mockReturnValue(true),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined)
  };
} 