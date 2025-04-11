/**
 * DPML Agent 包的类型定义
 * 定义与标签和处理器相关的接口和类型
 */

// 标签相关类型
export interface AgentTagAttributes {
  id: string;
  version?: string;
  extends?: string;
}

export interface LLMTagAttributes {
  'api-type': string;
  model: string;
  'api-url'?: string;
  'key-env'?: string;
  temperature?: number;
}

export interface PromptTagAttributes {
  extends?: string;
} 