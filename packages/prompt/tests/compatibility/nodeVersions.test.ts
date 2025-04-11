/**
 * @dpml/prompt Node.js版本兼容性测试
 * 
 * 测试ID: CT-P-001
 * 测试目标: 验证在支持的Node.js版本范围内系统正常工作
 */

import { describe, it, expect } from 'vitest';
import { generatePrompt } from '../../src/api';
import { getNodeVersion } from './utils/environmentHelpers';

describe('Node.js版本兼容性测试 (CT-P-001)', () => {
  it('当前Node.js版本应该在支持范围内', () => {
    const nodeVersion = getNodeVersion();
    const majorVersion = parseInt(nodeVersion.split('.')[0]);
    
    // 检查当前版本是否>=16
    expect(majorVersion).toBeGreaterThanOrEqual(16);
    console.log(`通过: 当前Node.js版本 ${nodeVersion} 在支持范围内`);
  });

  it('应该在当前Node.js版本上正常生成提示', async () => {
    const simpleDpml = `
      <prompt>
        <role>测试助手</role>
        <context>这是兼容性测试</context>
      </prompt>
    `;
    
    // 确保能正常生成提示
    const result = await generatePrompt(simpleDpml);
    expect(result).toBeDefined();
    expect(result).toContain('测试助手');
    expect(result).toContain('这是兼容性测试');
  });
}); 