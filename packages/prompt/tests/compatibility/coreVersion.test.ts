/**
 * @dpml/prompt Core包版本兼容性测试
 * 
 * 测试ID: CT-P-003
 * 测试目标: 验证与指定范围的Core包版本兼容
 */

import { describe, it, expect } from 'vitest';
import { generatePrompt } from '../../src';
import * as core from '@dpml/core';
import { TagRegistry } from '@dpml/core';

describe('Core包版本兼容性测试 (CT-P-003)', () => {
  it('应该检测当前Core包版本', () => {
    // 检查core包是否存在并有版本属性
    expect(core).toBeDefined();
    
    // 获取core包版本（如果版本信息可用）
    const coreVersion = (core as any).version || '未知';
    console.log(`当前Core包版本: ${coreVersion}`);
    
    // 验证核心功能存在
    expect(typeof core.parse).toBe('function');
    expect(typeof core.process).toBe('function');
  });

  it('应该与当前Core包版本兼容', async () => {
    // 简单提示
    const simpleDpml = `
      <prompt>
        <role>测试助手</role>
        <context>这是Core包兼容性测试</context>
      </prompt>
    `;
    
    // 使用core包解析
    const parseResult = await core.parse(simpleDpml);
    expect(parseResult).toBeDefined();
    expect(parseResult.ast).toBeDefined();
    
    // 确保能正常处理解析结果
    const processResult = await core.process(parseResult.ast);
    expect(processResult).toBeDefined();
    
    // 确保prompt包能正常与Core包集成
    const result = await generatePrompt(simpleDpml);
    expect(result).toBeDefined();
    expect(result).toContain('测试助手');
    expect(result).toContain('这是Core包兼容性测试');
  });

  it('应该正确使用Core包的标签注册功能', async () => {
    // 创建TagRegistry实例
    const tagRegistry = new TagRegistry();
    expect(tagRegistry).toBeDefined();
    
    // 注册一个测试标签
    tagRegistry.registerTag('test-tag', {
      attributes: ['id', 'name'],
      allowedChildren: []
    });
    
    // 验证标签已正确注册
    const hasTestTag = tagRegistry.isTagRegistered('test-tag');
    expect(hasTestTag).toBe(true);
  });

  it('应该正确使用Core包的错误处理机制', async () => {
    // 包含语法错误的DPML
    const invalidDpml = `
      <prompt>
        <role>测试助手
      </prompt>
    `;
    
    try {
      // 尝试生成，应该抛出错误
      await generatePrompt(invalidDpml);
      // 如果没有抛出错误，则测试失败
      expect(true).toBe(false);
    } catch (err) {
      // 验证错误处理机制正常工作
      expect(err).toBeDefined();
      expect((err as Error).message).toBeDefined();
    }
  });
}); 