import { expect, describe, it, beforeEach } from 'vitest';

import { TagRegistry } from '../../parser/tag-registry';

import type { TagDefinition } from '../../parser/tag-definition';

describe('TagRegistry', () => {
  let registry: TagRegistry;

  beforeEach(() => {
    registry = new TagRegistry();
  });

  describe('registerTagDefinition', () => {
    it('应该能够注册标签定义', () => {
      const tagDef: TagDefinition = {
        attributes: ['name', 'id'],
        requiredAttributes: ['name'],
        allowedChildren: ['text', 'emphasis'],
      };

      registry.registerTagDefinition('role', tagDef);

      const retrievedDef = registry.getTagDefinition('role');

      expect(retrievedDef).toBeDefined();
      expect(retrievedDef).toEqual(tagDef);
    });

    it('应该覆盖同名标签的先前定义', () => {
      const firstDef: TagDefinition = {
        attributes: ['name'],
      };

      const secondDef: TagDefinition = {
        attributes: ['id', 'class'],
      };

      registry.registerTagDefinition('div', firstDef);
      registry.registerTagDefinition('div', secondDef);

      const retrievedDef = registry.getTagDefinition('div');

      expect(retrievedDef).toEqual(secondDef);
    });
  });

  describe('getTagDefinition', () => {
    it('应该返回已注册的标签定义', () => {
      const tagDef: TagDefinition = {
        attributes: ['src', 'alt'],
        requiredAttributes: ['src'],
      };

      registry.registerTagDefinition('img', tagDef);

      const retrievedDef = registry.getTagDefinition('img');

      expect(retrievedDef).toEqual(tagDef);
    });

    it('当标签未注册时应该返回undefined', () => {
      const retrievedDef = registry.getTagDefinition('unknown-tag');

      expect(retrievedDef).toBeUndefined();
    });
  });

  describe('isTagRegistered', () => {
    it('对已注册的标签应该返回true', () => {
      const tagDef: TagDefinition = {
        attributes: ['href', 'target'],
      };

      registry.registerTagDefinition('a', tagDef);

      expect(registry.isTagRegistered('a')).toBe(true);
    });

    it('对未注册的标签应该返回false', () => {
      expect(registry.isTagRegistered('unknown-tag')).toBe(false);
    });
  });

  describe('getAllTagNames', () => {
    it('应该返回所有已注册标签的名称', () => {
      registry.registerTagDefinition('div', {});
      registry.registerTagDefinition('span', {});
      registry.registerTagDefinition('p', {});

      const tagNames = registry.getAllTagNames();

      expect(tagNames).toHaveLength(3);
      expect(tagNames).toContain('div');
      expect(tagNames).toContain('span');
      expect(tagNames).toContain('p');
    });

    it('当没有注册标签时应该返回空数组', () => {
      const tagNames = registry.getAllTagNames();

      expect(tagNames).toHaveLength(0);
    });
  });
});

describe('辅助方法', () => {
  it('getBaseAttributes应该返回包含基础属性的对象', () => {
    const baseAttributes = TagRegistry.getBaseAttributes();

    expect(baseAttributes).toHaveProperty('id', true);
    expect(baseAttributes).toHaveProperty('class', true);
    expect(baseAttributes).toHaveProperty('style', true);
    expect(baseAttributes).toHaveProperty('datatest', true);

    expect(Object.keys(baseAttributes).length).toBe(4);
  });

  it('createTagDefinition应该创建包含基础属性的标签定义', () => {
    const tagDef = TagRegistry.createTagDefinition({
      attributes: {
        custom: true,
      },
      allowedChildren: ['child'],
      selfClosing: true,
    });

    expect(tagDef.attributes).toHaveProperty('id', true);
    expect(tagDef.attributes).toHaveProperty('class', true);
    expect(tagDef.attributes).toHaveProperty('style', true);
    expect(tagDef.attributes).toHaveProperty('datatest', true);
    expect(tagDef.attributes).toHaveProperty('custom', true);

    expect(tagDef.allowedChildren).toEqual(['child']);
    expect(tagDef.selfClosing).toBe(true);
  });

  it('createTagDefinition应该允许覆盖基础属性设置', () => {
    const tagDef = TagRegistry.createTagDefinition({
      attributes: {
        id: { type: 'string', required: true },
      },
    });

    expect(tagDef.attributes).toHaveProperty('id');
    expect((tagDef.attributes as any).id.required).toBe(true);
  });

  it('createTagDefinition应该保留其他标签定义属性', () => {
    const validateFn = (element: any) => ({ valid: true });

    const tagDef = TagRegistry.createTagDefinition({
      contentFormat: 'markdown',
      validate: validateFn,
    });

    expect(tagDef.contentFormat).toBe('markdown');
    expect(tagDef.validate).toBe(validateFn);
  });
});
