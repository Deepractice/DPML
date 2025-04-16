/**
 * 注册标签处理器
 *
 * 将标签处理器注册到TagProcessor
 */


import { AgentTagProcessor } from './AgentTagProcessor';
import { LLMTagProcessor } from './LLMTagProcessor';
import { PromptTagProcessor } from './PromptTagProcessor';

import type { TagProcessorRegistry } from '@dpml/core';

/**
 * 注册DPML Agent标签处理器
 *
 * @param registry 标签处理器注册表实例
 */
export function registerProcessors(registry: TagProcessorRegistry): void {
  // 注册Agent处理器
  registry.registerProcessor('agent', new AgentTagProcessor());

  // 注册LLM处理器
  registry.registerProcessor('llm', new LLMTagProcessor());

  // 注册Prompt处理器
  registry.registerProcessor('prompt', new PromptTagProcessor());
}
