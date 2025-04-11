/**
 * PromptTagProcessor 测试
 * 
 * 测试ID:
 * - UT-APP-001: 基本提示词处理
 * - UT-APP-002: 提示词委托处理
 * - UT-APP-003: extends属性处理
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Element, NodeType, Content, ProcessingContext } from '@dpml/core';
import { PromptTagProcessor } from '../../../src/tags/processors/PromptTagProcessor';

// 模拟@dpml/prompt包
vi.mock('@dpml/prompt', () => ({
  processPrompt: vi.fn().mockImplementation(async (text) => {
    return {
      metadata: { processed: true },
      tags: {
        prompt: {
          content: text,
          attributes: {}
        }
      }
    };
  })
}));

// 导入模拟后
import { processPrompt } from '@dpml/prompt';

// 扩展ProcessingContext类型以便测试
interface TestProcessingContext extends ProcessingContext {
  variables: Record<string, any>;
  metadata?: Record<string, any>;
  ids: Map<string, Element>;
  validationErrors: any[];
  warnings: any[];
}

describe('PromptTagProcessor', () => {
  // 创建一个简单的处理上下文
  function createContext(): TestProcessingContext {
    return {
      variables: {},
      metadata: {},
      ids: new Map(),
      validationErrors: [],
      warnings: []
    };
  }

  // 创建内容节点辅助函数
  function createContentNode(text: string): Content {
    return {
      type: NodeType.CONTENT,
      value: text,
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
  }

  // 创建Prompt元素辅助函数
  function createPromptElement(attributes: Record<string, any> = {}, content: string = ''): Element {
    const children = content ? [createContentNode(content)] : [];
    return {
      type: NodeType.ELEMENT,
      tagName: 'prompt',
      attributes,
      children,
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
  }

  // 在每个测试前重置模拟函数
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('UT-APP-001: 应正确处理基本提示词', async () => {
    // 创建处理器
    const processor = new PromptTagProcessor();
    
    // 创建提示词元素
    const element = createPromptElement({}, '你是一个有帮助的助手，请简洁明了地回答用户问题。');
    
    // 创建处理上下文
    const context = createContext();
    
    // 处理元素
    const result = await processor.process(element, context);
    
    // 验证元数据
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.prompt).toBeDefined();
    expect(result.metadata?.processed).toBe(true);
    expect(result.metadata?.processorName).toBe('PromptTagProcessor');
    
    // 验证内容被正确提取
    expect(result.metadata?.prompt.content).toBe('你是一个有帮助的助手，请简洁明了地回答用户问题。');
  });

  it('UT-APP-002: 应正确委托提示词处理给@dpml/prompt', async () => {
    // 创建处理器
    const processor = new PromptTagProcessor();
    
    // 创建提示词元素
    const promptText = '<prompt><role>研究助手</role><context>帮助研究</context></prompt>';
    const element = createPromptElement({}, promptText);
    
    // 创建处理上下文
    const context = createContext();
    
    // 处理元素
    await processor.process(element, context);
    
    // 验证调用processPrompt函数
    expect(processPrompt).toHaveBeenCalledTimes(1);
    expect(processPrompt).toHaveBeenCalledWith(expect.stringContaining(promptText), expect.any(Object));
  });

  it('UT-APP-003: 应正确处理extends属性', async () => {
    // 创建处理器
    const processor = new PromptTagProcessor();
    
    // 创建带有extends属性的元素
    const element = createPromptElement({
      'extends': 'base-prompt'
    }, '你是一个专业的科学顾问');
    
    // 创建处理上下文
    const context = createContext();
    
    // 处理元素
    const result = await processor.process(element, context);
    
    // 验证extends属性被正确记录
    expect(result.metadata?.prompt.extends).toBe('base-prompt');
    
    // 内容仍然被正确处理
    expect(result.metadata?.prompt.content).toBe('你是一个专业的科学顾问');
  });
}); 