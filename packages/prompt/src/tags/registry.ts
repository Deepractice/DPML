/**
 * 标签注册表
 */
import { TagRegistry } from '@dpml/core';
import { EnhancedTagRegistry } from './enhanced-registry';
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
export function createPromptTagRegistry(): EnhancedTagRegistry {
  // 创建注册表实例
  const registry = new EnhancedTagRegistry();
  
  // 注册所有核心标签
  registry.registerTagDefinition('prompt', promptTagDefinition);
  registry.registerTagDefinition('role', roleTagDefinition);
  registry.registerTagDefinition('context', contextTagDefinition);
  registry.registerTagDefinition('thinking', thinkingTagDefinition);
  registry.registerTagDefinition('executing', executingTagDefinition);
  registry.registerTagDefinition('testing', testingTagDefinition);
  registry.registerTagDefinition('protocol', protocolTagDefinition);
  registry.registerTagDefinition('custom', customTagDefinition);
  
  return registry;
}

/**
 * 默认提示标签注册表单例
 */
export const promptTagRegistry = createPromptTagRegistry(); 