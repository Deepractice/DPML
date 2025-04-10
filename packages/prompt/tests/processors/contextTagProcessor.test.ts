import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext } from '@dpml/core';
import { describe, it, expect, vi } from 'vitest';
import { ContextTagProcessor } from '@prompt/processors/contextTagProcessor';

describe('ContextTagProcessor', () => {
  // 创建一个模拟的 ProcessingContext
  const createMockContext = (): ProcessingContext => {
    return {
      document: { 
        type: NodeType.DOCUMENT, 
        children: [],
        position: { 
          start: { line: 0, column: 0, offset: 0 }, 
          end: { line: 0, column: 0, offset: 0 } 
        } 
      },
      currentPath: '/test/path',
      filePath: '/test/path',
      resolvedReferences: new Map(),
      parentElements: [],
      variables: {},
      idMap: new Map()
    } as ProcessingContext;
  };

  // 创建一个内容节点
  const createContentNode = (text: string): Content => {
    return {
      type: NodeType.CONTENT,
      value: text,
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: text.length, offset: text.length } 
      }
    };
  };

  // UT-CP-001: 测试上下文属性和内容提取
  it('UT-CP-001: 应该正确提取上下文属性和内容', async () => {
    const processor = new ContextTagProcessor();
    const context = createMockContext();
    
    // 创建一个带属性的 context 元素
    const contextElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'context',
      attributes: {
        id: 'project-background',
        domain: 'software-development',
        importance: 'high'
      },
      children: [createContentNode('这是一个 DPML 项目，用于生成提示模板。')],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(contextElement, context);
    
    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.semantic.type).toBe('context');
    expect(result.metadata!.semantic.id).toBe('project-background');
    expect(result.metadata!.semantic.domain).toBe('software-development');
    expect(result.metadata!.semantic.importance).toBe('high');
    expect(result.metadata!.semantic.content).toBe('这是一个 DPML 项目，用于生成提示模板。');
    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('ContextTagProcessor');
  });

  // UT-CP-002: 测试复杂上下文内容提取（包含多个内容节点和Markdown格式）
  it('UT-CP-002: 应该正确处理复杂上下文内容', async () => {
    const processor = new ContextTagProcessor();
    const context = createMockContext();
    
    // 创建一个包含多行内容和Markdown格式的 context 元素
    const contextElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'context',
      attributes: {
        format: 'markdown'
      },
      children: [
        createContentNode('## 项目背景\n\n'),
        createContentNode('DPML是一个领域特定标记语言，用于生成AI提示。\n\n'),
        createContentNode('- 它基于XML格式\n'),
        createContentNode('- 支持多种标签\n'),
        createContentNode('- 可以定义复杂的提示模板')
      ],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(contextElement, context);
    
    // 验证多行内容是否被正确组合
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.semantic.format).toBe('markdown');
    expect(result.metadata!.semantic.content).toBe(
      '## 项目背景\n\n' +
      'DPML是一个领域特定标记语言，用于生成AI提示。\n\n' +
      '- 它基于XML格式\n' +
      '- 支持多种标签\n' +
      '- 可以定义复杂的提示模板'
    );
  });

  // 测试canProcess方法和优先级
  it('应该正确识别context标签并设置适当的优先级', () => {
    const processor = new ContextTagProcessor();
    
    // 创建一个 context 元素
    const contextElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'context',
      attributes: {},
      children: [],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    // 创建一个非 context 元素
    const otherElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'other',
      attributes: {},
      children: [],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    expect(processor.canProcess(contextElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });
}); 