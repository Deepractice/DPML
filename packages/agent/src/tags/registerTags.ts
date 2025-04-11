import { TagRegistry } from '@dpml/core';
import { agentTagDefinition } from './definitions/agentTag';
import { llmTagDefinition } from './definitions/llmTag';
import { promptTagDefinition } from './definitions/promptTag';

/**
 * 注册Agent包的标签到标签注册表
 * @param registry 标签注册表实例
 */
export function registerTags(registry: TagRegistry): void {
  // 注册agent标签
  registry.registerTagDefinition('agent', agentTagDefinition);

  // 注册llm标签
  registry.registerTagDefinition('llm', llmTagDefinition);

  // 注册prompt标签
  registry.registerTagDefinition('prompt', promptTagDefinition);
} 