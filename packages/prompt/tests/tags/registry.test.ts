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
      expect(promptTagRegistry.has('prompt')).toBe(true);
      expect(promptTagRegistry.has('role')).toBe(true);
      expect(promptTagRegistry.has('context')).toBe(true);
      expect(promptTagRegistry.has('thinking')).toBe(true);
      expect(promptTagRegistry.has('executing')).toBe(true);
      expect(promptTagRegistry.has('testing')).toBe(true);
      expect(promptTagRegistry.has('protocol')).toBe(true);
      expect(promptTagRegistry.has('custom')).toBe(true);
    });
    
    it('应该通过工厂函数创建新的注册表实例', () => {
      // 创建新的注册表实例
      const registry = createPromptTagRegistry();
      
      // 检查是否创建了新的实例
      expect(registry).toBeInstanceOf(TagRegistry);
      expect(registry).not.toBe(promptTagRegistry); // 不应该是同一个实例
      
      // 检查新实例是否包含所有标签
      expect(registry.has('prompt')).toBe(true);
      expect(registry.has('role')).toBe(true);
      expect(registry.has('context')).toBe(true);
      expect(registry.has('thinking')).toBe(true);
      expect(registry.has('executing')).toBe(true);
      expect(registry.has('testing')).toBe(true);
      expect(registry.has('protocol')).toBe(true);
      expect(registry.has('custom')).toBe(true);
    });
    
    it('应该能获取正确的标签定义', () => {
      // 获取标签定义
      const promptDef = promptTagRegistry.get('prompt');
      const roleDef = promptTagRegistry.get('role');
      const contextDef = promptTagRegistry.get('context');
      const thinkingDef = promptTagRegistry.get('thinking');
      const executingDef = promptTagRegistry.get('executing');
      const testingDef = promptTagRegistry.get('testing');
      const protocolDef = promptTagRegistry.get('protocol');
      const customDef = promptTagRegistry.get('custom');
      
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