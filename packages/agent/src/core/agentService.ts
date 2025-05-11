import type { Agent, AgentConfig } from '../types';

import { DPMLAgent } from './DPMLAgent';
import { createLLMClient } from './llm/llmFactory';

/**
 * 创建符合Agent接口的实例
 *
 * @param config Agent配置
 * @returns Agent实例
 */
export function createAgent(config: AgentConfig): Agent {
  // 创建LLM客户端
  const llmClient = createLLMClient(config.llm);

  // 创建DPMLAgent实例
  return new DPMLAgent(config, llmClient);
}
