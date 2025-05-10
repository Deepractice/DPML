import type { LLMConfig } from './LLMConfig';
import type { McpConfig } from './McpConfig';

/**
 * Agent配置
 *
 * 定义创建Agent所需的配置信息。
 */
export interface AgentConfig {
  /**
   * LLM配置信息
   */
  readonly llm: LLMConfig;

  /**
   * 系统提示词，定义Agent的行为和能力
   */
  readonly prompt: string;

  /**
   * MCP服务器配置
   *
   * 可选的MCP服务器配置数组，用于增强Agent的工具调用能力
   */
  readonly mcpServers?: McpConfig[];
}
