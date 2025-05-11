import type { Message } from '../../types/Message';

/**
 * LLM请求接口
 * 用于向LLM服务发送统一格式的请求
 */
export interface LLMRequest {
  /**
   * 会话ID，用于跟踪请求
   */
  sessionId: string;

  /**
   * 消息历史
   */
  messages: ReadonlyArray<Message>;

  /**
   * 模型标识符，可选
   * 允许覆盖客户端默认模型
   */
  model?: string;

  /**
   * 提供商特定参数，可选
   * 用于传递特定LLM提供商的独特参数
   */
  providerParams?: Record<string, any>;
}
