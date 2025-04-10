import { Element, NodeType, Content } from '@dpml/core';
import { ProcessingContext } from '@dpml/core';
import { describe, it, expect, vi } from 'vitest';
import { TestingTagProcessor } from '@prompt/processors/testingTagProcessor';

describe('TestingTagProcessor', () => {
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

  // UT-TTP-001: 测试质量检查属性和内容提取
  it('UT-TTP-001: 应该正确提取质量检查属性和内容', async () => {
    const processor = new TestingTagProcessor();
    const context = createMockContext();
    
    // 创建一个带属性的 testing 元素
    const testingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'testing',
      attributes: {
        id: 'code-quality',
        type: 'checklist',
        scope: 'functionality'
      },
      children: [createContentNode('- 输入验证完整性检查\n- 边界条件测试\n- 异常处理测试')],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(testingElement, context);
    
    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.semantic.type).toBe('testing');
    expect(result.metadata!.semantic.id).toBe('code-quality');
    expect(result.metadata!.semantic.testingType).toBe('checklist');
    expect(result.metadata!.semantic.scope).toBe('functionality');
    expect(result.metadata!.semantic.criteria).toBe('- 输入验证完整性检查\n- 边界条件测试\n- 异常处理测试');
    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('TestingTagProcessor');
  });

  // UT-TTP-002: 测试复杂质量检查内容提取（包含多个内容节点和格式）
  it('UT-TTP-002: 应该正确处理复杂质量检查内容', async () => {
    const processor = new TestingTagProcessor();
    const context = createMockContext();
    
    // 创建一个包含复杂质量检查的 testing 元素
    const testingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'testing',
      attributes: {
        format: 'markdown',
        level: 'detailed'
      },
      children: [
        createContentNode('## 质量自检清单\n\n'),
        createContentNode('### 1. 功能测试\n'),
        createContentNode('- 所有核心功能正常工作\n'),
        createContentNode('- 输入验证机制完整\n\n'),
        createContentNode('### 2. 性能测试\n'),
        createContentNode('- 处理大量数据不卡顿\n'),
        createContentNode('- 响应时间在可接受范围内\n')
      ],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    const result = await processor.process(testingElement, context);
    
    // 验证多行内容是否被正确组合
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.semantic.format).toBe('markdown');
    expect(result.metadata!.semantic.level).toBe('detailed');
    expect(result.metadata!.semantic.criteria).toBe(
      '## 质量自检清单\n\n' +
      '### 1. 功能测试\n' +
      '- 所有核心功能正常工作\n' +
      '- 输入验证机制完整\n\n' +
      '### 2. 性能测试\n' +
      '- 处理大量数据不卡顿\n' +
      '- 响应时间在可接受范围内\n'
    );
  });

  // 测试canProcess方法和优先级
  it('应该正确识别testing标签并设置适当的优先级', () => {
    const processor = new TestingTagProcessor();
    
    // 创建一个 testing 元素
    const testingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'testing',
      attributes: {},
      children: [],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
    
    // 创建一个非 testing 元素
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
    
    expect(processor.canProcess(testingElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });
}); 