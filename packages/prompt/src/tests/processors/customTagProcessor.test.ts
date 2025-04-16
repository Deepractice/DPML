import { NodeType } from '@dpml/core';
import { describe, it, expect, vi } from 'vitest';

import { CustomTagProcessor } from '../../processors/customTagProcessor';

import type { Element, Content, ProcessingContext } from '@dpml/core';


describe('CustomTagProcessor', () => {
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

  // UT-CTP-001: 测试自定义内容属性提取
  it('UT-CTP-001: 应该正确提取自定义内容的属性', async () => {
    const processor = new CustomTagProcessor();
    const context = createMockContext();

    // 创建一个带属性的 custom 元素
    const customElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'custom',
      attributes: {
        id: 'user-notes',
        section: 'preferences',
      },
      children: [createContentNode('用户特定的个性化配置和说明。')],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(customElement, context);

    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.custom.id).toBe('user-notes');
    expect(result.metadata!.custom.section).toBe('preferences');
    expect(result.metadata!.custom.description).toBe(
      '用户特定的个性化配置和说明。'
    );

    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('CustomTagProcessor');
  });

  // UT-CTP-002: 测试复杂自定义内容提取
  it('UT-CTP-002: 应该遵循最小干预原则，保留复杂原始内容', async () => {
    const processor = new CustomTagProcessor();
    const context = createMockContext();

    // 创建包含复杂内容的自定义元素
    const complexContent = `
# 特殊指令集

\`\`\`json
{
  "priority": "high",
  "format": "step-by-step",
  "style": "concise"
}
\`\`\`

> 注意：这些是用户特殊需求，处理时须严格遵守

1. 所有回答须简明扼要
2. 代码示例不超过10行
3. 避免使用过于技术性的术语
    `;

    const customElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'custom',
      attributes: { id: 'special-instructions' },
      children: [createContentNode(complexContent)],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(customElement, context);

    // 验证复杂内容是否被完整保留
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.custom.description).toBe(complexContent);

    // 确保不进行内容解析或修改
    expect(result.metadata!.custom.content).not.toBeDefined();
  });

  // 测试canProcess方法和优先级
  it('应该正确识别custom标签并设置适当的优先级', () => {
    const processor = new CustomTagProcessor();

    // 创建一个 custom 元素
    const customElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'custom',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    // 创建一个非 custom 元素
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

    expect(processor.canProcess(customElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });
});
