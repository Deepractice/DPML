/**
 * 标签注册表服务
 * 提供管理DPML标签定义的API
 */

import { getGlobalTagRegistry, createTagRegistry as createRegistry } from '../core/parser/TagRegistryManager';
import type { TagDefinition, TagRegistry } from '../types';

/**
 * 获取全局标签注册表
 * @returns 全局标签注册表实例
 */
export function getTagRegistry(): TagRegistry {
  return getGlobalTagRegistry();
}

/**
 * 注册单个标签定义
 * @param definition 标签定义
 */
export function registerTag(definition: TagDefinition): void {
  const registry = getTagRegistry();

  registry.register(definition);
}

/**
 * 批量注册多个标签定义
 * @param definitions 标签定义数组
 */
export function registerTags(definitions: TagDefinition[]): void {
  const registry = getTagRegistry();

  registry.registerAll(definitions);
}

/**
 * 创建新的标签注册表实例
 * @returns 新的标签注册表
 */
export function createTagRegistry(): TagRegistry {
  return createRegistry();
}
