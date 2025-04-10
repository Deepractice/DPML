/**
 * 测试 ID: UT-P-004
 * 测试名称: 标签ID唯一性检查
 * 测试意图: 测试标签ID唯一性验证机制
 * 预期结果: 正确验证ID唯一性，拒绝重复ID
 */

import { describe, it, expect } from 'vitest';
import { promptTagRegistry } from '../../src/tags';

describe('标签ID唯一性检查', () => {
  describe('ID唯一性验证', () => {
    it('应该检测重复ID并报错', () => {
      // 创建一个模拟的文档结构，其中包含重复ID
      const mockDocument = {
        type: 'element',
        tagName: 'prompt',
        attributes: { id: 'doc1' },
        children: [
          {
            type: 'element',
            tagName: 'role',
            attributes: { id: 'section1' },
            children: [],
            content: '角色描述'
          },
          {
            type: 'element',
            tagName: 'context',
            attributes: { id: 'section1' }, // 重复的ID
            children: [],
            content: '上下文描述'
          }
        ],
        content: ''
      };
      
      // 验证是否能检测到重复ID
      expect(() => promptTagRegistry.validateIdUniqueness(mockDocument)).toThrow();
      expect(() => promptTagRegistry.validateIdUniqueness(mockDocument)).toThrow(/重复的ID/);
    });
    
    it('应该允许没有重复ID的文档通过验证', () => {
      // 创建一个模拟的文档结构，没有重复ID
      const mockDocument = {
        type: 'element',
        tagName: 'prompt',
        attributes: { id: 'doc1' },
        children: [
          {
            type: 'element',
            tagName: 'role',
            attributes: { id: 'section1' },
            children: [],
            content: '角色描述'
          },
          {
            type: 'element',
            tagName: 'context',
            attributes: { id: 'section2' }, // 不同的ID
            children: [],
            content: '上下文描述'
          }
        ],
        content: ''
      };
      
      // 验证没有重复ID的文档能通过验证
      expect(() => promptTagRegistry.validateIdUniqueness(mockDocument)).not.toThrow();
    });
    
    it('应该正确处理没有ID的标签', () => {
      // 创建一个模拟的文档结构，部分标签没有ID
      const mockDocument = {
        type: 'element',
        tagName: 'prompt',
        attributes: { id: 'doc1' },
        children: [
          {
            type: 'element',
            tagName: 'role',
            attributes: {}, // 没有ID
            children: [],
            content: '角色描述'
          },
          {
            type: 'element',
            tagName: 'context',
            attributes: { id: 'section1' },
            children: [],
            content: '上下文描述'
          }
        ],
        content: ''
      };
      
      // 验证能正确处理没有ID的标签
      expect(() => promptTagRegistry.validateIdUniqueness(mockDocument)).not.toThrow();
    });
  });
}); 