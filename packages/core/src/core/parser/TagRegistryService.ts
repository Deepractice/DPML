/**
 * 标签注册表服务实现
 * 提供全局标签注册表和相关服务
 */

import type { TagRegistry } from '../../types';

import { TagRegistryImpl } from './TagRegistryImpl';

/**
 * 全局标签注册表实例
 */
let globalRegistry: TagRegistry | null = null;

/**
 * 获取全局标签注册表
 * 如果不存在则创建一个新的实例
 * @returns 全局标签注册表实例
 */
export function getGlobalTagRegistry(): TagRegistry {
  if (!globalRegistry) {
    globalRegistry = new TagRegistryImpl();
  }

  return globalRegistry;
}

/**
 * 重置全局标签注册表
 * 主要用于测试
 */
export function resetGlobalTagRegistry(): void {
  globalRegistry = null;
}

/**
 * 创建新的标签注册表实例
 * @returns 新的标签注册表
 */
export function createTagRegistry(): TagRegistry {
  return new TagRegistryImpl();
}
