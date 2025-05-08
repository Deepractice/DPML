/**
 * 异步流测试辅助工具
 *
 * 提供创建和操作异步迭代器的实用函数，用于测试流式处理
 */

import type { ChatOutput } from '../../../types';
import type { Content, ContentItem } from '../../../types/Content';

/**
 * 模拟异步迭代器，用于测试流式响应
 */
export class AsyncStreamHelper<T> implements AsyncIterable<T> {
  private items: T[];
  private chunkDelay: number;
  private failOnChunk: number | null = null;
  private onChunkEmitted?: (chunk: T, index: number) => void;

  /**
   * 创建一个异步流助手
   * @param items 要流式传输的项目
   * @param chunkDelay 每个块之间的延迟（毫秒）
   */
  constructor(items: T[], chunkDelay: number = 10) {
    this.items = [...items];
    this.chunkDelay = chunkDelay;
  }

  /**
   * 设置在特定块失败
   * @param chunkIndex 失败的块索引
   */
  public failAt(chunkIndex: number): this {
    this.failOnChunk = chunkIndex;

    return this;
  }

  /**
   * 设置每个块发送时的回调
   * @param callback 块发送回调
   */
  public onChunk(callback: (chunk: T, index: number) => void): this {
    this.onChunkEmitted = callback;

    return this;
  }

  /**
   * 实现AsyncIterable接口
   */
  public async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    for (let i = 0; i < this.items.length; i++) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, this.chunkDelay));

      // 模拟错误情况
      if (this.failOnChunk === i) {
        throw new Error(`Stream failed at chunk ${i}`);
      }

      // 调用回调（如果设置）
      if (this.onChunkEmitted) {
        this.onChunkEmitted(this.items[i], i);
      }

      yield this.items[i];
    }
  }
}

/**
 * 创建包含工具调用的ChatOutput块
 * @param toolName 工具名称
 * @param params 工具参数
 * @returns ChatOutput对象
 */
export function createToolCallChunk(toolName: string, params: Record<string, any>): ChatOutput {
  const paramsStr = Object.entries(params)
    .map(([key, value]) => `<parameter name="${key}">${value}</parameter>`)
    .join('\n');

  const content: ContentItem = {
    type: 'text',
    value: `<function_calls>\n<invoke name="${toolName}">\n${paramsStr}\n</invoke>\n</function_calls>`
  };

  return {
    role: 'assistant',
    content
  } as unknown as ChatOutput;
}

/**
 * 创建一个模拟的LLM响应流，可以包含正常文本和工具调用
 * @param chunks 要发送的内容块
 * @param includeToolCall 是否包含工具调用
 * @param toolName 工具名称
 * @param toolParams 工具参数
 */
export function createMockResponseStream(
  chunks: string[],
  includeToolCall: boolean = false,
  toolName: string = 'testTool',
  toolParams: Record<string, any> = { param1: 'value1' }
): AsyncStreamHelper<ChatOutput> {
  const outputChunks: ChatOutput[] = chunks.map(chunk => ({
    role: 'assistant',
    content: {
      type: 'text',
      value: chunk
    }
  } as unknown as ChatOutput));

  if (includeToolCall) {
    const toolCallChunk = createToolCallChunk(toolName, toolParams);
    // 在适当位置插入工具调用
    const insertPosition = Math.min(Math.floor(outputChunks.length / 2), outputChunks.length);

    outputChunks.splice(insertPosition, 0, toolCallChunk);
  }

  return new AsyncStreamHelper<ChatOutput>(outputChunks);
}

/**
 * 收集流内容到一个字符串
 * @param stream 异步可迭代对象
 * @returns 收集的内容
 */
export async function collectStreamContent<T extends { content: Content }>(
  stream: AsyncIterable<T>
): Promise<string> {
  let content = '';

  for await (const chunk of stream) {
    if (typeof chunk.content === 'string') {
      content += chunk.content;
    } else if (Array.isArray(chunk.content)) {
      // 处理内容数组
      for (const item of chunk.content) {
        if (typeof item.value === 'string') {
          content += item.value;
        }
      }
    } else if (chunk.content && typeof chunk.content === 'object' && 'value' in chunk.content) {
      // 处理单个内容项
      if (typeof chunk.content.value === 'string') {
        content += chunk.content.value;
      }
    }
  }

  return content;
}
