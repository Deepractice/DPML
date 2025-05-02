import type { Message } from './types';

/**
 * 会话管理接口
 *
 * 内部接口，用于管理对话历史。
 */
export interface AgentSession {
  /**
   * 添加消息到历史
   */
  addMessage(message: Message): void;

  /**
   * 获取所有历史消息
   */
  getMessages(): ReadonlyArray<Message>;
}
