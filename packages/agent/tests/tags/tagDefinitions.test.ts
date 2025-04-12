/**
 * 标签定义与注册测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TagRegistry } from '@dpml/core';
import { registerTags, agentTagDefinition, llmTagDefinition, promptTagDefinition } from '../../src/tags';

describe('Agent标签定义与注册', () => {
  let registry: TagRegistry;

  beforeEach(() => {
    registry = new TagRegistry();
  });

  it('UT-A-001: 应该正确注册所有核心标签', () => {
    // 执行标签注册
    registerTags(registry);

    // 验证是否成功注册了三个核心标签
    expect(registry.isTagRegistered('agent')).toBe(true);
    expect(registry.isTagRegistered('llm')).toBe(true);
    expect(registry.isTagRegistered('prompt')).toBe(true);
  });

  it('UT-A-002: agent标签应该有正确的属性定义', () => {
    // 执行标签注册
    registerTags(registry);

    // 获取agent标签定义
    const agentDef = registry.getTagDefinition('agent');
    
    // 验证基本结构
    expect(agentDef).toBeDefined();
    // 检查attributes对象是否包含预期的基本属性
    expect(agentDef?.attributes).toBeDefined();
    expect('id' in (agentDef?.attributes || {})).toBe(true);
    
    // 验证标签名称
    expect(agentDef?.name).toBe('agent');
    
    // 验证不是自闭合标签
    expect(agentDef?.selfClosing).toBe(false);
  });

  it('UT-A-003: 标签应该定义正确的嵌套规则', () => {
    // 执行标签注册
    registerTags(registry);

    // 获取标签定义
    const agentDef = registry.getTagDefinition('agent');
    const llmDef = registry.getTagDefinition('llm');
    const promptDef = registry.getTagDefinition('prompt');
    
    // 验证嵌套规则
    expect(agentDef?.allowedChildren).toContain('llm');
    expect(agentDef?.allowedChildren).toContain('prompt');
    
    // 验证llm标签不允许有子标签
    expect(llmDef?.allowedChildren?.length).toBe(0);
  });

  it('UT-A-004: llm标签应该有正确的属性定义', () => {
    // 执行标签注册
    registerTags(registry);

    // 获取llm标签定义
    const llmDef = registry.getTagDefinition('llm');
    
    // 验证基本结构
    expect(llmDef).toBeDefined();
    // 检查attributes对象是否包含预期的基本属性
    expect(llmDef?.attributes).toBeDefined();
    expect('id' in (llmDef?.attributes || {})).toBe(true);
    
    // 验证标签名称
    expect(llmDef?.name).toBe('llm');
    
    // 验证不是自闭合标签
    expect(llmDef?.selfClosing).toBe(false);
  });

  it('UT-A-005: 应该在注册时检查重复ID', () => {
    // 执行标签注册
    registerTags(registry);
    
    // 模拟两个agent标签用于测试
    const element1 = {
      tagName: 'agent',
      attributes: { id: 'duplicate-id' },
      children: []
    };
    
    const element2 = {
      tagName: 'agent',
      attributes: { id: 'duplicate-id' },
      children: []
    };
    
    // 验证ID检查
    const validation1 = agentTagDefinition.validator(element1 as any, {});
    expect(validation1.valid).toBe(false); // 应该失败，因为缺少必需的子标签
    
    // 模拟ID已存在
    const context = { ids: new Map([['duplicate-id', element1]]) };
    const validation2 = agentTagDefinition.validator(element2 as any, context);
    
    // 检查重复ID的验证
    if (validation2.errors) {
      expect(validation2.errors.some(error => error.code === 'DUPLICATE_ID'))
        .toBe(true); // 现在validateAgentTag实现应该检查重复ID
    }
  });
}); 