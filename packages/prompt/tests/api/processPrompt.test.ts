/**
 * processPrompt API功能测试
 * 
 * 测试ID:
 * - UT-PRP-001: 基本处理功能 - 测试基本处理功能
 * - UT-PRP-002: 处理选项配置 - 测试处理选项影响
 * - UT-PRP-003: 严格模式切换 - 测试严格模式和宽松模式
 * - UT-PRP-004: 基础路径设置 - 测试基础路径影响
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parse, process as coreProcess } from '@dpml/core';
import { processPrompt } from '../../src/api/processPrompt';
import { PromptOptions } from '../../src/types';

// Mock核心包功能
vi.mock('@dpml/core', async () => {
  const actual = await vi.importActual('@dpml/core');
  return {
    // 模拟的函数
    parse: vi.fn(),
    process: vi.fn(),
    
    // 使用真实实现的错误类和常量
    DPMLError: actual.DPMLError,
    ErrorLevel: actual.ErrorLevel
  };
});

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn()
  }
}));

describe('processPrompt API功能测试', () => {
  // 基础DPML文本
  const basicDpml = `
    <prompt id="test-prompt">
      <role>你是一位助手</role>
      <context>用户需要帮助</context>
    </prompt>
  `;

  // 模拟解析结果
  const mockParseResult = {
    ast: { type: 'document', children: [] },
    errors: [],
    warnings: []
  };

  // 模拟处理结果
  const mockProcessedResult = {
    metadata: { id: 'test-prompt' },
    tags: {
      role: { content: '你是一位助手' },
      context: { content: '用户需要帮助' }
    }
  };

  // 重置模拟
  beforeEach(() => {
    vi.clearAllMocks();
    (parse as any).mockResolvedValue(mockParseResult);
    (coreProcess as any).mockResolvedValue(mockProcessedResult);
    (fs.promises.readFile as any).mockResolvedValue(basicDpml);
  });

  /**
   * UT-PRP-001: 基本处理功能测试
   * 
   * 测试基本DPML文本处理功能
   */
  it('基本处理功能 (UT-PRP-001)', async () => {
    // 测试文本输入
    const result = await processPrompt(basicDpml);
    
    // 验证基本功能 - 注意parse被调用时没有第二个参数
    expect(parse).toHaveBeenCalled();
    expect(coreProcess).toHaveBeenCalled();
    
    // 检查处理结果的结构（不要检查具体值）
    expect(result).toHaveProperty('metadata');
    expect(result).toHaveProperty('tags');
    expect(result).toHaveProperty('rawDocument');
  });

  /**
   * UT-PRP-002: 处理选项配置测试
   * 
   * 测试处理选项影响
   */
  it('处理选项配置 (UT-PRP-002)', async () => {
    // 测试处理选项
    const options: PromptOptions = {
      mode: 'strict',
      validateOnly: true
    };
    
    await processPrompt(basicDpml, options);
    
    // 验证选项传递
    expect(coreProcess).toHaveBeenCalledWith(
      mockParseResult.ast, 
      expect.objectContaining({
        validateOnly: true
      })
    );
  });

  /**
   * UT-PRP-003: 严格模式切换测试
   * 
   * 测试严格和宽松模式
   */
  it('严格模式切换 (UT-PRP-003)', async () => {
    // 测试严格模式
    await processPrompt(basicDpml, { mode: 'strict' });
    
    // 验证模式传递
    expect(coreProcess).toHaveBeenCalledWith(
      mockParseResult.ast, 
      expect.objectContaining({
        mode: 'strict',
        strictMode: true
      })
    );
    
    // 测试宽松模式
    await processPrompt(basicDpml, { mode: 'loose' });
    
    // 验证模式传递
    expect(coreProcess).toHaveBeenCalledWith(
      mockParseResult.ast, 
      expect.objectContaining({
        mode: 'loose',
        strictMode: false
      })
    );
  });

  /**
   * UT-PRP-004: 基础路径设置测试
   * 
   * 测试基础路径影响引用解析
   */
  it('基础路径设置 (UT-PRP-004)', async () => {
    // 模拟文件路径
    const filePath = './prompts/test.dpml';
    const basePath = '/user/custom/path';
    
    // 测试文件读取
    await processPrompt(filePath, { basePath });
    
    // 验证基础路径应用
    expect(fs.promises.readFile).toHaveBeenCalledWith(
      expect.stringContaining(basePath), 
      'utf-8'
    );
    
    // 验证处理参数包含基础路径
    expect(coreProcess).toHaveBeenCalledWith(
      mockParseResult.ast, 
      expect.objectContaining({
        basePath
      })
    );
  });
}); 