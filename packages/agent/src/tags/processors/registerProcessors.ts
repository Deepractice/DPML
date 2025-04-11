/**
 * 注册标签处理器
 * 
 * 将各个标签处理器注册到处理器注册表，以便在处理过程中被调用
 */

import { TagProcessorRegistry } from '@dpml/core';
import { AgentTagProcessor } from './AgentTagProcessor';
import { LLMTagProcessor } from './LLMTagProcessor';

/**
 * 注册标签处理器
 * @param registry 处理器注册表
 */
export function registerProcessors(registry: TagProcessorRegistry): void {
  // 注册Agent标签处理器
  registry.registerProcessor('agent', new AgentTagProcessor());
  
  // 注册LLM标签处理器
  registry.registerProcessor('llm', new LLMTagProcessor());
} 