import type { AgentConfig } from '../../types/AgentConfig';
import type { ChatInput, ChatOutput } from '../../types/Chat';
import type { LLMClient } from '../llm/LLMClient';

import type { AgentSession } from './AgentSession';
import type { Message } from './types';

/**
 * Agent运行器
 *
 * 负责处理消息发送和接收的核心类。
 */
export class AgentRunner {
  private config: AgentConfig;
  private llmClient: LLMClient;
  private session: AgentSession;

  constructor(config: AgentConfig, llmClient: LLMClient, session: AgentSession) {
    this.config = config;
    this.llmClient = llmClient;
    this.session = session;
  }

  /**
   * 发送消息并获取响应
   *
   * @param input 输入内容
   * @param stream 是否使用流式响应
   * @returns 响应内容或流式响应迭代器
   */
  public sendMessage(input: ChatInput, stream: boolean): Promise<ChatOutput | AsyncIterable<ChatOutput>> {
    // 创建用户消息
    const userMessage: Message = {
      role: 'user',
      content: input.content
    };

    // 添加到会话历史
    this.session.addMessage(userMessage);

    // 准备发送给LLM的消息列表
    const messages = this.prepareMessages();

    // 发送消息给LLM客户端
    return this.llmClient.sendMessages(messages, stream);
  }

  /**
   * 准备发送给LLM的消息列表
   */
  private prepareMessages(): Message[] {
    const messages: Message[] = [];

    // 添加系统提示
    if (this.config.prompt) {
      messages.push({
        role: 'system',
        content: {
          type: 'text',
          value: this.config.prompt
        }
      });
    }

    // 添加历史消息
    messages.push(...this.session.getMessages());

    return messages;
  }
}
