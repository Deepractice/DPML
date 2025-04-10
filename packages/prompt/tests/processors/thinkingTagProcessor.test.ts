import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext } from '@dpml/core';
import { describe, it, expect, vi } from 'vitest';
import { ThinkingTagProcessor } from '@prompt/processors/thinkingTagProcessor';

describe('ThinkingTagProcessor', () => {
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

  // UT-TP-001: 测试思维框架属性和内容提取
  it('UT-TP-001: 应该正确提取思维框架属性和内容', async () => {
    const processor = new ThinkingTagProcessor();
    const context = createMockContext();
    
    // 创建一个带属性的 thinking 元素
    const thinkingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'thinking',
      attributes: {
        id: 'problem-solving',
        approach: 'structured',
        style: 'analytical'
      },
      children: [createContentNode('1. 分析问题\n2. 拆解步骤\n3. 逐步解决')],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(thinkingElement, context);
    
    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.semantic.type).toBe('thinking');
    expect(result.metadata!.semantic.id).toBe('problem-solving');
    expect(result.metadata!.semantic.approach).toBe('structured');
    expect(result.metadata!.semantic.style).toBe('analytical');
    expect(result.metadata!.semantic.framework).toBe('1. 分析问题\n2. 拆解步骤\n3. 逐步解决');
    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('ThinkingTagProcessor');
  });

  // UT-TP-002: 测试复杂思维框架内容提取（包含多个内容节点和格式）
  it('UT-TP-002: 应该正确处理复杂思维框架内容', async () => {
    const processor = new ThinkingTagProcessor();
    const context = createMockContext();
    
    // 创建一个包含复杂思维框架的 thinking 元素
    const thinkingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'thinking',
      attributes: {
        format: 'markdown'
      },
      children: [
        createContentNode('## 问题解决思路\n\n'),
        createContentNode('### 1. 理解问题\n'),
        createContentNode('- 明确需求和约束条件\n'),
        createContentNode('- 识别关键信息\n\n'),
        createContentNode('### 2. 制定计划\n'),
        createContentNode('- 确定解决方案\n'),
        createContentNode('- 设计实现步骤\n')
      ],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(thinkingElement, context);
    
    // 验证多行内容是否被正确组合
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.semantic.format).toBe('markdown');
    expect(result.metadata!.semantic.framework).toBe(
      '## 问题解决思路\n\n' +
      '### 1. 理解问题\n' +
      '- 明确需求和约束条件\n' +
      '- 识别关键信息\n\n' +
      '### 2. 制定计划\n' +
      '- 确定解决方案\n' +
      '- 设计实现步骤\n'
    );
  });

  // 测试canProcess方法和优先级
  it('应该正确识别thinking标签并设置适当的优先级', () => {
    const processor = new ThinkingTagProcessor();
    
    // 创建一个 thinking 元素
    const thinkingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'thinking',
      attributes: {},
      children: [],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    // 创建一个非 thinking 元素
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
    
    expect(processor.canProcess(thinkingElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });
}); 