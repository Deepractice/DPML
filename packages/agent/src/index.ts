/**
 * DPML Agent
 *
 * 提供Agent相关功能
 */
import { AgentFactory } from './agent/AgentFactory';
import type { AgentFactoryConfig } from './agent/types';

export const version = '0.1.0';

// 导出标签相关模块
export * from './tags';

// 导出类型定义
export * from './types';

// 导出API密钥管理模块
export * from './apiKey';

// 导出LLM连接器模块
export * from './connector';

// 导出状态管理模块
export * from './state';

// 导出记忆系统模块
export * from './memory';

// 导出事件系统模块
export * from './events';

// 导出错误处理模块
export * from './errors';

// 导出代理模块
export * from './agent';

// 导出工具函数
export * from './utils';

/**
 * 创建代理的便捷函数
 * 
 * @param config 代理工厂配置
 * @returns 配置好的代理实例
 */
export function createAgent(config: AgentFactoryConfig) {
  return AgentFactory.createAgent(config);
}
