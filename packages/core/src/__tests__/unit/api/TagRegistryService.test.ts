/**
 * TagRegistryService API单元测试
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

import { getTagRegistry, registerTag, registerTags, createTagRegistry } from '../../../api';
import { resetGlobalTagRegistry } from '../../../core/parser/TagRegistryManager';
import { ContentModel } from '../../../types';
import type { TagDefinition } from '../../../types';

describe('UT-API-TagRegistryService', () => {
  // 每个测试后重置全局注册表
  afterEach(() => {
    resetGlobalTagRegistry();
  });

  test('should register single tag definition', () => {
    const tagDef: TagDefinition = {
      name: 'test-tag',
      contentModel: ContentModel.EMPTY
    };

    registerTag(tagDef);

    const registry = getTagRegistry();

    expect(registry.hasTag('test-tag')).toBe(true);
  });

  test('should register multiple tag definitions', () => {
    const tagDefs: TagDefinition[] = [
      { name: 'tag1', contentModel: ContentModel.EMPTY },
      { name: 'tag2', contentModel: ContentModel.MIXED }
    ];

    registerTags(tagDefs);

    const registry = getTagRegistry();

    expect(registry.hasTag('tag1')).toBe(true);
    expect(registry.hasTag('tag2')).toBe(true);
  });

  test('should create new registry instance', () => {
    const registry = createTagRegistry();

    // 在新注册表中注册标签
    registry.register({
      name: 'local-tag',
      contentModel: ContentModel.EMPTY
    });

    // 全局注册表不应该有这个标签
    expect(getTagRegistry().hasTag('local-tag')).toBe(false);
  });
});
