/**
 * TagRegistryImpl单元测试
 */
import { describe, test, expect, beforeEach } from 'vitest';

import { TagRegistryImpl } from '../../../../core/parser/TagRegistryImpl';
import { ContentModel } from '../../../../types';
import type { TagDefinition } from '../../../../types';

describe('UT-Parser-TagReg', () => {
  let registry: TagRegistryImpl;

  beforeEach(() => {
    registry = new TagRegistryImpl();
  });

  test('should register and retrieve tag definitions', () => {
    const tagDef: TagDefinition = {
      name: 'test-tag',
      contentModel: ContentModel.EMPTY,
      allowedAttributes: ['id', 'class'],
      requiredAttributes: ['id']
    };

    registry.register(tagDef);

    const retrievedDef = registry.getDefinition('test-tag');

    expect(retrievedDef).toBeDefined();
    expect(retrievedDef?.name).toBe('test-tag');
    expect(retrievedDef?.contentModel).toBe(ContentModel.EMPTY);
    expect(retrievedDef?.allowedAttributes).toEqual(['id', 'class']);
    expect(retrievedDef?.requiredAttributes).toEqual(['id']);
  });

  test('should handle case-insensitive tag names', () => {
    const tagDef: TagDefinition = {
      name: 'MixedCase',
      contentModel: ContentModel.MIXED
    };

    registry.register(tagDef);

    // 应该能用小写名称找到
    expect(registry.hasTag('mixedcase')).toBe(true);
    expect(registry.getDefinition('mixedcase')).toBeDefined();

    // 应该能用大写名称找到
    expect(registry.hasTag('MIXEDCASE')).toBe(true);
    expect(registry.getDefinition('MIXEDCASE')).toBeDefined();

    // 应该能用原始名称找到
    expect(registry.hasTag('MixedCase')).toBe(true);
    expect(registry.getDefinition('MixedCase')).toBeDefined();
  });

  test('should register multiple tag definitions', () => {
    const tagDefs: TagDefinition[] = [
      { name: 'tag1', contentModel: ContentModel.EMPTY },
      { name: 'tag2', contentModel: ContentModel.CONTENT_ONLY },
      { name: 'tag3', contentModel: ContentModel.CHILDREN_ONLY }
    ];

    registry.registerAll(tagDefs);

    expect(registry.hasTag('tag1')).toBe(true);
    expect(registry.hasTag('tag2')).toBe(true);
    expect(registry.hasTag('tag3')).toBe(true);

    expect(registry.getDefinition('tag1')?.contentModel).toBe(ContentModel.EMPTY);
    expect(registry.getDefinition('tag2')?.contentModel).toBe(ContentModel.CONTENT_ONLY);
    expect(registry.getDefinition('tag3')?.contentModel).toBe(ContentModel.CHILDREN_ONLY);
  });

  test('should return null for non-existent tags', () => {
    expect(registry.getDefinition('non-existent')).toBeNull();
    expect(registry.hasTag('non-existent')).toBe(false);
  });

  test('should return all registered tag names', () => {
    const tagDefs: TagDefinition[] = [
      { name: 'tag1', contentModel: ContentModel.EMPTY },
      { name: 'tag2', contentModel: ContentModel.MIXED },
      { name: 'tag3', contentModel: ContentModel.CHILDREN_ONLY }
    ];

    registry.registerAll(tagDefs);

    const tagNames = registry.getAllTagNames();

    expect(tagNames).toHaveLength(3);
    expect(tagNames).toContain('tag1');
    expect(tagNames).toContain('tag2');
    expect(tagNames).toContain('tag3');
  });

  test('should clone registry with all definitions', () => {
    const tagDefs: TagDefinition[] = [
      { name: 'tag1', contentModel: ContentModel.EMPTY },
      { name: 'tag2', contentModel: ContentModel.MIXED }
    ];

    registry.registerAll(tagDefs);

    const clonedRegistry = registry.clone();

    // 克隆的注册表应该有相同的标签
    expect(clonedRegistry.hasTag('tag1')).toBe(true);
    expect(clonedRegistry.hasTag('tag2')).toBe(true);

    // 修改原始注册表不应影响克隆
    registry.register({ name: 'tag3', contentModel: ContentModel.CHILDREN_ONLY });

    expect(registry.hasTag('tag3')).toBe(true);
    expect(clonedRegistry.hasTag('tag3')).toBe(false);
  });

  test('should throw error for tag definition without name', () => {
    const tagDef: TagDefinition = {
      contentModel: ContentModel.EMPTY
    } as TagDefinition; // 缺少name属性

    expect(() => registry.register(tagDef)).toThrow();
  });
});
