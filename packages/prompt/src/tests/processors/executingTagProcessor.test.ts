import { NodeType } from '@dpml/core';
import { ExecutingTagProcessor } from '@prompt/processors/executingTagProcessor';
import { describe, it, expect, vi } from 'vitest';

import type { Element, Content, ProcessingContext } from '@dpml/core';

describe('ExecutingTagProcessor', () => {
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
        priority: 'high',
      },
      children: [
        createContentNode('1. 检查代码风格\n2. 审查逻辑错误\n3. 提供改进建议'),
      ],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(executingElement, context);

    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.executing.id).toBe('code-review');
    expect(result.metadata!.executing.method).toBe('sequential');
    expect(result.metadata!.executing.steps).toBe(
      '1. 检查代码风格\n2. 审查逻辑错误\n3. 提供改进建议'
    );

    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('ExecutingTagProcessor');
  });

  // UT-EP-002: 测试复杂执行步骤内容提取
  it('UT-EP-002: 应该正确处理复杂执行步骤内容', async () => {
    const processor = new ExecutingTagProcessor();
    const context = createMockContext();

    // 创建一个包含多行内容和Markdown格式的 executing 元素
    const executingElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'executing',
      attributes: {
        id: 'development-workflow',
        format: 'markdown',
      },
      children: [
        createContentNode('## 代码实现步骤\n\n'),
        createContentNode('1. 需求分析\n'),
        createContentNode('   - 理解用户需求\n'),
        createContentNode('   - 确定功能范围\n\n'),
        createContentNode('2. 设计架构\n'),
        createContentNode('   - 选择技术栈\n'),
        createContentNode('   - 规划组件结构\n\n'),
        createContentNode('3. 编写代码\n'),
        createContentNode('   - 遵循编码规范\n'),
        createContentNode('   - 实现核心功能'),
      ],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(executingElement, context);

    // 验证多行内容是否被正确组合
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.executing.format).toBe('markdown');
    expect(result.metadata!.executing.steps).toBe(
      '## 代码实现步骤\n\n' +
        '1. 需求分析\n' +
        '   - 理解用户需求\n' +
        '   - 确定功能范围\n\n' +
        '2. 设计架构\n' +
        '   - 选择技术栈\n' +
        '   - 规划组件结构\n\n' +
        '3. 编写代码\n' +
        '   - 遵循编码规范\n' +
        '   - 实现核心功能'
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
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    // 创建一个非 executing 元素
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

    expect(processor.canProcess(executingElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });
});
