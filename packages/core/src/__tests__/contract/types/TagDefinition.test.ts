/**
 * TagDefinition接口契约测试
 */
import { describe, test, expect } from 'vitest';

import type { TagDefinition } from '../../../types';
import { ContentModel } from '../../../types';

describe('CT-TagDefinition-Structure', () => {
  test('should have all required properties', () => {
    // 创建完整的TagDefinition对象
    const definition: TagDefinition = {
      name: 'test-tag',
      contentModel: ContentModel.MIXED,
      allowedAttributes: ['id', 'class', 'data-test'],
      requiredAttributes: ['id'],
      allowedChildren: ['child-tag', 'text-tag'],
      forbiddenChildren: ['forbidden-tag'],
      selfClosing: false,
      validateFn: (node) => true
    };

    // 验证所有属性存在和类型
    expect(definition).toHaveProperty('name');
    expect(typeof definition.name).toBe('string');

    expect(definition).toHaveProperty('contentModel');
    expect(definition.contentModel).toBe(ContentModel.MIXED);

    expect(definition).toHaveProperty('allowedAttributes');
    expect(Array.isArray(definition.allowedAttributes)).toBe(true);

    expect(definition).toHaveProperty('requiredAttributes');
    expect(Array.isArray(definition.requiredAttributes)).toBe(true);

    expect(definition).toHaveProperty('allowedChildren');
    expect(Array.isArray(definition.allowedChildren)).toBe(true);

    expect(definition).toHaveProperty('forbiddenChildren');
    expect(Array.isArray(definition.forbiddenChildren)).toBe(true);

    expect(definition).toHaveProperty('selfClosing');
    expect(typeof definition.selfClosing).toBe('boolean');

    expect(definition).toHaveProperty('validateFn');
    expect(typeof definition.validateFn).toBe('function');
  });

  test('should allow minimal definition with only required properties', () => {
    // 创建只有必要属性的TagDefinition
    const minimalDefinition: TagDefinition = {
      name: 'minimal-tag',
      contentModel: ContentModel.EMPTY
    };

    // 验证必要属性
    expect(minimalDefinition.name).toBe('minimal-tag');
    expect(minimalDefinition.contentModel).toBe(ContentModel.EMPTY);

    // 验证可选属性是未定义的
    expect(minimalDefinition.allowedAttributes).toBeUndefined();
    expect(minimalDefinition.requiredAttributes).toBeUndefined();
    expect(minimalDefinition.allowedChildren).toBeUndefined();
    expect(minimalDefinition.forbiddenChildren).toBeUndefined();
    expect(minimalDefinition.selfClosing).toBeUndefined();
    expect(minimalDefinition.validateFn).toBeUndefined();
  });

  test('should support all content model types', () => {
    // 测试不同的内容模型
    const emptyTag: TagDefinition = {
      name: 'empty-tag',
      contentModel: ContentModel.EMPTY
    };

    const contentOnlyTag: TagDefinition = {
      name: 'content-only-tag',
      contentModel: ContentModel.CONTENT_ONLY
    };

    const childrenOnlyTag: TagDefinition = {
      name: 'children-only-tag',
      contentModel: ContentModel.CHILDREN_ONLY
    };

    const mixedTag: TagDefinition = {
      name: 'mixed-tag',
      contentModel: ContentModel.MIXED
    };

    // 验证不同的内容模型
    expect(emptyTag.contentModel).toBe(ContentModel.EMPTY);
    expect(contentOnlyTag.contentModel).toBe(ContentModel.CONTENT_ONLY);
    expect(childrenOnlyTag.contentModel).toBe(ContentModel.CHILDREN_ONLY);
    expect(mixedTag.contentModel).toBe(ContentModel.MIXED);
  });
});
