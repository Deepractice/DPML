import type { LLMConfig } from './LLMConfig';

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
}
