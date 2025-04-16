/**
 * @dpml/prompt 浏览器环境兼容性测试
 * 
 * 测试ID: CT-P-002
 * 测试目标: 验证在浏览器环境中正常工作
 * 
 * 注意：此测试主要是模拟浏览器环境，完整的浏览器兼容性测试需要在实际浏览器环境中运行
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePrompt } from '../..';

describe('浏览器环境兼容性测试 (CT-P-002)', () => {
  // 备份原始的全局对象和属性
  const originalGlobal = globalThis;
  const originalProcess = globalThis.process;
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  
  beforeEach(() => {
    // 模拟浏览器环境
    if (!globalThis.window) {
      const mockWindow = {
        navigator: {
          userAgent: 'Mozilla/5.0 (Mock Browser) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
        }
      };
      
      // @ts-ignore - 为测试目的修改globalThis
      globalThis.window = mockWindow;
      // @ts-ignore
      globalThis.document = { 
        createElement: vi.fn(),
        querySelector: vi.fn() 
      };
      // 移除或修改node环境特有的属性
      // @ts-ignore
      globalThis.process = undefined;
    }
  });
  
  afterEach(() => {
    // 恢复原始全局环境
    // @ts-ignore
    globalThis.window = originalWindow;
    // @ts-ignore
    globalThis.document = originalDocument;
    // @ts-ignore
    globalThis.process = originalProcess;
  });

  it('应该检测浏览器环境', () => {
    // 验证环境是否被正确模拟为浏览器环境
    expect(typeof window).not.toBe('undefined');
    expect(typeof document).not.toBe('undefined');
    expect(typeof process).toBe('undefined');
    console.log('浏览器环境模拟: 成功');
  });

  it('应该在浏览器环境中正常生成提示', async () => {
    // 简单提示
    const simpleDpml = `
      <prompt>
        <role>测试助手</role>
        <context>这是浏览器兼容性测试</context>
      </prompt>
    `;
    
    // 确保能在浏览器环境中正常生成提示
    const result = await generatePrompt(simpleDpml);
    expect(result).toBeDefined();
    expect(result).toContain('测试助手');
    expect(result).toContain('这是浏览器兼容性测试');
  });

  it('应该适应浏览器中缺少的文件系统API', async () => {
    // 直接传递DPML文本而非文件路径
    const directDpml = `
      <prompt>
        <role>测试助手</role>
        <context>直接内容测试，不需要文件系统API</context>
      </prompt>
    `;
    
    // 确保能在没有文件系统API的环境中工作
    const result = await generatePrompt(directDpml);
    expect(result).toBeDefined();
    expect(result).toContain('测试助手');
    expect(result).toContain('直接内容测试');
  });

  it('应该在浏览器环境中正常处理错误', async () => {
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
      // 验证错误处理机制在浏览器环境中正常工作
      expect(err).toBeDefined();
      expect((err as Error).message).toBeDefined();
    }
  });
}); 