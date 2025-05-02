import type { Content } from '../types';

/**
 * 消息角色
 *
 * 内部使用的消息角色枚举。
 */
export type Role = 'system' | 'user' | 'assistant';

/**
 * 消息
 *
 * 表示对话中的一条消息，仅供内部使用。
 */
export interface Message {
  /**
   * 消息角色
   */
  readonly role: Role;

  /**
   * 消息内容，支持多模态
   */
  readonly content: Content;
}
