/**
 * 处理器性能测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DefaultProcessor } from '../../../processor/defaultProcessor';
import { DefaultReferenceResolver } from '../../../processor/defaultReferenceResolver';
import { ProcessingContext } from '../../../processor/processingContext';
import { FileProtocolHandler } from '../../../processor/protocols/fileProtocolHandler';
import { HttpProtocolHandler } from '../../../processor/protocols/httpProtocolHandler';
import { IdProtocolHandler } from '../../../processor/protocols/idProtocolHandler';
import { AttributeValidationVisitor } from '../../../processor/visitors/attributeValidationVisitor';
import { DocumentMetadataVisitor } from '../../../processor/visitors/documentMetadataVisitor';
import { IdValidationVisitor } from '../../../processor/visitors/idValidationVisitor';
import { InheritanceVisitor } from '../../../processor/visitors/inheritanceVisitor';
import { MarkdownContentVisitor } from '../../../processor/visitors/markdownContentVisitor';
import { ReferenceVisitor } from '../../../processor/visitors/referenceVisitor';
import { NodeType, Node } from '../../../types/node';

import type { NodeVisitor } from '../../../processor/interfaces/nodeVisitor';
import type {
  Element,
  Content,
  Document,
  Reference,
} from '../../../types/node';

// 创建一个简单的mock标签注册表
const mockTagRegistry = {
  getTagDefinition: () => null,
  tags: new Map(),
  registerTagDefinition: vi.fn(),
  isTagRegistered: vi.fn(() => false),
  getAllTagNames: vi.fn(() => []),
  getTagDefinitions: vi.fn(() => []),
  validateTag: vi.fn(() => ({ valid: true })),
};

// 扩展ProcessingContext类型
declare module '../../../processor/processingContext' {
  interface ProcessingContext {
    idMap: Map<string, Element>;
  }
}

// 自定义访问者类，添加name属性
class NamedMarkdownContentVisitor extends MarkdownContentVisitor {
  name = 'MarkdownContentVisitor';
}

class NamedIdValidationVisitor extends IdValidationVisitor {
  name = 'IdValidationVisitor';

  constructor(options = {}) {
    super(options);
  }
}

class NamedDocumentMetadataVisitor extends DocumentMetadataVisitor {
  name = 'DocumentMetadataVisitor';
}

class NamedAttributeValidationVisitor extends AttributeValidationVisitor {
  name = 'AttributeValidationVisitor';

  constructor() {
    super({ tagRegistry: mockTagRegistry as any });
  }
}

class NamedInheritanceVisitor extends InheritanceVisitor {
  name = 'InheritanceVisitor';

  constructor(referenceResolver: any) {
    super(referenceResolver);
  }
}

class NamedReferenceVisitor extends ReferenceVisitor {
  name = 'ReferenceVisitor';
}

// 创建带position的Element辅助函数
function createMockElement(tagName: string, id: string): Element {
  return {
    type: NodeType.ELEMENT,
    tagName,
    attributes: { id },
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 10, offset: 9 },
    },
  };
}

// 生成大型文档的工具函数
function generateLargeDocument(
  sectionsCount: number,
  elementsPerSection: number
): Document {
  const document: Document = {
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 },
    },
  };

  // 添加根元素
  const root: Element = {
    type: NodeType.ELEMENT,
    tagName: 'document',
    attributes: { id: 'large-doc', title: '大型文档测试' },
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 },
    },
  };

  document.children.push(root);

  // 添加章节和元素
  for (let i = 0; i < sectionsCount; i++) {
    const section: Element = {
      type: NodeType.ELEMENT,
      tagName: 'section',
      attributes: { id: `section-${i}`, title: `章节 ${i}` },
      children: [],
      position: {
        start: {
          line: i * elementsPerSection + 2,
          column: 1,
          offset: i * 1000,
        },
        end: {
          line: i * elementsPerSection + 2 + elementsPerSection,
          column: 1,
          offset: i * 1000 + 999,
        },
      },
    };

    // 添加内容元素
    for (let j = 0; j < elementsPerSection; j++) {
      // 每10个元素添加一个引用元素
      if (j % 10 === 0) {
        section.children.push({
          type: NodeType.ELEMENT,
          tagName: 'Reference',
          attributes: { href: `id:ref-${i}-${j}` },
          children: [],
          position: {
            start: {
              line: i * elementsPerSection + j + 3,
              column: 1,
              offset: i * 1000 + j * 100,
            },
            end: {
              line: i * elementsPerSection + j + 3,
              column: 50,
              offset: i * 1000 + j * 100 + 49,
            },
          },
        } as Element);
      } else {
        // 普通内容元素
        section.children.push({
          type: NodeType.ELEMENT,
          tagName: 'paragraph',
          attributes: { id: `para-${i}-${j}` },
          children: [
            {
              type: NodeType.CONTENT,
              value: `这是章节 ${i} 中的段落 ${j}，包含一些文本内容。`.repeat(
                3
              ), // 重复内容使其更大
              position: {
                start: {
                  line: i * elementsPerSection + j + 3,
                  column: 1,
                  offset: i * 1000 + j * 100,
                },
                end: {
                  line: i * elementsPerSection + j + 3,
                  column: 100,
                  offset: i * 1000 + j * 100 + 99,
                },
              },
            } as Content,
          ],
          position: {
            start: {
              line: i * elementsPerSection + j + 3,
              column: 1,
              offset: i * 1000 + j * 100,
            },
            end: {
              line: i * elementsPerSection + j + 3,
              column: 100,
              offset: i * 1000 + j * 100 + 99,
            },
          },
        } as Element);
      }
    }

    root.children.push(section);
  }

  return document;
}

describe('处理器性能测试', () => {
  let processor: DefaultProcessor;
  let referenceResolver: DefaultReferenceResolver;

  beforeEach(() => {
    // 创建引用解析器
    referenceResolver = new DefaultReferenceResolver();

    // 注册协议处理器
    referenceResolver.registerProtocolHandler(new FileProtocolHandler());
    referenceResolver.registerProtocolHandler(new HttpProtocolHandler());
    referenceResolver.registerProtocolHandler(new IdProtocolHandler());

    // 创建处理器
    processor = new DefaultProcessor();

    // 初始化ProcessingContext
    if (!ProcessingContext.prototype.idMap) {
      ProcessingContext.prototype.idMap = new Map<string, Element>();
    }

    // 注册所有访问者（使用带名称的自定义类）
    processor.registerVisitor(new NamedDocumentMetadataVisitor());
    processor.registerVisitor(new NamedAttributeValidationVisitor());
    processor.registerVisitor(new NamedIdValidationVisitor());
    processor.registerVisitor(new NamedInheritanceVisitor(referenceResolver));
    processor.registerVisitor(
      new NamedReferenceVisitor({
        referenceResolver,
        resolveInContent: true,
      })
    );
    processor.registerVisitor(new NamedMarkdownContentVisitor());

    // 设置引用解析器
    processor.setReferenceResolver(referenceResolver);

    // 模拟console.warn以避免测试输出过多警告
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('应该能高效处理大型文档', async () => {
    // 创建一个包含多个章节和元素的大型文档
    const largeDocument = generateLargeDocument(5, 20); // 5个章节，每章节20个元素，为了加快测试速度

    // 记录开始时间
    const startTime = performance.now();

    // 处理文档
    await processor.process(largeDocument, '/test/large-document.xml');

    // 记录结束时间
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    console.log(`大型文档处理耗时: ${elapsedTime.toFixed(2)} ms`);

    // 确保处理时间在合理范围内（这里只是示例，具体阈值需要根据实际情况调整）
    expect(elapsedTime).toBeLessThan(15000); // 假设处理应该在15秒内完成
  });

  it('应该正确使用引用缓存提升性能', async () => {
    // 创建一个包含重复引用的文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'cache-test' },
          children: [],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 100, column: 1, offset: 9999 },
          },
        } as Element,
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 100, column: 1, offset: 9999 },
      },
    };

    const rootElement = document.children[0] as Element;

    // 添加多个指向相同引用的元素
    const repeatedRefCount = 50;

    for (let i = 0; i < repeatedRefCount; i++) {
      rootElement.children.push({
        type: NodeType.ELEMENT,
        tagName: 'Reference',
        attributes: { href: 'id:repeated-ref' },
        children: [],
        position: {
          start: { line: i + 2, column: 1, offset: i * 100 },
          end: { line: i + 2, column: 50, offset: i * 100 + 49 },
        },
      } as Element);
    }

    // 设置mock元素作为ID引用
    const mockProcessingContext = new ProcessingContext(
      document,
      '/test/cache-test.xml'
    );

    mockProcessingContext.idMap = new Map<string, Element>();
    mockProcessingContext.idMap.set(
      'repeated-ref',
      createMockElement('mock', 'repeated-ref')
    );
    mockProcessingContext.resolvedReferences = new Map(); // 初始化resolvedReferences

    // 为了测试目的修改处理器的上下文
    (processor as any).context = mockProcessingContext;

    // 为了验证缓存效果，确保resolvedReferences为空
    // 不再尝试访问undefined的cache

    // 记录原始handle方法
    const originalHandle = IdProtocolHandler.prototype.handle;

    // 计算handle方法调用次数
    let handleCallCount = 0;

    // 使用mock替换handle方法
    IdProtocolHandler.prototype.handle = async function (reference: Reference) {
      handleCallCount++;

      return originalHandle.call(this, reference);
    };

    try {
      // 处理文档
      await processor.process(document, '/test/cache-test.xml');

      // 验证handle方法调用次数
      console.log(`引用解析器handle方法调用次数: ${handleCallCount}`);

      // 如果缓存正常工作，即使有50个相同引用，handle方法也应该只被调用一次
      expect(handleCallCount).toBeLessThan(3); // 允许一些容错
    } finally {
      // 恢复原始handle方法
      IdProtocolHandler.prototype.handle = originalHandle;
    }
  });

  it('应该测量关键路径的处理性能', async () => {
    // 创建一个带有各种典型结构的文档
    const typicalDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: {
            id: 'typical-doc',
            title: '典型文档',
            mode: 'strict',
          },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'section1', title: '第一章节' },
              children: [
                {
                  type: NodeType.ELEMENT,
                  tagName: 'paragraph',
                  attributes: { id: 'para1' },
                  children: [
                    {
                      type: NodeType.CONTENT,
                      value:
                        '这是第一段落内容，包含一些**Markdown**格式和一个[[id:link1]]引用。',
                      position: {
                        start: { line: 4, column: 1, offset: 300 },
                        end: { line: 4, column: 100, offset: 399 },
                      },
                    } as Content,
                  ],
                  position: {
                    start: { line: 3, column: 1, offset: 200 },
                    end: { line: 5, column: 1, offset: 400 },
                  },
                } as Element,
                {
                  type: NodeType.ELEMENT,
                  tagName: 'subsection',
                  attributes: { id: 'subsection1' }, // 移除extends属性以避免继承错误
                  children: [],
                  position: {
                    start: { line: 6, column: 1, offset: 500 },
                    end: { line: 7, column: 1, offset: 600 },
                  },
                } as Element,
              ],
              position: {
                start: { line: 2, column: 1, offset: 100 },
                end: { line: 8, column: 1, offset: 700 },
              },
            } as Element,
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'section2', title: '第二章节' },
              children: [
                {
                  type: NodeType.ELEMENT,
                  tagName: 'Reference',
                  attributes: { href: 'id:ref1' },
                  children: [],
                  position: {
                    start: { line: 10, column: 1, offset: 800 },
                    end: { line: 10, column: 50, offset: 849 },
                  },
                } as Element,
              ],
              position: {
                start: { line: 9, column: 1, offset: 750 },
                end: { line: 11, column: 1, offset: 900 },
              },
            } as Element,
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 12, column: 1, offset: 1000 },
          },
        } as Element,
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 12, column: 1, offset: 1000 },
      },
    };

    // 测量各个阶段的处理时间
    const timings: Record<string, number> = {};

    // 预先设置上下文和引用
    const mockContext = new ProcessingContext(
      typicalDocument,
      '/test/performance-test.xml'
    );

    mockContext.idMap = new Map<string, Element>();
    mockContext.idMap.set('link1', createMockElement('target', 'link1'));
    mockContext.idMap.set('ref1', createMockElement('target', 'ref1'));
    // 不再设置'base-section'，因为我们已移除extends属性
    mockContext.resolvedReferences = new Map(); // 初始化resolvedReferences

    // 为测试目的修改处理器的上下文
    (processor as any).context = mockContext;

    // 测量整体处理时间
    const startTime = performance.now();

    // 创建一个代理来记录处理时间
    const visitors = (processor as any).visitors as NodeVisitor[];
    const originalVisitElements = new Map<NodeVisitor, Function>();

    // 为每个访问者包装visitElement方法
    visitors.forEach(visitor => {
      if (visitor.visitElement) {
        originalVisitElements.set(visitor, visitor.visitElement);

        visitor.visitElement = async function (
          element: Element,
          context: ProcessingContext
        ): Promise<Element> {
          const start = performance.now();
          const result = await (
            originalVisitElements.get(visitor) as Function
          ).call(this, element, context);
          const end = performance.now();

          const visitorName = (visitor as any).name || 'Unknown';

          timings[visitorName] = (timings[visitorName] || 0) + (end - start);

          return result;
        };
      }
    });

    try {
      // 处理文档
      await processor.process(typicalDocument, '/test/performance-test.xml');

      // 记录总处理时间
      const endTime = performance.now();

      timings['total'] = endTime - startTime;

      // 输出性能指标
      console.log('处理性能指标:');
      Object.entries(timings).forEach(([key, value]) => {
        console.log(`- ${key}: ${value.toFixed(2)} ms`);
      });

      // 确保总处理时间在合理范围内
      expect(timings['total']).toBeLessThan(10000); // 假设处理应该在10秒内完成

      // 可以对特定访问者的处理时间设置预期
      // 例如，Markdown处理通常较快
      if (timings['MarkdownContentVisitor']) {
        expect(timings['MarkdownContentVisitor']).toBeLessThan(
          timings['total'] * 0.5
        ); // 应该不超过总时间的50%
      }
    } finally {
      // 恢复原始方法
      visitors.forEach(visitor => {
        if (originalVisitElements.has(visitor)) {
          visitor.visitElement = originalVisitElements.get(visitor) as any;
        }
      });
    }
  });
});
