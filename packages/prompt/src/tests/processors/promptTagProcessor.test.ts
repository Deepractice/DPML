import { NodeType, Document } from '@dpml/core';
import { PromptTagProcessor } from '@prompt/processors/promptTagProcessor';
import { describe, it, expect, vi } from 'vitest';

import type { Element, Content, ProcessingContext } from '@dpml/core';

describe('PromptTagProcessor', () => {
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

  // UT-PP-001: 测试canProcess方法和优先级设置
  it('UT-PP-001: 应该正确识别prompt标签并设置适当的优先级', () => {
    const processor = new PromptTagProcessor();

    // 创建一个 prompt 元素
    const promptElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'prompt',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    // 创建一个非 prompt 元素
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

    expect(processor.canProcess(promptElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    expect(processor.priority).toBeGreaterThan(0); // 确保优先级大于0
  });

  // UT-PP-002: 测试处理prompt基本属性和子标签收集
  it('UT-PP-002: 应该正确处理prompt属性和子标签收集', async () => {
    const processor = new PromptTagProcessor();
    const context = createMockContext();

    // 创建子标签元素
    const roleElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'role',
      attributes: {},
      children: [createContentNode('你是一个助手')],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const contextElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'context',
      attributes: {},
      children: [createContentNode('这是上下文信息')],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    // 创建一个带属性的 prompt 元素
    const promptElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'prompt',
      attributes: {
        id: 'test-prompt',
        version: '1.0',
        extends: 'base-prompt',
      },
      children: [roleElement, contextElement],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(promptElement, context);

    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.prompt.id).toBe('test-prompt');
    expect(result.metadata!.prompt.version).toBe('1.0');
    expect(result.metadata!.prompt.extends).toBe('base-prompt');

    // 验证子标签收集
    expect(result.metadata!.prompt.children).toBeDefined();
    expect(result.metadata!.prompt.children.length).toBe(2);
    expect(result.metadata!.prompt.children[0].tagName).toBe('role');
    expect(result.metadata!.prompt.children[1].tagName).toBe('context');

    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('PromptTagProcessor');
  });

  // UT-PP-003: 测试语言属性处理
  it('UT-PP-003: 应该正确处理语言属性并影响后续处理', async () => {
    const processor = new PromptTagProcessor();
    const context = createMockContext();

    // 创建一个带语言属性的 prompt 元素
    const promptElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'prompt',
      attributes: {
        lang: 'zh-CN',
      },
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const result = await processor.process(promptElement, context);

    // 验证语言属性是否正确处理
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.prompt.lang).toBe('zh-CN');

    // 验证语言设置是否添加到上下文变量中，以便影响后续处理
    expect(context.variables.lang).toBe('zh-CN');
  });
});
