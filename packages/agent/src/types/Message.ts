import type { Content } from './Content';

/**
 * 消息角色
 */
export type Role = 'system' | 'user' | 'assistant';

/**
 * 消息接口
 *
 * 定义对话中的一条消息
 */
export interface Message {
  /**
   * 消息唯一标识符
   * 用于更新和追踪消息
   */
  id: string;

  /**
   * 消息角色
   */
  readonly role: Role;

  /**
   * 消息内容，支持多模态
   */
  readonly content: Content;

  /**
   * 消息创建时间
   */
  timestamp?: number;

  /**
   * 元数据
   * 可用于存储任何与消息相关的额外信息
   */
  metadata?: Record<string, any>;
}
