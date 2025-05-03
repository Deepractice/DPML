import type { AgentConfig, ChatInput, ChatOutput } from '../types';

import type { LLMClient } from './llm/LLMClient';
import type { AgentSession } from './session/AgentSession';
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
   *
   * @returns 按照正确顺序排列的消息列表
   */
  private prepareMessages(): Message[] {
    const messages: Message[] = [];

    // 添加系统提示（总是在第一位）
    if (this.config.prompt) {
      messages.push({
        role: 'system',
        content: {
          type: 'text',
          value: this.config.prompt
        }
      });
    }

    // 添加所有历史消息
    // 在测试中历史消息包括当前用户消息，所以不需要专门分离处理
    const historyMessages = this.session.getMessages();

    if (historyMessages.length > 0) {
      messages.push(...historyMessages);
    }

    return messages;
  }
}
