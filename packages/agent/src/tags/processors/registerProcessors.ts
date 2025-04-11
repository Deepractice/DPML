/**
 * 注册处理器函数
 * 
 * 用于将agent包的标签处理器注册到标签处理器注册表中
 */

import { TagProcessorRegistry } from '@dpml/core';
import { AgentTagProcessor } from './AgentTagProcessor';

/**
 * 注册Agent包的标签处理器到处理器注册表
 * @param registry 标签处理器注册表
 */
export function registerAgentTagProcessors(registry: TagProcessorRegistry): void {
  // 注册agent标签处理器
  registry.registerProcessor('agent', new AgentTagProcessor());
  
  // 未来会在此注册更多处理器
  // registry.registerProcessor('llm', new LLMTagProcessor());
  // registry.registerProcessor('prompt', new PromptTagProcessor());
} 