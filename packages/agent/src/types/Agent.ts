import type { Observable } from 'rxjs';

import type { AgentSession } from './AgentSession';
import type { ChatInput, ChatOutput } from './Chat';

/**
 * Agent接口
 *
 * 定义AI对话代理的标准交互方法。
 */
export interface Agent {
  /**
   * 使用指定会话发送消息并获取响应
   * @param sessionId 会话ID
   * @param input 文本消息或ChatInput对象
   * @returns 响应内容的Observable流
   */
  chat(sessionId: string, input: string | ChatInput): Observable<ChatOutput>;

  /**
   * 取消指定会话的进行中请求
   */
  cancel(sessionId: string): void;

  /**
   * 创建新会话
   * @returns 新会话的ID
   */
  createSession(): string;

  /**
   * 获取指定会话
   */
  getSession(sessionId: string): AgentSession | undefined;

  /**
   * 删除指定会话
   */
  removeSession(sessionId: string): boolean;
}
