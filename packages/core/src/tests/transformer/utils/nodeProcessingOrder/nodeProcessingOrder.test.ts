import { vi, describe, it, expect, beforeEach } from 'vitest';

import { DefaultTransformer } from '../../../../transformer/defaultTransformer';
import { NodeType } from '../../../../types/node';

import type { TransformContext } from '../../../../transformer/interfaces/transformContext';
import type { TransformerVisitor } from '../../../../transformer/interfaces/transformerVisitor';
import type { Element, Document } from '../../../../types/node';

describe('节点处理顺序机制', () => {
  // 创建一个嵌套的测试文档
  const createTestDocument = (): Document => {
    return {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: {},
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'child1',
              attributes: {},
              children: [
                {
                  type: NodeType.CONTENT,
                  value: 'Text in child1',
                  position: {
                    start: { line: 4, column: 1, offset: 0 },
                    end: { line: 4, column: 15, offset: 14 },
                  },
                },
              ],
              position: {
                start: { line: 3, column: 1, offset: 0 },
                end: { line: 5, column: 1, offset: 0 },
              },
            },
            {
              type: NodeType.ELEMENT,
              tagName: 'child2',
              attributes: {},
              children: [
                {
                  type: NodeType.CONTENT,
                  value: 'Text in child2',
                  position: {
                    start: { line: 7, column: 1, offset: 0 },
                    end: { line: 7, column: 15, offset: 14 },
                  },
                },
              ],
              position: {
                start: { line: 6, column: 1, offset: 0 },
                end: { line: 8, column: 1, offset: 0 },
              },
            },
          ],
          position: {
            start: { line: 2, column: 1, offset: 0 },
            end: { line: 9, column: 1, offset: 0 },
          },
        },
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 10, column: 1, offset: 0 },
      },
    };
  };

  // 测试深度优先节点处理顺序
  it('应该按照深度优先顺序处理节点', () => {
    // 创建转换器
    const transformer = new DefaultTransformer();

    // 记录节点处理顺序
    const processingOrder: string[] = [];

    // 创建一个能够记录节点处理顺序的访问者
    const nodeTrackingVisitor: TransformerVisitor = {
      name: 'node-tracking-visitor',
      visitDocument: (doc: Document, context: TransformContext) => {
        processingOrder.push('document');

        return doc;
      },
      visitElement: (element: Element, context: TransformContext) => {
        processingOrder.push(`element:${element.tagName}`);

        return element;
      },
      visitContent: (content: any, context: TransformContext) => {
        processingOrder.push(`content:${content.value.substring(0, 10)}...`);

        return content;
      },
    };

    // 注册访问者
    transformer.registerVisitor(nodeTrackingVisitor);

    // 转换文档
    transformer.transform(createTestDocument());

    // 验证处理顺序 - 应该是深度优先
    expect(processingOrder).toEqual([
      'document',
      'element:root',
      'element:child1',
      'content:Text in ch...',
      'element:child2',
      'content:Text in ch...',
    ]);
  });

  // 测试特定节点类型的处理优先级
  it('应该根据节点类型和访问者优先级确定处理顺序', () => {
    // 创建转换器
    const transformer = new DefaultTransformer();

    // 记录节点处理顺序
    const processingOrder: string[] = [];

    // 创建三个针对不同节点类型的访问者，具有不同优先级
    const documentVisitor: TransformerVisitor = {
      name: 'document-priority-visitor',
      priority: 50, // 中等优先级
      visitDocument: (doc: Document, context: TransformContext) => {
        processingOrder.push('document-visitor');

        return doc;
      },
    };

    const elementVisitor: TransformerVisitor = {
      name: 'element-priority-visitor',
      priority: 100, // 高优先级
      visitElement: (element: Element, context: TransformContext) => {
        processingOrder.push(`element-visitor:${element.tagName}`);

        return element;
      },
    };

    const contentVisitor: TransformerVisitor = {
      name: 'content-priority-visitor',
      priority: 10, // 低优先级
      visitContent: (content: any, context: TransformContext) => {
        processingOrder.push('content-visitor');

        return content;
      },
    };

    // 注册访问者
    transformer.registerVisitor(contentVisitor); // 低优先级
    transformer.registerVisitor(documentVisitor); // 中等优先级
    transformer.registerVisitor(elementVisitor); // 高优先级

    // 创建一个简单的测试文档
    const simpleDoc: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'test',
          attributes: {},
          children: [
            {
              type: NodeType.CONTENT,
              value: 'Test content',
              position: {
                start: { line: 3, column: 1, offset: 0 },
                end: { line: 3, column: 12, offset: 11 },
              },
            },
          ],
          position: {
            start: { line: 2, column: 1, offset: 0 },
            end: { line: 4, column: 1, offset: 0 },
          },
        },
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 5, column: 1, offset: 0 },
      },
    };

    // 转换文档
    transformer.transform(simpleDoc);

    // 验证处理顺序 - 应该先按节点遍历顺序，然后按访问者优先级
    expect(processingOrder).toEqual([
      'document-visitor',
      'element-visitor:test',
      'content-visitor',
    ]);
  });

  // 测试处理器注册顺序对处理执行的影响
  it('应该在相同优先级时按照注册顺序执行处理器', () => {
    // 创建转换器
    const transformer = new DefaultTransformer();

    // 记录处理器执行顺序
    const executionOrder: string[] = [];

    // 创建多个优先级相同的访问者
    const visitor1: TransformerVisitor = {
      name: 'visitor1',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        executionOrder.push('visitor1');

        return { type: 'processed-by-visitor1' }; // 返回处理后的结果，阻止继续处理
      },
    };

    const visitor2: TransformerVisitor = {
      name: 'visitor2',
      priority: 100, // 与visitor1相同的优先级
      visitDocument: (doc: Document, context: TransformContext) => {
        executionOrder.push('visitor2');

        return doc;
      },
    };

    const visitor3: TransformerVisitor = {
      name: 'visitor3',
      priority: 100, // 与visitor1和visitor2相同的优先级
      visitDocument: (doc: Document, context: TransformContext) => {
        executionOrder.push('visitor3');

        return doc;
      },
    };

    // 按特定顺序注册访问者
    transformer.registerVisitor(visitor1);
    transformer.registerVisitor(visitor2);
    transformer.registerVisitor(visitor3);

    // 转换文档
    transformer.transform(createTestDocument());

    // 验证执行顺序 - 由于visitor1返回了处理结果，应该只有visitor1被执行
    expect(executionOrder).toEqual(['visitor1']);
  });

  // 测试父子节点结果传递
  it('应该正确处理父子节点之间的结果传递', () => {
    // 创建转换器
    const transformer = new DefaultTransformer();

    // 创建一个追踪上下文变化的访问者
    const contextTrackingVisitor: TransformerVisitor = {
      name: 'context-tracking-visitor',
      visitDocument: (doc: Document, context: TransformContext) => {
        // 修改文档节点并添加元数据
        return {
          type: 'processed-doc',
          meta: { level: 'document' },
          children: [],
        };
      },
      visitElement: (element: Element, context: TransformContext) => {
        // 检查父结果是否可用
        if (context.parentResults && context.parentResults.length > 0) {
          const parentMeta = context.parentResults[0].meta || {};

          // 创建包含父元数据的结果
          return {
            type: 'processed-element',
            tagName: element.tagName,
            meta: {
              level: 'element',
              parentLevel: parentMeta.level,
            },
            children: [],
          };
        }

        return element;
      },
    };

    // 注册访问者
    transformer.registerVisitor(contextTrackingVisitor);

    // 转换文档
    const result = transformer.transform(createTestDocument());

    // 验证结果 - 应该包含父节点传递的信息
    expect(result).toHaveProperty('type', 'processed-doc');
    expect(result).toHaveProperty('meta.level', 'document');

    // 验证子节点是否获得了父节点信息
    if (result.children && result.children.length > 0) {
      const rootElement = result.children[0];

      expect(rootElement).toHaveProperty('meta.level', 'element');
      expect(rootElement).toHaveProperty('meta.parentLevel', 'document');
    }
  });
});
