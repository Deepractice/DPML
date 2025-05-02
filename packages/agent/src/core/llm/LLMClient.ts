import type { ChatOutput } from '../../types';
import type { Message } from '../types';

/**
 * LLM客户端接口
 */
export interface LLMClient {
  /**
   * 发送消息并获取响应
   *
   * @param messages 消息列表
   * @param stream 是否使用流式响应
   * @returns 响应内容或流式响应迭代器
   */
  sendMessages(messages: Message[], stream: boolean): Promise<ChatOutput | AsyncIterable<ChatOutput>>;
}
