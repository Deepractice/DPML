import { NodeType } from '@dpml/core';
import { describe, it, expect, vi } from 'vitest';

import type { Element, Content, ProcessingContext } from '@dpml/core';

import { ProtocolTagProcessor } from '../../processors/protocolTagProcessor';

describe('ProtocolTagProcessor', () => {
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

  // UT-PRP-001: 测试交互协议属性和内容提取
  it('UT-PRP-001: 应该正确提取交互协议属性和内容', async () => {
    const processor = new ProtocolTagProcessor();
    const context = createMockContext();

    // 创建一个带属性的 protocol 元素
    const protocolElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'protocol',
      attributes: {
        id: 'data-exchange',
        format: 'json',
      },
      children: [
        createContentNode(
          '输入应为JSON格式，包含query字段。输出也应为JSON格式，包含result字段。'
        ),
      ],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(protocolElement, context);

    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.protocol.id).toBe('data-exchange');
    expect(result.metadata!.protocol.format).toBe('json');

    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('ProtocolTagProcessor');
  });

  // UT-PRP-002: 测试复杂交互协议内容提取
  it('UT-PRP-002: 应该正确处理复杂交互协议', async () => {
    const processor = new ProtocolTagProcessor();
    const context = createMockContext();

    // 创建一个包含复杂规则的 protocol 元素
    const protocolElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'protocol',
      attributes: { id: 'analysis-report' },
      children: [
        createContentNode('在数据分析报告中，请遵循以下协议：\n'),
        createContentNode('- 提供客观的数据分析，避免主观判断\n'),
        createContentNode('- 对异常数据点进行专门标注和解释\n'),
        createContentNode(
          '- 每份分析报告包含：执行摘要、方法论简述、关键发现、建议\n'
        ),
        createContentNode('- 统计结果使用Markdown表格格式展示'),
      ],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(protocolElement, context);

    // 验证复杂内容是否被正确提取和组合
    const expectedContent =
      '在数据分析报告中，请遵循以下协议：\n' +
      '- 提供客观的数据分析，避免主观判断\n' +
      '- 对异常数据点进行专门标注和解释\n' +
      '- 每份分析报告包含：执行摘要、方法论简述、关键发现、建议\n' +
      '- 统计结果使用Markdown表格格式展示';

    expect(result.metadata!.protocol.description).toBe(expectedContent);
  });

  // 测试canProcess方法和优先级
  it('应该正确识别protocol标签并设置适当的优先级', () => {
    const processor = new ProtocolTagProcessor();

    // 创建一个 protocol 元素
    const protocolElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'protocol',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    // 创建一个非 protocol 元素
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

    expect(processor.canProcess(protocolElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });
});
