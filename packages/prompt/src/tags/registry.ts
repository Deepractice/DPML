/**
 * 标签注册表
 */
import { TagRegistry } from '@dpml/core';
import {
  promptTagDefinition,
  roleTagDefinition,
  contextTagDefinition,
  thinkingTagDefinition,
  executingTagDefinition,
  testingTagDefinition,
  protocolTagDefinition,
  customTagDefinition
} from './core';

/**
 * 创建并初始化提示标签注册表
 */
export function createPromptTagRegistry(): TagRegistry {
  // 创建注册表实例
  const registry = new TagRegistry();
  
  // 注册所有核心标签
  registry.register(promptTagDefinition);
  registry.register(roleTagDefinition);
  registry.register(contextTagDefinition);
  registry.register(thinkingTagDefinition);
  registry.register(executingTagDefinition);
  registry.register(testingTagDefinition);
  registry.register(protocolTagDefinition);
  registry.register(customTagDefinition);
  
  return registry;
}

/**
 * 默认提示标签注册表单例
 */
export const promptTagRegistry = createPromptTagRegistry(); 