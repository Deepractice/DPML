import type { ChatInput } from './Chat';

/**
 * Agent接口
 *
 * 定义AI对话代理的标准交互方法。
 */
export interface Agent {
  /**
   * 发送消息并获取文本响应
   * @param input 文本消息或ChatInput对象
   * @returns 文本响应
   */
  chat(input: string | ChatInput): Promise<string>;

  /**
   * 发送消息并获取流式响应
   * @param input 文本消息或ChatInput对象
   * @returns 文本块的异步迭代器
   */
  chatStream(input: string | ChatInput): AsyncIterable<string>;
}
