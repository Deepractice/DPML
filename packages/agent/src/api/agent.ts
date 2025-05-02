import { createAgent as createAgentCore } from '../core/agent/agentService';
import type { Agent, AgentConfig } from '../types';

/**
 * 创建Agent实例
 *
 * 基于提供的配置创建一个符合Agent接口的实例，用于与LLM交互。
 * 使用闭包模式封装内部状态，提供简洁的交互接口。
 *
 * @param config Agent配置信息
 * @returns 符合Agent接口的实例
 */
export function createAgent(config: AgentConfig): Agent {
  // 委托给agentService创建Agent实例
  return createAgentCore(config);
}
