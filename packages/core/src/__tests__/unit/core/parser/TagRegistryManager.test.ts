/**
 * TagRegistryManager单元测试
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

import { getGlobalTagRegistry, resetGlobalTagRegistry, createTagRegistry } from '../../../../core/parser/TagRegistryManager';
import { ContentModel } from '../../../../types';
import type { TagDefinition, TagRegistry } from '../../../../types';

describe('UT-Parser-TagRegManager', () => {
  // 每个测试后重置全局注册表
  afterEach(() => {
    resetGlobalTagRegistry();
  });

  test('should return the same global registry instance', () => {
    const registry1 = getGlobalTagRegistry();
    const registry2 = getGlobalTagRegistry();

    expect(registry1).toBe(registry2); // 应该是同一个实例
  });

  test('should create new registry instance', () => {
    const registry1 = createTagRegistry();
    const registry2 = createTagRegistry();

    expect(registry1).not.toBe(registry2); // 应该是不同的实例
  });

  test('should reset global registry', () => {
    const registry1 = getGlobalTagRegistry();

    // 注册一个标签
    registry1.register({
      name: 'test-tag',
      contentModel: ContentModel.EMPTY
    });

    // 重置全局注册表
    resetGlobalTagRegistry();

    const registry2 = getGlobalTagRegistry();

    expect(registry1).not.toBe(registry2); // 应该是不同的实例
    expect(registry2.hasTag('test-tag')).toBe(false); // 新实例不应该有之前注册的标签
  });

  test('should keep global and local registries separate', () => {
    const globalRegistry = getGlobalTagRegistry();
    const localRegistry = createTagRegistry();

    // 在全局注册表中注册标签
    globalRegistry.register({
      name: 'global-tag',
      contentModel: ContentModel.EMPTY
    });

    // 在本地注册表中注册标签
    localRegistry.register({
      name: 'local-tag',
      contentModel: ContentModel.MIXED
    });

    // 全局注册表应该只有全局标签
    expect(globalRegistry.hasTag('global-tag')).toBe(true);
    expect(globalRegistry.hasTag('local-tag')).toBe(false);

    // 本地注册表应该只有本地标签
    expect(localRegistry.hasTag('global-tag')).toBe(false);
    expect(localRegistry.hasTag('local-tag')).toBe(true);
  });
});
