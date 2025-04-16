import { NodeType } from '@dpml/core';
import { TestingTagProcessor } from '@prompt/processors/testingTagProcessor';
import { describe, it, expect, vi } from 'vitest';

import type { Element, Content, ProcessingContext } from '@dpml/core';

describe('TestingTagProcessor', () => {
  // 创建一个模拟的 ProcessingContext
  const createMockContext = (): ProcessingContext => {
    return {
      document: {
        type: NodeType.DOCUMENT,
        children: [],
        position: {
          start: { line: 0, column: 0, offset: 0 },
          end: { line: 0, column: 0, offset: 0 },
        },
      },
      currentPath: '/test/path',
      filePath: '/test/path',
      resolvedReferences: new Map(),
      parentElements: [],
      variables: {},
      idMap: new Map(),
    } as ProcessingContext;
  };

  // 创建一个内容节点
  const createContentNode = (text: string): Content => {
    return {
      type: NodeType.CONTENT,
      value: text,
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: text.length, offset: text.length },
      },
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
        scope: 'functionality',
      },
      children: [
        createContentNode(
          '- 输入验证完整性检查\n- 边界条件测试\n- 异常处理测试'
        ),
      ],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(testingElement, context);

    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.testing.id).toBe('code-quality');
    expect(result.metadata!.testing.testingType).toBe('checklist');
    expect(result.metadata!.testing.criteria).toBe(
      '- 输入验证完整性检查\n- 边界条件测试\n- 异常处理测试'
    );

    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('TestingTagProcessor');
  });

  // UT-TTP-002: 测试复杂质量检查内容提取
  it('UT-TTP-002: 应该正确处理复杂质量检查内容', async () => {
    const processor = new TestingTagProcessor();
    const context = createMockContext();

    // 创建一个包含多行内容和格式标记的 testing 元素
    const testingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'testing',
      attributes: {
        id: 'comprehensive-review',
        format: 'markdown',
        level: 'detailed',
      },
      children: [
        createContentNode('## 代码质量检查清单\n\n'),
        createContentNode('### 功能性检查\n'),
        createContentNode('- 所有功能是否按要求实现\n'),
        createContentNode('- 边界条件是否被正确处理\n\n'),
        createContentNode('### 可维护性检查\n'),
        createContentNode('- 代码结构是否清晰\n'),
        createContentNode('- 是否有适当的注释和文档\n'),
        createContentNode('- 命名规范是否一致'),
      ],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(testingElement, context);

    // 验证多行内容是否被正确组合
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.testing.format).toBe('markdown');
    expect(result.metadata!.testing.level).toBe('detailed');
    expect(result.metadata!.testing.criteria).toBe(
      '## 代码质量检查清单\n\n' +
        '### 功能性检查\n' +
        '- 所有功能是否按要求实现\n' +
        '- 边界条件是否被正确处理\n\n' +
        '### 可维护性检查\n' +
        '- 代码结构是否清晰\n' +
        '- 是否有适当的注释和文档\n' +
        '- 命名规范是否一致'
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
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    // 创建一个非 testing 元素
    const otherElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'other',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    expect(processor.canProcess(testingElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });
});
