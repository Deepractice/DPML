/**
 * TagRegistry接口契约测试
 */
import { describe, test, expect } from 'vitest';

import type { TagRegistry, TagDefinition } from '../../../types';
import { ContentModel } from '../../../types';

// 为了测试而创建的模拟实现
function createMockRegistry(): TagRegistry {
  const definitions = new Map<string, TagDefinition>();

  return {
    register(definition: TagDefinition): void {
      definitions.set(definition.name, definition);
    },

    registerAll(defs: TagDefinition[]): void {
      defs.forEach(def => definitions.set(def.name, def));
    },

    getDefinition(tagName: string): TagDefinition | null {
      return definitions.get(tagName) || null;
    },

    hasTag(tagName: string): boolean {
      return definitions.has(tagName);
    },

    getAllTagNames(): string[] {
      return Array.from(definitions.keys());
    },

    clone(): TagRegistry {
      const newRegistry = createMockRegistry();

      this.getAllTagNames().forEach(name => {
        const def = this.getDefinition(name);

        if (def) newRegistry.register(def);
      });

      return newRegistry;
    }
  };
}

describe('CT-TagRegistry-Structure', () => {
  test('should have all required methods', () => {
    const registry = createMockRegistry();

    // 验证所有必要方法存在
    expect(typeof registry.register).toBe('function');
    expect(typeof registry.registerAll).toBe('function');
    expect(typeof registry.getDefinition).toBe('function');
    expect(typeof registry.hasTag).toBe('function');
    expect(typeof registry.getAllTagNames).toBe('function');
    expect(typeof registry.clone).toBe('function');
  });

  test('should have methods with correct signatures', () => {
    const registry = createMockRegistry();
    const testDef: TagDefinition = {
      name: 'test-tag',
      contentModel: ContentModel.EMPTY
    };

    // 测试register方法
    registry.register(testDef);
    expect(registry.hasTag('test-tag')).toBe(true);

    // 测试registerAll方法
    const moreDefs: TagDefinition[] = [
      { name: 'tag1', contentModel: ContentModel.EMPTY },
      { name: 'tag2', contentModel: ContentModel.MIXED }
    ];

    registry.registerAll(moreDefs);
    expect(registry.hasTag('tag1')).toBe(true);
    expect(registry.hasTag('tag2')).toBe(true);

    // 测试getDefinition方法
    const def = registry.getDefinition('test-tag');

    expect(def).toBeDefined();
    expect(def?.name).toBe('test-tag');

    const nonExistentDef = registry.getDefinition('non-existent');

    expect(nonExistentDef).toBeNull();

    // 测试getAllTagNames方法
    const tagNames = registry.getAllTagNames();

    expect(Array.isArray(tagNames)).toBe(true);
    expect(tagNames).toContain('test-tag');
    expect(tagNames).toContain('tag1');
    expect(tagNames).toContain('tag2');

    // 测试clone方法
    const clonedRegistry = registry.clone();

    expect(clonedRegistry).toBeDefined();
    expect(clonedRegistry.hasTag('test-tag')).toBe(true);
    expect(clonedRegistry.hasTag('tag1')).toBe(true);
  });
});
