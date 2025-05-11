import type { Observable } from 'rxjs';

import type { Message } from './Message';

/**
 * 会话管理接口
 *
 * 用于管理对话历史。
 */
export interface AgentSession {
  /**
   * 会话ID
   */
  readonly id: string;

  /**
   * 添加消息到历史
   */
  addMessage(message: Message): void;

  /**
   * 更新已有消息
   * @param messageId 消息ID
   * @param updater 更新函数，接收当前消息并返回更新后的消息
   */
  updateMessage(messageId: string, updater: (message: Message) => Message): void;

  /**
   * 获取所有历史消息
   */
  getMessages(): ReadonlyArray<Message>;

  /**
   * 会话消息流
   */
  readonly messages$: Observable<ReadonlyArray<Message>>;

  /**
   * 清除会话历史
   */
  clear(): void;
}
