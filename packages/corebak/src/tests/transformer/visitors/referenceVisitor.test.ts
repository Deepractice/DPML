import { describe, it, expect, beforeEach } from 'vitest';

import { ContextManager } from '../../../transformer/context/contextManager';
import { ReferenceVisitor } from '../../../transformer/visitors/referenceVisitor';
import { NodeType } from '../../../types/node';

import type { ProcessedDocument } from '../../../processor/interfaces/processor';
import type { TransformContext } from '../../../transformer/interfaces/transformContext';
import type { Reference } from '../../../types/node';

describe('ReferenceVisitor', () => {
  let visitor: ReferenceVisitor;
  let contextManager: ContextManager;

  // 创建测试上下文
  const createContext = (document: ProcessedDocument): TransformContext => {
    return contextManager.createRootContext(document, {
      visitors: [],
    });
  };

  beforeEach(() => {
    visitor = new ReferenceVisitor();
    contextManager = new ContextManager();
  });

  it('应该具有正确的名称和默认优先级', () => {
    expect(visitor.name).toBe('reference');
    expect(visitor.getPriority()).toBe(25); // 优先级应该在ElementVisitor(20)之后，ContentVisitor(30)之前
  });

  it('应该处理不同协议的引用', () => {
    // 测试不同协议引用的处理，如id、file、http等
    const testRefs = [
      {
        protocol: 'id',
        path: 'test-id',
        expected: {
          type: 'link',
          href: '#test-id',
          isInternal: true,
        },
      },
      {
        protocol: 'file',
        path: './path/to/document.dpml',
        expected: {
          type: 'link',
          href: './path/to/document.dpml',
          isExternal: true,
          isFile: true,
        },
      },
      {
        protocol: 'http',
        path: 'example.com/resource',
        expected: {
          type: 'link',
          href: 'http://example.com/resource',
          isExternal: true,
          isRemote: true,
        },
      },
      {
        protocol: 'https',
        path: 'secure.example.com/resource',
        expected: {
          type: 'link',
          href: 'https://secure.example.com/resource',
          isExternal: true,
          isRemote: true,
          isSecure: true,
        },
      },
    ];

    for (const testRef of testRefs) {
      // 创建一个已解析的引用
      const reference: Reference = {
        type: NodeType.REFERENCE,
        protocol: testRef.protocol,
        path: testRef.path,
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 10, offset: 9 },
        },
        resolved: { content: 'Test content' },
      };

      const document: ProcessedDocument = {
        type: NodeType.DOCUMENT,
        children: [reference],
        position: {
          start: { line: 0, column: 0, offset: 0 },
          end: { line: 2, column: 0, offset: 20 },
        },
      };

      const context = createContext(document);

      // 处理引用
      const result = visitor.visit(reference, context);

      // 验证处理结果
      expect(result).not.toBe(null);
      expect(result.type).toBe('link');
      expect(result.href).toBe(testRef.expected.href);

      // 验证特定协议的标志
      for (const [flag, value] of Object.entries(testRef.expected)) {
        if (flag !== 'type' && flag !== 'href') {
          expect(result[flag]).toBe(value);
        }
      }

      // 验证内容被正确传递
      expect(result.content).toBe('Test content');
    }
  });

  it('应该正确处理嵌套引用', () => {
    // 创建嵌套引用
    const nestedReference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'id',
      path: 'nested-ref',
      position: {
        start: { line: 2, column: 1, offset: 20 },
        end: { line: 2, column: 10, offset: 29 },
      },
      resolved: { content: 'Nested content' },
    };

    const mainReference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'id',
      path: 'main-ref',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 },
      },
      resolved: {
        content: 'Main content with reference',
        references: [nestedReference],
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [mainReference],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 3, column: 0, offset: 40 },
      },
    };

    const context = createContext(document);

    // 处理引用
    const result = visitor.visit(mainReference, context);

    // 验证处理结果
    expect(result).not.toBe(null);
    expect(result.type).toBe('link');
    expect(result.href).toBe('#main-ref');
    expect(result.content).toBe('Main content with reference');

    // 验证嵌套引用也被正确处理
    expect(result.references).toBeInstanceOf(Array);
    expect(result.references[0].type).toBe('link');
    expect(result.references[0].href).toBe('#nested-ref');
    expect(result.references[0].content).toBe('Nested content');
  });

  it('应该支持自定义格式化规则', () => {
    // 创建一个自定义格式化选项的访问者
    const customVisitor = new ReferenceVisitor(25, {
      formatRules: {
        // 自定义ID协议的格式化规则
        id: (reference: Reference, context: TransformContext) => ({
          type: 'customLink',
          target: `#section-${reference.path}`,
          data: reference.resolved,
        }),
        // 自定义HTTP协议的格式化规则
        http: (reference: Reference, context: TransformContext) => ({
          type: 'externalLink',
          url: `http://${reference.path}`,
          title: reference.resolved?.title || '外部链接',
          secure: false,
        }),
      },
    });

    // 测试ID协议
    const idReference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'id',
      path: 'custom-section',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 },
      },
      resolved: { content: 'Custom section content' },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [idReference],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 20 },
      },
    };

    const context = createContext(document);

    // 处理ID引用
    const idResult = customVisitor.visit(idReference, context);

    // 验证处理结果
    expect(idResult).not.toBe(null);
    expect(idResult.type).toBe('customLink');
    expect(idResult.target).toBe('#section-custom-section');
    expect(idResult.data).toStrictEqual(idReference.resolved);

    // 测试HTTP协议
    const httpReference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'http',
      path: 'example.com/page',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 },
      },
      resolved: { title: 'Example Page', content: 'Page content' },
    };

    // 处理HTTP引用
    const httpResult = customVisitor.visit(httpReference, context);

    // 验证处理结果
    expect(httpResult).not.toBe(null);
    expect(httpResult.type).toBe('externalLink');
    expect(httpResult.url).toBe('http://example.com/page');
    expect(httpResult.title).toBe('Example Page');
    expect(httpResult.secure).toBe(false);
  });

  it('应该处理未解析的引用', () => {
    // 创建一个未解析的引用
    const reference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'id',
      path: 'unresolved-ref',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 },
      },
      // 没有resolved属性
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [reference],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 20 },
      },
    };

    const context = createContext(document);

    // 处理引用
    const result = visitor.visit(reference, context);

    // 应该返回一个带有错误标记的链接
    expect(result).not.toBe(null);
    expect(result.type).toBe('link');
    expect(result.href).toBe('#unresolved-ref');
    expect(result.unresolved).toBe(true);
    expect(result.error).toBe('Reference not resolved');
  });

  it('应该支持异步处理引用', async () => {
    // 创建一个已解析的引用
    const reference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'http',
      path: 'example.com/async-resource',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 },
      },
      resolved: {
        title: 'Async Resource',
        content: 'Async content',
        asyncData: Promise.resolve({ additionalInfo: 'Loaded asynchronously' }),
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [reference],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 20 },
      },
    };

    const context = createContext(document);

    // 异步处理引用
    const result = await visitor.visitAsync(reference, context);

    // 验证处理结果
    expect(result).not.toBe(null);
    expect(result.type).toBe('link');
    expect(result.href).toBe('http://example.com/async-resource');
    expect(result.title).toBe('Async Resource');
    expect(result.content).toBe('Async content');
    expect(result.additionalInfo).toBe('Loaded asynchronously');
  });
});
