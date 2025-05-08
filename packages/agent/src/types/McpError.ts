/**
 * MCP错误类型
 */
export enum McpErrorType {
  /**
   * 工具未找到错误
   */
  TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',

  /**
   * 工具执行失败错误
   */
  TOOL_EXECUTION_FAILED = 'TOOL_EXECUTION_FAILED',

  /**
   * 资源未找到错误
   */
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  /**
   * 提示词未找到错误
   */
  PROMPT_NOT_FOUND = 'PROMPT_NOT_FOUND',

  /**
   * 模型错误
   */
  MODEL_ERROR = 'MODEL_ERROR',

  /**
   * 网络错误
   */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /**
   * 权限被拒绝错误
   */
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  /**
   * 连接错误
   */
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  /**
   * 工具调用错误
   */
  TOOL_CALL_ERROR = 'TOOL_CALL_ERROR',

  /**
   * 配置错误
   */
  CONFIG_ERROR = 'CONFIG_ERROR',

  /**
   * 未知错误
   */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * MCP错误
 */
export class McpError extends Error {
  /**
   * 错误代码
   */
  readonly code: string;

  /**
   * 错误类型
   */
  readonly type: McpErrorType;

  /**
   * 错误详情
   */
  readonly details?: unknown;

  /**
   * 原始错误
   */
  readonly cause?: unknown;

  /**
   * 创建MCP错误
   *
   * @param code 错误代码
   * @param message 错误消息
   * @param details 错误详情或原始错误
   */
  constructor(code: string | McpErrorType, message: string, details?: unknown) {
    super(message);
    this.name = 'McpError';
    this.code = code;
    this.type = code as McpErrorType;
    this.details = details;
    this.cause = details;
  }

  /**
   * 获取错误的字符串表示
   */
  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}
