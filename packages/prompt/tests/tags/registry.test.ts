/**
 * 测试 ID: UT-P-001
 * 测试名称: 基础标签注册
 * 测试意图: 测试8个核心标签的注册
 * 预期结果: 所有标签被正确注册到TagRegistry
 */

import { describe, it, expect } from 'vitest';
import { TagRegistry } from '@dpml/core';
import {
  promptTagDefinition,
  roleTagDefinition,
  contextTagDefinition,
  thinkingTagDefinition,
  executingTagDefinition,
  testingTagDefinition,
  protocolTagDefinition,
  customTagDefinition,
  createPromptTagRegistry,
  promptTagRegistry
} from '../../src/tags';

describe('PromptTagRegistry', () => {
  // UT-P-001: 基础标签注册
  describe('基础标签注册', () => {
    it('应该正确注册所有8个核心标签', () => {
      // 检查单例是否已经创建
      expect(promptTagRegistry).toBeInstanceOf(TagRegistry);
      
      // 检查核心标签是否被正确注册
      expect(promptTagRegistry.isTagRegistered('prompt')).toBe(true);
      expect(promptTagRegistry.isTagRegistered('role')).toBe(true);
      expect(promptTagRegistry.isTagRegistered('context')).toBe(true);
      expect(promptTagRegistry.isTagRegistered('thinking')).toBe(true);
      expect(promptTagRegistry.isTagRegistered('executing')).toBe(true);
      expect(promptTagRegistry.isTagRegistered('testing')).toBe(true);
      expect(promptTagRegistry.isTagRegistered('protocol')).toBe(true);
      expect(promptTagRegistry.isTagRegistered('custom')).toBe(true);
    });
    
    it('应该通过工厂函数创建新的注册表实例', () => {
      // 创建新的注册表实例
      const registry = createPromptTagRegistry();
      
      // 检查是否创建了新的实例
      expect(registry).toBeInstanceOf(TagRegistry);
      expect(registry).not.toBe(promptTagRegistry); // 不应该是同一个实例
      
      // 检查新实例是否包含所有标签
      expect(registry.isTagRegistered('prompt')).toBe(true);
      expect(registry.isTagRegistered('role')).toBe(true);
      expect(registry.isTagRegistered('context')).toBe(true);
      expect(registry.isTagRegistered('thinking')).toBe(true);
      expect(registry.isTagRegistered('executing')).toBe(true);
      expect(registry.isTagRegistered('testing')).toBe(true);
      expect(registry.isTagRegistered('protocol')).toBe(true);
      expect(registry.isTagRegistered('custom')).toBe(true);
    });
    
    it('应该能获取正确的标签定义', () => {
      // 获取标签定义 - 使用 getTagDefinition 方法替代 get
      const promptDef = promptTagRegistry.getTagDefinition('prompt');
      const roleDef = promptTagRegistry.getTagDefinition('role');
      const contextDef = promptTagRegistry.getTagDefinition('context');
      const thinkingDef = promptTagRegistry.getTagDefinition('thinking');
      const executingDef = promptTagRegistry.getTagDefinition('executing');
      const testingDef = promptTagRegistry.getTagDefinition('testing');
      const protocolDef = promptTagRegistry.getTagDefinition('protocol');
      const customDef = promptTagRegistry.getTagDefinition('custom');
      
      // 验证标签定义内容
      expect(promptDef).toEqual(promptTagDefinition);
      expect(roleDef).toEqual(roleTagDefinition);
      expect(contextDef).toEqual(contextTagDefinition);
      expect(thinkingDef).toEqual(thinkingTagDefinition);
      expect(executingDef).toEqual(executingTagDefinition);
      expect(testingDef).toEqual(testingTagDefinition);
      expect(protocolDef).toEqual(protocolTagDefinition);
      expect(customDef).toEqual(customTagDefinition);
    });
  });
}); 