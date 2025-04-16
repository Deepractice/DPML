/**
 * transformPrompt API功能测试
 * 
 * 测试ID:
 * - UT-TRP-001: 基本转换功能 - 测试基本转换功能
 * - UT-TRP-002: 转换选项配置 - 测试转换选项影响
 * - UT-TRP-003: 标签格式化 - 测试标签格式化选项
 * - UT-TRP-004: 输出一致性 - 测试相同输入多次转换
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformPrompt } from '../../api/transformPrompt';
import { PromptTransformer } from '../../transformers/promptTransformer';
import { ProcessedPrompt, TransformOptions } from '../../../types';

// Mock PromptTransformer和transform方法
const mockTransform = vi.fn().mockReturnValue('模拟转换结果');
vi.mock('../../transformers/promptTransformer', () => ({
  PromptTransformer: vi.fn().mockImplementation(() => ({
    transform: mockTransform
  }))
}));

describe('transformPrompt API功能测试', () => {
  // 模拟处理后的提示结果
  const mockProcessedPrompt: ProcessedPrompt = {
    metadata: { 
      id: 'test-prompt',
      lang: 'zh' 
    },
    tags: {
      role: { 
        content: '你是一位助手',
        attributes: { type: 'assistant' }
      },
      context: { 
        content: '用户需要帮助',
        attributes: { domain: 'general' }
      }
    }
  };

  // 重置模拟
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * UT-TRP-001: 基本转换功能测试
   * 
   * 测试基本转换功能
   */
  it('基本转换功能 (UT-TRP-001)', async () => {
    // 模拟rawDocument属性
    const promptWithRaw = {
      ...mockProcessedPrompt,
      rawDocument: { type: 'document', children: [] }
    };
    
    // 测试基本转换
    const result = transformPrompt(promptWithRaw);
    
    // 验证转换器创建和调用
    expect(PromptTransformer).toHaveBeenCalled();
    expect(result).toBe('模拟转换结果');
    
    // 验证transform方法被调用
    expect(mockTransform).toHaveBeenCalled();
  });

  /**
   * UT-TRP-002: 转换选项配置测试
   * 
   * 测试转换选项影响
   */
  it('转换选项配置 (UT-TRP-002)', async () => {
    // 模拟rawDocument属性
    const promptWithRaw = {
      ...mockProcessedPrompt,
      rawDocument: { type: 'document', children: [] }
    };
    
    // 测试转换选项
    const options: TransformOptions = {
      addLanguageDirective: true,
      tagOrder: ['context', 'role']
    };
    
    transformPrompt(promptWithRaw, options);
    
    // 验证转换器创建时传递正确选项
    expect(PromptTransformer).toHaveBeenCalledWith(
      expect.objectContaining({
        addLanguageDirective: true,
        tagOrder: ['context', 'role']
      })
    );
  });

  /**
   * UT-TRP-003: 标签格式化测试
   * 
   * 测试标签格式化选项
   */
  it('标签格式化 (UT-TRP-003)', async () => {
    // 模拟rawDocument属性
    const promptWithRaw = {
      ...mockProcessedPrompt,
      rawDocument: { type: 'document', children: [] }
    };
    
    // 测试格式化选项
    const formatOptions: TransformOptions = {
      format: {
        role: {
          title: '# 角色',
          prefix: '你是',
          suffix: '。'
        },
        context: {
          title: '# 上下文',
          prefix: '情境：',
          suffix: '。'
        }
      }
    };
    
    transformPrompt(promptWithRaw, formatOptions);
    
    // 验证格式选项传递
    expect(PromptTransformer).toHaveBeenCalledWith(
      expect.objectContaining({
        formatTemplates: expect.objectContaining({
          role: expect.objectContaining({
            title: '# 角色'
          }),
          context: expect.objectContaining({
            title: '# 上下文'
          })
        })
      })
    );
  });

  /**
   * UT-TRP-004: 输出一致性测试
   * 
   * 测试相同输入多次转换的一致性
   */
  it('输出一致性 (UT-TRP-004)', async () => {
    // 模拟rawDocument属性
    const promptWithRaw = {
      ...mockProcessedPrompt,
      rawDocument: { type: 'document', children: [] }
    };
    
    // 首次转换
    const result1 = transformPrompt(promptWithRaw);
    
    // 重置模拟
    vi.clearAllMocks();
    
    // 再次转换
    const result2 = transformPrompt(promptWithRaw);
    
    // 验证多次转换结果一致
    expect(result1).toBe(result2);
    expect(result1).toBe('模拟转换结果');
    expect(result2).toBe('模拟转换结果');
  });
}); 