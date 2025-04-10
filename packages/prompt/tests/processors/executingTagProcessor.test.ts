import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext } from '@dpml/core';
import { describe, it, expect, vi } from 'vitest';
import { ExecutingTagProcessor } from '@prompt/processors/executingTagProcessor';

describe('ExecutingTagProcessor', () => {
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

  // UT-EP-001: 测试执行步骤属性和内容提取
  it('UT-EP-001: 应该正确提取执行步骤属性和内容', async () => {
    const processor = new ExecutingTagProcessor();
    const context = createMockContext();
    
    // 创建一个带属性的 executing 元素
    const executingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'executing',
      attributes: {
        id: 'code-review',
        method: 'sequential',
        priority: 'high'
      },
      children: [createContentNode('1. 检查代码风格\n2. 审查算法效率\n3. 验证边界条件处理')],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(executingElement, context);
    
    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.semantic.type).toBe('executing');
    expect(result.metadata!.semantic.id).toBe('code-review');
    expect(result.metadata!.semantic.method).toBe('sequential');
    expect(result.metadata!.semantic.priority).toBe('high');
    expect(result.metadata!.semantic.steps).toBe('1. 检查代码风格\n2. 审查算法效率\n3. 验证边界条件处理');
    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('ExecutingTagProcessor');
  });

  // UT-EP-002: 测试复杂执行步骤内容提取（包含多个内容节点和格式）
  it('UT-EP-002: 应该正确处理复杂执行步骤内容', async () => {
    const processor = new ExecutingTagProcessor();
    const context = createMockContext();
    
    // 创建一个包含复杂执行步骤的 executing 元素
    const executingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'executing',
      attributes: {
        format: 'markdown'
      },
      children: [
        createContentNode('## 代码实现步骤\n\n'),
        createContentNode('### 第一步：初始化环境\n'),
        createContentNode('```typescript\nconst config = { debug: true };\n```\n\n'),
        createContentNode('### 第二步：实现核心逻辑\n'),
        createContentNode('1. 创建数据模型\n'),
        createContentNode('2. 实现业务规则\n')
      ],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(executingElement, context);
    
    // 验证多行内容是否被正确组合
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.semantic.format).toBe('markdown');
    expect(result.metadata!.semantic.steps).toBe(
      '## 代码实现步骤\n\n' +
      '### 第一步：初始化环境\n' +
      '```typescript\nconst config = { debug: true };\n```\n\n' +
      '### 第二步：实现核心逻辑\n' +
      '1. 创建数据模型\n' +
      '2. 实现业务规则\n'
    );
  });

  // 测试canProcess方法和优先级
  it('应该正确识别executing标签并设置适当的优先级', () => {
    const processor = new ExecutingTagProcessor();
    
    // 创建一个 executing 元素
    const executingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'executing',
      attributes: {},
      children: [],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    // 创建一个非 executing 元素
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
    
    expect(processor.canProcess(executingElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });
}); 