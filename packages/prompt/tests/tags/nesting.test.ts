/**
 * 测试 ID: UT-P-003
 * 测试名称: 嵌套规则验证
 * 测试意图: 测试标签嵌套规则的验证机制
 * 预期结果: 正确验证合法嵌套结构，拒绝非法嵌套
 */

import { describe, it, expect } from 'vitest';
import { promptTagRegistry } from '../../src/tags';

describe('标签嵌套规则验证', () => {
  describe('允许嵌套规则', () => {
    it('prompt标签应该允许嵌套特定子标签', () => {
      const allowedChildren = ['role', 'context', 'thinking', 'executing', 'testing', 'protocol', 'custom'];
      
      // 验证所有允许的子标签
      allowedChildren.forEach(childTag => {
        expect(promptTagRegistry.validateNesting('prompt', childTag)).toBe(true);
      });
    });

    it('其他标签不应该允许嵌套子标签', () => {
      const parentTags = ['role', 'context', 'thinking', 'executing', 'testing', 'protocol', 'custom'];
      const childTags = ['role', 'context', 'thinking', 'executing', 'testing', 'protocol', 'custom'];
      
      // 验证所有非prompt标签不允许嵌套其他标签
      parentTags.forEach(parentTag => {
        childTags.forEach(childTag => {
          expect(promptTagRegistry.validateNesting(parentTag, childTag)).toBe(false);
        });
      });
    });
  });

  describe('嵌套验证功能', () => {
    it('应该能够验证未知标签的嵌套', () => {
      // 验证未知标签的嵌套
      expect(promptTagRegistry.validateNesting('unknown', 'role')).toBe(false);
      expect(promptTagRegistry.validateNesting('prompt', 'unknown')).toBe(false);
    });
  });
}); 