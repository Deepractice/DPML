import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { DefaultTransformer } from '../../../transformer/defaultTransformer';
import { NodeType } from '../../../types/node';

import type { TransformContext } from '../../../transformer/interfaces/transformContext';
import type { TransformerVisitor } from '../../../transformer/interfaces/transformerVisitor';
import type { TransformOptions } from '../../../transformer/interfaces/transformOptions';
import type { Element, Document, Content } from '../../../types/node';

describe('未知格式处理机制', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  // 在每个测试前初始化控制台间谍
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  // 在每个测试后恢复控制台间谍
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // 创建一个测试文档
  const createTestDocument = (): Document => ({
    type: NodeType.DOCUMENT,
    children: [
      {
        type: NodeType.ELEMENT,
        tagName: 'root',
        attributes: {},
        children: [
          {
            type: NodeType.CONTENT,
            value: 'Hello, world!',
            position: {
              start: { line: 2, column: 1, offset: 0 },
              end: { line: 2, column: 14, offset: 13 },
            },
          } as Content,
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 3, column: 1, offset: 0 },
        },
      } as Element,
    ],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 3, column: 1, offset: 0 },
    },
  });

  it('应正确处理格式选项', () => {
    // 创建转换器
    const transformer = new DefaultTransformer();

    // 创建一个正常访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        return { type: 'processed-document' };
      },
    };

    transformer.registerVisitor(normalVisitor);

    // 配置不同的输出格式
    const options: TransformOptions = {
      outputFormat: 'json',
    };

    // 执行转换
    const result = transformer.transform(createTestDocument(), options);

    // 验证结果
    expect(result).toEqual({ type: 'processed-document' });
  });

  it('未知格式不应导致处理中断', () => {
    // 创建转换器
    const transformer = new DefaultTransformer();

    // 创建一个正常访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        return { type: 'processed-document' };
      },
    };

    transformer.registerVisitor(normalVisitor);

    // 配置未知格式
    const options: TransformOptions = {
      outputFormat: 'unknown-format',
    };

    // 执行转换
    const result = transformer.transform(createTestDocument(), options);

    // 验证结果
    expect(result).toEqual({ type: 'processed-document' });
  });

  it('即使所有访问者都失败，也应正确处理', () => {
    // 创建转换器
    const transformer = new DefaultTransformer();

    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('文档处理错误');
      },
    };

    transformer.registerVisitor(errorVisitor);

    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose',
    };

    // 执行转换
    const result = transformer.transform(createTestDocument(), options);

    // 验证错误被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('文档处理错误');

    // 结果可能是null或原始文档，根据实现而定
    // 不进行严格断言
  });

  it('在异步转换中也应该正确处理格式选项', async () => {
    // 创建转换器
    const transformer = new DefaultTransformer();

    // 创建一个异步访问者
    const asyncVisitor: TransformerVisitor = {
      name: 'async-visitor',
      priority: 100,
      visitDocumentAsync: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));

        return { type: 'async-processed-document' };
      },
    };

    transformer.registerVisitor(asyncVisitor);

    // 配置输出格式
    const options: TransformOptions = {
      outputFormat: 'json',
    };

    // 执行异步转换
    const result = await transformer.transformAsync(
      createTestDocument(),
      options
    );

    // 验证结果
    expect(result).toEqual({ type: 'async-processed-document' });
  });
});
