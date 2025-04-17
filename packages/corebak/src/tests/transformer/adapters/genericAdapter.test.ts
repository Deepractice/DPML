import { describe, it, expect } from 'vitest';

import { GenericAdapter } from '../../../transformer/adapters/genericAdapter';
import { ContextManager } from '../../../transformer/context/contextManager';
import { NodeType } from '../../../types/node';

import type { ProcessedDocument } from '../../../processor/interfaces/processor';
import type { TransformContext } from '../../../transformer/interfaces/transformContext';

describe('GenericAdapter', () => {
  // 创建一个简单的文档结果用于测试
  const createSimpleResult = () => {
    return {
      type: 'document',
      meta: {
        title: '测试文档',
        author: '测试作者',
      },
      children: [
        {
          type: 'element',
          name: 'section',
          attributes: {
            id: 'section1',
            class: 'main',
          },
          children: [
            {
              type: 'element',
              name: 'heading',
              level: 1,
              children: [
                {
                  type: 'content',
                  text: '标题内容',
                },
              ],
            },
            {
              type: 'element',
              name: 'paragraph',
              children: [
                {
                  type: 'content',
                  text: '这是一段测试内容。',
                },
              ],
            },
          ],
        },
      ],
    };
  };

  // 创建上下文
  const createContext = (): TransformContext => {
    // 创建一个最小化的文档
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 },
      },
    };

    // 创建上下文管理器
    const contextManager = new ContextManager();

    // 返回根上下文
    return contextManager.createRootContext(document, {});
  };

  it('应该保持对象结构不变', () => {
    // 准备
    const adapter = new GenericAdapter();
    const result = createSimpleResult();
    const context = createContext();

    // 执行
    const adapted = adapter.adapt(result, context);

    // 验证
    expect(adapted).toEqual(result);
  });

  it('应该处理空结果', () => {
    // 准备
    const adapter = new GenericAdapter();
    const context = createContext();

    // 执行 - 传递null
    const adapted1 = adapter.adapt(null, context);

    // 验证
    expect(adapted1).toBeNull();

    // 执行 - 传递undefined
    const adapted2 = adapter.adapt(undefined, context);

    // 验证
    expect(adapted2).toBeUndefined();
  });

  it('应该处理原始值', () => {
    // 准备
    const adapter = new GenericAdapter();
    const context = createContext();

    // 执行 - 传递字符串
    const adapted1 = adapter.adapt('测试字符串', context);

    // 验证
    expect(adapted1).toBe('测试字符串');

    // 执行 - 传递数字
    const adapted2 = adapter.adapt(123, context);

    // 验证
    expect(adapted2).toBe(123);

    // 执行 - 传递布尔值
    const adapted3 = adapter.adapt(true, context);

    // 验证
    expect(adapted3).toBe(true);
  });

  it('应该处理数组', () => {
    // 准备
    const adapter = new GenericAdapter();
    const context = createContext();
    const arrayResult = [1, '测试', { key: 'value' }];

    // 执行
    const adapted = adapter.adapt(arrayResult, context);

    // 验证
    expect(adapted).toEqual(arrayResult);
  });
});
