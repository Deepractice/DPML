/**
 * 模拟LLM客户端
 *
 * 用于测试的LLM客户端模拟实现
 */

import type { LLMClient } from '../../../core/llm/LLMClient';
import type { Message } from '../../../core/types';
import type { ChatOutput } from '../../../types';
import type { ContentItem } from '../../../types/Content';

import { createMockResponseStream } from './AsyncStreamHelper';

/**
 * 模拟LLM客户端选项
 */
export interface MockLLMClientOptions {
  /**
   * 是否默认包含工具调用
   */
  includeToolCall?: boolean;

  /**
   * 固定响应内容（优先使用）
   */
  fixedResponse?: string;

  /**
   * 固定响应函数（其次使用）
   */
  responseGenerator?: (messages: Message[]) => string;

  /**
   * 流式响应块延迟（毫秒）
   */
  streamChunkDelay?: number;

  /**
   * 响应延迟（毫秒）
   */
  responseDelay?: number;

  /**
   * 错误模式
   */
  errorMode?: boolean;

  /**
   * 默认工具名称
   */
  toolName?: string;

  /**
   * 默认工具参数
   */
  toolParams?: Record<string, any>;
}

/**
 * 模拟LLM客户端，实现LLMClient接口
 */
export class MockLLMClient implements LLMClient {
  private options: MockLLMClientOptions;
  private messageHistory: Message[][] = [];

  /**
   * 创建模拟LLM客户端
   * @param options 客户端选项
   */
  constructor(options: MockLLMClientOptions = {}) {
    this.options = {
      includeToolCall: false,
      streamChunkDelay: 20,
      responseDelay: 100,
      errorMode: false,
      toolName: 'search',
      toolParams: { query: 'test query' },
      ...options
    };
  }

  /**
   * 发送消息并获取响应
   * @param messages 消息列表
   * @param stream 是否流式输出
   * @returns 响应或响应流
   */
  public async sendMessages(
    messages: Message[],
    stream: boolean
  ): Promise<ChatOutput | AsyncIterable<ChatOutput>> {
    // 记录消息历史
    this.messageHistory.push([...messages]);

    // 模拟响应延迟
    await new Promise(resolve => setTimeout(resolve, this.options.responseDelay));

    // 错误模式
    if (this.options.errorMode) {
      throw new Error('LLM调用失败');
    }

    // 获取响应内容
    const responseContent = this.getResponseContent(messages);

    // 根据流式标志返回不同格式的响应
    if (stream) {
      // 将响应内容分成多个块
      const chunks = responseContent.split(/(?<=\.\s|\?\s|\!\s|\n)/g).filter(chunk => chunk.trim().length > 0);

      return createMockResponseStream(
        chunks,
        this.options.includeToolCall,
        this.options.toolName,
        this.options.toolParams
      );
    } else {
      // 如果需要工具调用，则修改响应
      let finalContent: string = responseContent;

      if (this.options.includeToolCall) {
        const paramsStr = Object.entries(this.options.toolParams!)
          .map(([key, value]) => `<parameter name="${key}">${value}</parameter>`)
          .join('\n');

        finalContent = `${responseContent}\n\n<function_calls>\n<invoke name="${this.options.toolName}">\n${paramsStr}\n</invoke>\n</function_calls>`;
      }

      // 创建新的内容对象
      const content: ContentItem = {
        type: 'text',
        value: finalContent
      };

      return {
        role: 'assistant',
        content
      } as unknown as ChatOutput;
    }
  }

  /**
   * 获取消息历史记录
   */
  public getMessageHistory(): Message[][] {
    return [...this.messageHistory];
  }

  /**
   * 清空消息历史
   */
  public clearMessageHistory(): void {
    this.messageHistory = [];
  }

  /**
   * 获取响应内容
   * @param messages 输入消息
   * @returns 响应内容
   */
  private getResponseContent(messages: Message[]): string {
    // 优先使用固定响应
    if (this.options.fixedResponse) {
      return this.options.fixedResponse;
    }

    // 其次使用响应生成器
    if (this.options.responseGenerator) {
      return this.options.responseGenerator(messages);
    }

    // 最后使用默认响应
    const lastMessage = messages[messages.length - 1];
    const userContent = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : Array.isArray(lastMessage.content)
        ? lastMessage.content.map(item => typeof item.value === 'string' ? item.value : '').join(' ')
        : typeof lastMessage.content.value === 'string'
          ? lastMessage.content.value
          : '未知内容';

    return `这是对"${userContent}"的模拟响应。我是一个模拟的LLM客户端，用于测试目的。`;
  }
}
