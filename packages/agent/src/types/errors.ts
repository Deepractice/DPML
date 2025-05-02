/**
 * Agent错误类型
 */
export enum AgentErrorType {
  /**
   * 配置错误
   */
  CONFIG = 'CONFIG',

  /**
   * LLM服务调用错误
   */
  LLM_SERVICE = 'LLM_SERVICE',

  /**
   * 内容处理错误
   */
  CONTENT = 'CONTENT',

  /**
   * 会话错误
   */
  SESSION = 'SESSION',

  /**
   * 未知错误
   */
  UNKNOWN = 'UNKNOWN'
}

/**
 * Agent错误
 *
 * 统一的错误类，用于处理Agent模块中的所有错误。
 */
export class AgentError extends Error {
  /**
   * 错误类型
   */
  readonly type: AgentErrorType;

  /**
   * 错误码
   */
  readonly code: string;

  /**
   * 原始错误
   */
  readonly cause?: Error;

  /**
   * 创建Agent错误
   *
   * @param message 错误消息
   * @param type 错误类型
   * @param code 错误码
   * @param cause 原始错误
   */
  constructor(
    message: string,
    type: AgentErrorType = AgentErrorType.UNKNOWN,
    code: string = 'AGENT_ERROR',
    cause?: Error
  ) {
    super(message);
    this.name = 'AgentError';
    this.type = type;
    this.code = code;
    this.cause = cause;
  }
}
