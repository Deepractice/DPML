/**
 * 测试 ID: UT-P-002
 * 测试名称: 标签属性验证
 * 测试意图: 测试标签属性定义与验证
 * 预期结果: 各标签属性正确验证，必需属性检查有效
 */

import { TagValidationError } from '@dpml/core';
import { describe, it, expect } from 'vitest';

import {
  promptTagDefinition,
  roleTagDefinition,
  contextTagDefinition,
  thinkingTagDefinition,
  executingTagDefinition,
  testingTagDefinition,
  protocolTagDefinition,
  customTagDefinition,
} from '../../tags';

describe('标签属性验证', () => {
  // 测试prompt标签属性定义
  describe('prompt标签属性', () => {
    it('应该包含正确的属性定义', () => {
      // 验证prompt标签定义包含预期的属性
      expect(promptTagDefinition.attributes).toHaveProperty('id');
      expect(promptTagDefinition.attributes).toHaveProperty('version');
      expect(promptTagDefinition.attributes).toHaveProperty('lang');
      expect(promptTagDefinition.attributes).toHaveProperty('extends');

      // 验证属性类型
      expect(promptTagDefinition.attributes.id.type).toBe('string');
      expect(promptTagDefinition.attributes.version.type).toBe('string');
      expect(promptTagDefinition.attributes.lang.type).toBe('string');
      expect(promptTagDefinition.attributes.extends.type).toBe('string');

      // 验证属性是否必需
      expect(promptTagDefinition.attributes.id.required).toBe(false);
      expect(promptTagDefinition.attributes.version.required).toBe(false);
      expect(promptTagDefinition.attributes.lang.required).toBe(false);
      expect(promptTagDefinition.attributes.extends.required).toBe(false);
    });

    it('应该包含正确的嵌套规则', () => {
      // 验证允许的子标签
      expect(promptTagDefinition.allowedChildren).toEqual([
        'role',
        'context',
        'thinking',
        'executing',
        'testing',
        'protocol',
        'custom',
      ]);

      // 验证内容格式
      expect(promptTagDefinition.contentFormat).toBe('markdown');
    });
  });

  // 测试role标签属性定义
  describe('role标签属性', () => {
    it('应该包含正确的属性定义', () => {
      expect(roleTagDefinition.attributes).toHaveProperty('id');
      expect(roleTagDefinition.attributes).toHaveProperty('extends');

      expect(roleTagDefinition.attributes.id.type).toBe('string');
      expect(roleTagDefinition.attributes.extends.type).toBe('string');

      expect(roleTagDefinition.attributes.id.required).toBe(false);
      expect(roleTagDefinition.attributes.extends.required).toBe(false);
    });

    it('应该包含正确的内容规则', () => {
      expect(roleTagDefinition.allowedChildren).toEqual([]);
      expect(roleTagDefinition.contentFormat).toBe('markdown');
    });
  });

  // 测试其他标签的共同属性
  describe('核心标签共同属性', () => {
    const coreTags = [
      { name: 'context', def: contextTagDefinition },
      { name: 'thinking', def: thinkingTagDefinition },
      { name: 'executing', def: executingTagDefinition },
      { name: 'testing', def: testingTagDefinition },
      { name: 'protocol', def: protocolTagDefinition },
      { name: 'custom', def: customTagDefinition },
    ];

    coreTags.forEach(tag => {
      it(`${tag.name}标签应该包含id和extends属性`, () => {
        expect(tag.def.attributes).toHaveProperty('id');
        expect(tag.def.attributes).toHaveProperty('extends');

        expect(tag.def.attributes.id.type).toBe('string');
        expect(tag.def.attributes.extends.type).toBe('string');

        expect(tag.def.attributes.id.required).toBe(false);
        expect(tag.def.attributes.extends.required).toBe(false);
      });

      it(`${tag.name}标签应该有正确的内容格式`, () => {
        expect(tag.def.allowedChildren).toEqual([]);
        expect(tag.def.contentFormat).toBe('markdown');
      });
    });
  });
});
