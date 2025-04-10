/**
 * 测试 ID: UT-P-005
 * 测试名称: 标签验证机制测试
 * 测试意图: 测试标签的整体验证机制
 * 预期结果: 正确验证标签内容、属性和结构
 */

import { describe, it, expect } from 'vitest';
import { promptTagRegistry } from '../../src/tags';

describe('标签验证机制', () => {
  describe('标签内容验证', () => {
    it('应该验证标签内容格式', () => {
      // 测试有效内容
      expect(() => promptTagRegistry.validateContent('prompt', '# Markdown标题\n正文内容')).not.toThrow();
      expect(() => promptTagRegistry.validateContent('role', '* 列表项\n* 另一个列表项')).not.toThrow();
      
      // 测试不存在的标签
      expect(() => promptTagRegistry.validateContent('nonexistent', '内容')).toThrow();
    });
  });
  
  describe('属性验证', () => {
    it('应该验证属性类型', () => {
      // 测试有效属性值
      expect(() => promptTagRegistry.validateAttribute('prompt', 'id', 'doc1')).not.toThrow();
      expect(() => promptTagRegistry.validateAttribute('prompt', 'version', '1.0')).not.toThrow();
      expect(() => promptTagRegistry.validateAttribute('prompt', 'lang', 'zh-CN')).not.toThrow();
      
      // 测试无效属性值
      expect(() => promptTagRegistry.validateAttribute('prompt', 'id', 123)).toThrow(); // 数字而非字符串
      expect(() => promptTagRegistry.validateAttribute('prompt', 'nonexistent', 'value')).toThrow(); // 不存在的属性
      expect(() => promptTagRegistry.validateAttribute('nonexistent', 'id', 'value')).toThrow(); // 不存在的标签
    });
  });
  
  describe('结构验证', () => {
    it('应该验证嵌套规则', () => {
      // 创建一个有效的嵌套结构
      const validNesting = {
        type: 'element',
        tagName: 'prompt',
        attributes: { id: 'doc1' },
        children: [
          {
            type: 'element',
            tagName: 'role',
            attributes: { id: 'role1' },
            children: [],
            content: '角色描述'
          }
        ],
        content: ''
      };
      
      // 创建一个无效的嵌套结构
      const invalidNesting = {
        type: 'element',
        tagName: 'role',
        attributes: { id: 'role1' },
        children: [
          {
            type: 'element',
            tagName: 'context', // role不允许嵌套子标签
            attributes: { id: 'context1' },
            children: [],
            content: '上下文描述'
          }
        ],
        content: '角色描述'
      };
      
      // 验证
      expect(() => promptTagRegistry.validateStructure(validNesting)).not.toThrow();
      expect(() => promptTagRegistry.validateStructure(invalidNesting)).toThrow();
    });
  });
}); 