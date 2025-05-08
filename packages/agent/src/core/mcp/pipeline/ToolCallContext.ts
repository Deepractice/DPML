import type { ChatOutput } from '../../../types';
import type { Message } from '../../types';

/**
 * 工具参数类型
 */
export interface ToolParameters {
  [key: string]: any;
}

/**
 * 工具类型
 */
export interface Tool {
  /**
   * 工具名称
   */
  name: string;

  /**
   * 工具描述
   */
  description: string;

  /**
   * 工具参数信息
   */
  parameters?: Record<string, any>;
}

/**
 * 工具调用请求
 */
export interface InvokeToolRequest {
  /**
   * 工具名称
   */
  name: string;

  /**
   * 工具参数
   */
  parameters: ToolParameters;
}

/**
 * 工具执行内容类型
 */
export interface ToolExecutionContent {
  /**
   * 内容类型
   */
  type: string;

  /**
   * 文本内容
   */
  text?: string;

  /**
   * 其他内容属性
   */
  [key: string]: any;
}

/**
 * 工具调用执行结果
 */
export interface ToolResult {
  /**
   * 工具调用信息
   */
  toolCall: InvokeToolRequest;

  /**
   * 执行状态
   */
  status: 'success' | 'error';

  /**
   * 成功结果，当status为success时有值
   */
  result?: ToolExecutionContent[];

  /**
   * 错误信息，当status为error时有值
   */
  error?: string;
}

/**
 * 工具调用上下文
 *
 * 在处理器之间传递的上下文对象。
 */
export interface ToolCallContext {
  /**
   * 消息列表
   */
  messages: Message[];

  /**
   * 是否流式输出
   */
  stream: boolean;

  /**
   * LLM响应
   */
  response?: ChatOutput | AsyncIterable<ChatOutput>;

  /**
   * 可用工具列表
   */
  tools?: Tool[];

  /**
   * 提取的工具调用
   */
  toolCalls?: InvokeToolRequest[];

  /**
   * 工具执行结果
   */
  results?: ToolResult[];

  /**
   * 最终响应结果
   */
  finalResponse?: ChatOutput;

  /**
   * 递归处理深度
   */
  recursionDepth?: number;
}
