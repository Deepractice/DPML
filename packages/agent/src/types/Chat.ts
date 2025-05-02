import type { Content } from './Content';

/**
 * 聊天输入
 *
 * 包含发送给Agent的输入内容，支持多模态。
 */
export interface ChatInput {
  /**
   * 内容，支持单个内容项或内容项数组
   */
  readonly content: Content;
}

/**
 * 聊天输出
 *
 * 包含Agent的响应内容，支持多模态。
 */
export interface ChatOutput {
  /**
   * 内容，支持单个内容项或内容项数组
   */
  readonly content: Content;
}
