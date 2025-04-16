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
    expect(result.metadata!.thinking.id).toBe('problem-solving');
    expect(result.metadata!.thinking.approach).toBe('structured');
    expect(result.metadata!.thinking.framework).toBe('1. 分析问题\n2. 拆解步骤\n3. 逐步解决');
    
    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('ThinkingTagProcessor');
  });

  // UT-TP-002: 测试复杂思维框架内容提取
  it('UT-TP-002: 应该正确处理复杂思维框架内容', async () => {
    const processor = new ThinkingTagProcessor();
    const context = createMockContext();
    
    // 创建一个包含多行内容和Markdown格式的 thinking 元素
    const thinkingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'thinking',
      attributes: {
        id: 'complex-problem',
        format: 'markdown'
      },
      children: [
        createContentNode('## 问题解决思路\n\n'),
        createContentNode('1. 分析问题本质\n'),
        createContentNode('   - 确定根本原因\n'),
        createContentNode('   - 识别相关因素\n\n'),
        createContentNode('2. 提出解决方案\n'),
        createContentNode('   - 评估可行性\n'),
        createContentNode('   - 考虑潜在影响')
      ],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(thinkingElement, context);
    
    // 验证多行内容是否被正确组合
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.thinking.format).toBe('markdown');
    expect(result.metadata!.thinking.framework).toBe(
      '## 问题解决思路\n\n' +
      '1. 分析问题本质\n' +
      '   - 确定根本原因\n' +
      '   - 识别相关因素\n\n' +
      '2. 提出解决方案\n' +
      '   - 评估可行性\n' +
      '   - 考虑潜在影响'
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