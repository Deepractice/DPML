import { createAgent as createAgentCore } from '../core/agentService';
import type { Agent } from '../types/Agent';
import type { AgentConfig } from '../types/AgentConfig';

/**
 * 创建Agent实例
 *
 * 基于提供的配置创建一个符合Agent接口的实例，用于与LLM交互。
 * 返回支持RxJS Observable的现代化接口。
 *
 * @param config Agent配置信息
 * @returns 符合Agent接口的实例
 */
export function createAgent(config: AgentConfig): Agent {
  // 委托给agentService创建Agent实例
  return createAgentCore(config);
}
