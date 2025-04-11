/**
 * 注册DPML Agent标签
 */

import { TagRegistry, TagDefinition } from '@dpml/core';
import { agentTagDefinition } from './definitions/agentTag';
import { llmTagDefinition } from './definitions/llmTag';
import { promptTagDefinition } from './definitions/promptTag';

/**
 * 注册DPML Agent标签到TagRegistry
 * 
 * @param registry TagRegistry实例
 */
export function registerTags(registry: TagRegistry): void {
  // 注册agent标签
  registry.registerTag('agent', agentTagDefinition);
  
  // 注册llm标签
  registry.registerTag('llm', llmTagDefinition);
  
  // 注册prompt标签
  registry.registerTag('prompt', promptTagDefinition);
} 