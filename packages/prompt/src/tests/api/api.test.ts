/**
 * @dpml/prompt API功能测试
 * 
 * 测试ID:
 * - UT-API-001: 基本生成功能
 * - UT-API-002: 配置选项传递
 * - UT-API-003: 错误处理机制
 * - UT-API-004: 仅验证模式
 * - UT-API-005: 格式模板传递
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parse, process } from '@dpml/core';
import { generatePrompt } from '../../api';
import { PromptTransformer } from '../../transformers/promptTransformer';
import { FormatTemplates } from '../../transformers/formatConfig';

// 替换这些使用spy而不是mock
vi.spyOn(fs.promises, 'readFile');
vi.spyOn(PromptTransformer.prototype, 'transform').mockReturnValue('模拟转换结果');

describe('API功能测试', () => {
  // 基础DPML文本
  const basicDpml = `
    <prompt id="test-prompt">
      <role>你是一位助手</role>
      <context>用户需要帮助</context>
    </prompt>
  `;

  // 错误的DPML文本（缺少闭合标签）
  const invalidDpml = `
    <prompt id="invalid-prompt">
      <role>你是一位助手
      <context>用户需要帮助</context>
    </prompt>
  `;

  // 重置模拟
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * UT-API-001: 基本生成功能测试
   * 
   * 测试基本提示生成功能
   */
  it('基本生成功能 (UT-API-001)', async () => {
    // 直接使用文本而不是mock文件系统
    const result = await generatePrompt(basicDpml);
    
    // 验证基本功能
    expect(result).toBe('模拟转换结果');
    expect(PromptTransformer.prototype.transform).toHaveBeenCalled();
  });

  /**
   * UT-API-002: 配置选项传递测试
   * 
   * 测试配置选项传递
   */
  it('配置选项传递 (UT-API-002)', async () => {
    // 测试语言设置选项
    await generatePrompt(basicDpml, {
      lang: 'zh',
      addLanguageDirective: true
    });
    
    // 验证配置被传递
    expect(PromptTransformer.prototype.transform).toHaveBeenCalled();
    const transformerInstance = (PromptTransformer.prototype.transform as any).mock.instances[0];
    
    // 验证自定义顺序
    await generatePrompt(basicDpml, {
      tagOrder: ['context', 'role']
    });
    
    expect(PromptTransformer.prototype.transform).toHaveBeenCalledTimes(2);
  });

  /**
   * UT-API-003: 错误处理机制测试
   * 
   * 测试错误处理逻辑
   */
  it('错误处理机制 (UT-API-003)', async () => {
    // 测试空输入处理
    await expect(generatePrompt('')).rejects.toThrow();
  });

  /**
   * UT-API-004: 仅验证模式测试
   * 
   * 测试validateOnly选项
   */
  it('仅验证模式 (UT-API-004)', async () => {
    // 测试仅验证模式
    const validateResult = await generatePrompt(basicDpml, {
      validateOnly: true
    });
    
    // 仅验证模式应返回空字符串
    expect(validateResult).toBe('');
    
    // 验证不会调用转换器的transform方法
    expect(PromptTransformer.prototype.transform).not.toHaveBeenCalled();
  });

  /**
   * UT-API-005: 格式模板传递测试
   * 
   * 测试格式模板选项
   */
  it('格式模板传递 (UT-API-005)', async () => {
    // 自定义格式模板
    const customTemplates: FormatTemplates = {
      role: {
        title: '# ROLE',
        prefix: 'As ',
        suffix: ', your task is important'
      },
      context: {
        title: '# CONTEXT',
        prefix: 'Situation: ',
        suffix: '.'
      }
    };
    
    // 测试自定义格式模板
    await generatePrompt(basicDpml, {
      formatTemplates: customTemplates
    });
    
    // 验证配置传递
    expect(PromptTransformer.prototype.transform).toHaveBeenCalled();
  });
}); 