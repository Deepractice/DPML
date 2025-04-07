import { expect, describe, it, beforeEach } from 'vitest';
import { TagRegistry } from '../../src/parser/tag-registry';
describe('TagRegistry', () => {
    let registry;
    beforeEach(() => {
        registry = new TagRegistry();
    });
    describe('registerTagDefinition', () => {
        it('应该能够注册标签定义', () => {
            const tagDef = {
                attributes: ['name', 'id'],
                requiredAttributes: ['name'],
                allowedChildren: ['text', 'emphasis']
            };
            registry.registerTagDefinition('role', tagDef);
            const retrievedDef = registry.getTagDefinition('role');
            expect(retrievedDef).toBeDefined();
            expect(retrievedDef).toEqual(tagDef);
        });
        it('应该覆盖同名标签的先前定义', () => {
            const firstDef = {
                attributes: ['name']
            };
            const secondDef = {
                attributes: ['id', 'class']
            };
            registry.registerTagDefinition('div', firstDef);
            registry.registerTagDefinition('div', secondDef);
            const retrievedDef = registry.getTagDefinition('div');
            expect(retrievedDef).toEqual(secondDef);
        });
    });
    describe('getTagDefinition', () => {
        it('应该返回已注册的标签定义', () => {
            const tagDef = {
                attributes: ['src', 'alt'],
                requiredAttributes: ['src']
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
            const tagDef = {
                attributes: ['href', 'target']
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
//# sourceMappingURL=tag-registry.test.js.map