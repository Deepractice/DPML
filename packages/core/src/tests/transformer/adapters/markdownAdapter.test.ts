import { describe, it, expect } from 'vitest';

import { MarkdownAdapter } from '../../../transformer/adapters/markdownAdapter';
import { ContextManager } from '../../../transformer/context/contextManager';
import { NodeType } from '../../../types/node';

import type { ProcessedDocument } from '../../../processor/interfaces/processor';
import type { TransformContext } from '../../../transformer/interfaces/transformContext';

describe('MarkdownAdapter', () => {
  // 创建一个简单的文档结果用于测试
  const createSimpleResult = () => {
    return {
      type: 'document',
      meta: {
        title: '测试文档',
        author: '测试作者',
        date: '2023-05-15',
      },
      children: [
        {
          type: 'element',
          name: 'heading',
          level: 1,
          children: [
            {
              type: 'content',
              text: '主标题',
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
        {
          type: 'element',
          name: 'heading',
          level: 2,
          children: [
            {
              type: 'content',
              text: '二级标题',
            },
          ],
        },
        {
          type: 'element',
          name: 'paragraph',
          children: [
            {
              type: 'content',
              text: '这是二级标题下的段落。',
            },
          ],
        },
        {
          type: 'element',
          name: 'list',
          ordered: false,
          children: [
            {
              type: 'element',
              name: 'listItem',
              children: [
                {
                  type: 'content',
                  text: '无序列表项1',
                },
              ],
            },
            {
              type: 'element',
              name: 'listItem',
              children: [
                {
                  type: 'content',
                  text: '无序列表项2',
                },
              ],
            },
          ],
        },
        {
          type: 'element',
          name: 'list',
          ordered: true,
          children: [
            {
              type: 'element',
              name: 'listItem',
              children: [
                {
                  type: 'content',
                  text: '有序列表项1',
                },
              ],
            },
            {
              type: 'element',
              name: 'listItem',
              children: [
                {
                  type: 'content',
                  text: '有序列表项2',
                },
              ],
            },
          ],
        },
        {
          type: 'element',
          name: 'codeBlock',
          language: 'typescript',
          children: [
            {
              type: 'content',
              text: 'function test() {\n  console.log("Hello");\n}',
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

  it('应该将对象转换为Markdown字符串', () => {
    // 准备
    const adapter = new MarkdownAdapter();
    const result = createSimpleResult();
    const context = createContext();

    // 执行
    const adapted = adapter.adapt(result, context);

    // 验证
    expect(typeof adapted).toBe('string');

    // 验证标题格式
    expect(adapted).toContain('# 主标题');
    expect(adapted).toContain('## 二级标题');

    // 验证段落格式
    expect(adapted).toContain('这是一段测试内容。');
    expect(adapted).toContain('这是二级标题下的段落。');

    // 验证列表格式
    expect(adapted).toMatch(/\n- 无序列表项1\n/);
    expect(adapted).toMatch(/\n- 无序列表项2\n/);
    expect(adapted).toMatch(/\n1\. 有序列表项1\n/);
    expect(adapted).toMatch(/\n2\. 有序列表项2\n/);

    // 验证代码块格式
    expect(adapted).toContain('```typescript');
    expect(adapted).toContain('function test() {');
    expect(adapted).toContain('  console.log("Hello");');
    expect(adapted).toContain('}');
    expect(adapted).toContain('```');

    // 验证元数据（可选前言）
    expect(adapted).toContain('---');
    expect(adapted).toContain('title: 测试文档');
    expect(adapted).toContain('author: 测试作者');
    expect(adapted).toContain('date: 2023-05-15');
    expect(adapted).toContain('---');
  });

  it('应该处理没有元数据的文档', () => {
    // 准备
    const adapter = new MarkdownAdapter();
    const result = {
      type: 'document',
      children: [
        {
          type: 'element',
          name: 'paragraph',
          children: [
            {
              type: 'content',
              text: '没有元数据的文档',
            },
          ],
        },
      ],
    };
    const context = createContext();

    // 执行
    const adapted = adapter.adapt(result, context);

    // 验证 - 不应包含前言
    expect(adapted as string).not.toContain('---\n');
    expect(adapted as string).toBe('没有元数据的文档\n\n');
  });

  it('应该处理空结果', () => {
    // 准备
    const adapter = new MarkdownAdapter();
    const context = createContext();

    // 执行 - 传递null
    const adapted1 = adapter.adapt(null, context);

    // 验证
    expect(adapted1).toBe('');

    // 执行 - 传递undefined
    const adapted2 = adapter.adapt(undefined, context);

    // 验证
    expect(adapted2).toBe('');
  });

  it('应该处理内联格式元素', () => {
    // 准备
    const adapter = new MarkdownAdapter();
    const result = {
      type: 'document',
      children: [
        {
          type: 'element',
          name: 'paragraph',
          children: [
            {
              type: 'content',
              text: '普通文本',
            },
            {
              type: 'element',
              name: 'strong',
              children: [
                {
                  type: 'content',
                  text: '粗体文本',
                },
              ],
            },
            {
              type: 'content',
              text: '和',
            },
            {
              type: 'element',
              name: 'emphasis',
              children: [
                {
                  type: 'content',
                  text: '斜体文本',
                },
              ],
            },
            {
              type: 'content',
              text: '以及',
            },
            {
              type: 'element',
              name: 'inlineCode',
              children: [
                {
                  type: 'content',
                  text: '代码',
                },
              ],
            },
          ],
        },
      ],
    };
    const context = createContext();

    // 执行
    const adapted = adapter.adapt(result, context);

    // 验证
    expect(adapted).toContain('普通文本**粗体文本**和*斜体文本*以及`代码`');
  });

  it('应该支持表格转换', () => {
    // 准备
    const adapter = new MarkdownAdapter();
    const result = {
      type: 'document',
      children: [
        {
          type: 'element',
          name: 'table',
          children: [
            {
              type: 'element',
              name: 'tableHead',
              children: [
                {
                  type: 'element',
                  name: 'tableRow',
                  children: [
                    {
                      type: 'element',
                      name: 'tableCell',
                      children: [
                        {
                          type: 'content',
                          text: '标题1',
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'tableCell',
                      children: [
                        {
                          type: 'content',
                          text: '标题2',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'element',
              name: 'tableBody',
              children: [
                {
                  type: 'element',
                  name: 'tableRow',
                  children: [
                    {
                      type: 'element',
                      name: 'tableCell',
                      children: [
                        {
                          type: 'content',
                          text: '数据1',
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'tableCell',
                      children: [
                        {
                          type: 'content',
                          text: '数据2',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const context = createContext();

    // 执行
    const adapted = adapter.adapt(result, context);

    // 验证表格格式
    expect(adapted).toContain('| 标题1 | 标题2 |');
    expect(adapted).toContain('| --- | --- |');
    expect(adapted).toContain('| 数据1 | 数据2 |');
  });

  it('应该可以配置是否添加元数据前言', () => {
    // 准备
    const adapter = new MarkdownAdapter({
      includeFrontmatter: false,
    });
    const result = createSimpleResult();
    const context = createContext();

    // 执行
    const adapted = adapter.adapt(result, context);

    // 验证 - 不应包含前言
    expect(adapted as string).not.toContain('---\n');
    expect(adapted as string).not.toContain('title: 测试文档');

    // 应该保留正文内容
    expect(adapted as string).toContain('# 主标题');
  });
});
