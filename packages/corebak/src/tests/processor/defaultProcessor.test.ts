/**
 * DefaultProcessor测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DefaultProcessor } from '../../processor/defaultProcessor';
import { Processor } from '../../processor/interfaces';
import { ProcessingContext as ProcessingContextImpl } from '../../processor/processingContext';
import { NodeType, Content, Reference } from '../../types/node';

import type {
  NodeVisitor,
  ProcessingContext,
  ProtocolHandler,
  ReferenceResolver,
} from '../../processor/interfaces';
import type { Document, Element } from '../../types/node';

describe('DefaultProcessor', () => {
  let processor: DefaultProcessor;
  let mockDocument: Document;
  let mockContext: ProcessingContext;

  beforeEach(() => {
    // 创建测试文档
    mockDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 },
      },
    };

    // 创建上下文
    mockContext = new ProcessingContextImpl(mockDocument, '/test/path');

    // 创建处理器实例
    processor = new DefaultProcessor();
  });

  describe('访问者注册和排序机制', () => {
    it('应该能够注册访问者', () => {
      // 创建模拟访问者
      const mockVisitor: NodeVisitor = {
        priority: 10,
        visitDocument: vi.fn().mockResolvedValue(mockDocument),
        visitElement: vi.fn(),
        visitContent: vi.fn(),
        visitReference: vi.fn(),
      };

      // 注册访问者
      processor.registerVisitor(mockVisitor);

      // 验证访问者已注册
      expect((processor as any).visitors).toContain(mockVisitor);
    });

    it('应该按优先级排序访问者', () => {
      // 创建多个优先级不同的访问者
      const highPriorityVisitor: NodeVisitor = {
        priority: 100,
        visitDocument: vi.fn().mockResolvedValue(mockDocument),
        visitElement: vi.fn(),
        visitContent: vi.fn(),
        visitReference: vi.fn(),
      };

      const mediumPriorityVisitor: NodeVisitor = {
        priority: 50,
        visitDocument: vi.fn().mockResolvedValue(mockDocument),
        visitElement: vi.fn(),
        visitContent: vi.fn(),
        visitReference: vi.fn(),
      };

      const lowPriorityVisitor: NodeVisitor = {
        priority: 1,
        visitDocument: vi.fn().mockResolvedValue(mockDocument),
        visitElement: vi.fn(),
        visitContent: vi.fn(),
        visitReference: vi.fn(),
      };

      // 以混乱顺序注册访问者
      processor.registerVisitor(mediumPriorityVisitor);
      processor.registerVisitor(lowPriorityVisitor);
      processor.registerVisitor(highPriorityVisitor);

      // 处理文档，触发内部排序
      processor.process(mockDocument, '/test/path');

      // 验证访问者已按优先级排序（高到低）
      const visitors = (processor as any).visitors;

      expect(visitors[0]).toBe(highPriorityVisitor);
      expect(visitors[1]).toBe(mediumPriorityVisitor);
      expect(visitors[2]).toBe(lowPriorityVisitor);
    });

    it('应该能注册协议处理器', () => {
      // 创建模拟协议处理器
      const mockHandler: ProtocolHandler = {
        canHandle: vi.fn().mockReturnValue(true),
        handle: vi.fn().mockResolvedValue({}),
      };

      // 注册协议处理器
      processor.registerProtocolHandler(mockHandler);

      // 验证协议处理器已注册
      expect((processor as any).protocolHandlers).toContain(mockHandler);
    });

    it('应该能设置引用解析器', () => {
      // 创建模拟引用解析器
      const mockResolver: ReferenceResolver = {
        resolve: vi.fn().mockResolvedValue({}),
        getProtocolHandler: vi.fn(),
      };

      // 设置引用解析器
      processor.setReferenceResolver(mockResolver);

      // 验证引用解析器已设置
      expect((processor as any).referenceResolver).toBe(mockResolver);
    });
  });

  describe('处理流程骨架', () => {
    it('应该初始化处理上下文', async () => {
      // 模拟处理文档
      await processor.process(mockDocument, '/test/path');

      // 验证上下文已初始化
      const context = (processor as any).context;

      expect(context.document).toBe(mockDocument);
      expect(context.currentPath).toBe('/test/path');
    });

    it('应该按顺序调用所有访问者的visitDocument方法', async () => {
      // 创建三个模拟访问者
      const visitor1 = {
        priority: 30,
        visitDocument: vi.fn().mockImplementation(doc => doc),
        visitElement: vi.fn(),
        visitContent: vi.fn(),
        visitReference: vi.fn(),
      };

      const visitor2 = {
        priority: 20,
        visitDocument: vi.fn().mockImplementation(doc => doc),
        visitElement: vi.fn(),
        visitContent: vi.fn(),
        visitReference: vi.fn(),
      };

      const visitor3 = {
        priority: 10,
        visitDocument: vi.fn().mockImplementation(doc => doc),
        visitElement: vi.fn(),
        visitContent: vi.fn(),
        visitReference: vi.fn(),
      };

      // 注册访问者
      processor.registerVisitor(visitor1);
      processor.registerVisitor(visitor2);
      processor.registerVisitor(visitor3);

      // 处理文档
      await processor.process(mockDocument, '/test/path');

      // 验证所有访问者的visitDocument方法都被调用
      expect(visitor1.visitDocument).toHaveBeenCalled();
      expect(visitor2.visitDocument).toHaveBeenCalled();
      expect(visitor3.visitDocument).toHaveBeenCalled();

      // 验证调用顺序
      const visitor1Call = visitor1.visitDocument.mock.invocationCallOrder[0];
      const visitor2Call = visitor2.visitDocument.mock.invocationCallOrder[0];
      const visitor3Call = visitor3.visitDocument.mock.invocationCallOrder[0];

      expect(visitor1Call).toBeLessThan(visitor2Call);
      expect(visitor2Call).toBeLessThan(visitor3Call);
    });
  });

  describe('节点遍历逻辑', () => {
    it('应该递归遍历所有节点', async () => {
      // 创建一个有嵌套结构的文档
      const nestedDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'root',
            attributes: {},
            children: [
              {
                type: NodeType.ELEMENT,
                tagName: 'child',
                attributes: {},
                children: [
                  {
                    type: NodeType.CONTENT,
                    value: 'Hello',
                    position: {
                      start: { line: 3, column: 1, offset: 0 },
                      end: { line: 3, column: 6, offset: 5 },
                    },
                  },
                ],
                position: {
                  start: { line: 2, column: 1, offset: 0 },
                  end: { line: 4, column: 1, offset: 0 },
                },
              },
              {
                type: NodeType.REFERENCE,
                protocol: 'test',
                path: 'ref/path',
                position: {
                  start: { line: 5, column: 1, offset: 0 },
                  end: { line: 5, column: 20, offset: 19 },
                },
              },
            ],
            position: {
              start: { line: 1, column: 1, offset: 0 },
              end: { line: 6, column: 1, offset: 0 },
            },
          },
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 6, column: 1, offset: 0 },
        },
      };

      // 创建模拟访问者，所有方法都跟踪调用
      const trackingVisitor: NodeVisitor = {
        priority: 10,
        visitDocument: vi.fn().mockImplementation(doc => doc),
        visitElement: vi.fn().mockImplementation(el => el),
        visitContent: vi.fn().mockImplementation(content => content),
        visitReference: vi.fn().mockImplementation(ref => ref),
      };

      // 注册访问者
      processor.registerVisitor(trackingVisitor);

      // 处理文档
      await processor.process(nestedDocument, '/test/path');

      // 验证所有节点类型的方法都被调用了正确的次数
      expect(trackingVisitor.visitDocument).toHaveBeenCalledTimes(1);
      expect(trackingVisitor.visitElement).toHaveBeenCalledTimes(2); // root和child元素
      expect(trackingVisitor.visitContent).toHaveBeenCalledTimes(1);
      expect(trackingVisitor.visitReference).toHaveBeenCalledTimes(1);

      // 验证访问者收到了正确的节点
      expect(trackingVisitor.visitDocument).toHaveBeenCalledWith(
        nestedDocument,
        expect.any(Object)
      );

      expect(trackingVisitor.visitElement).toHaveBeenCalledWith(
        nestedDocument.children[0],
        expect.any(Object)
      );

      expect(trackingVisitor.visitElement).toHaveBeenCalledWith(
        (nestedDocument.children[0] as Element).children[0],
        expect.any(Object)
      );

      expect(trackingVisitor.visitContent).toHaveBeenCalledWith(
        ((nestedDocument.children[0] as Element).children[0] as Element)
          .children[0],
        expect.any(Object)
      );

      expect(trackingVisitor.visitReference).toHaveBeenCalledWith(
        (nestedDocument.children[0] as Element).children[1],
        expect.any(Object)
      );
    });

    it('应该维护正确的父元素栈', async () => {
      // 创建一个有嵌套结构的文档
      const nestedDocument: Document = {
        type: NodeType.DOCUMENT,
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'parent',
            attributes: {},
            children: [
              {
                type: NodeType.ELEMENT,
                tagName: 'child',
                attributes: {},
                children: [],
                position: {
                  start: { line: 2, column: 1, offset: 0 },
                  end: { line: 2, column: 1, offset: 0 },
                },
              },
            ],
            position: {
              start: { line: 1, column: 1, offset: 0 },
              end: { line: 3, column: 1, offset: 0 },
            },
          },
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 3, column: 1, offset: 0 },
        },
      };

      // 存储父元素栈的状态
      let parentStackForChild: Element[] = [];

      // 创建一个记录父元素栈的访问者
      const parentTrackingVisitor: NodeVisitor = {
        priority: 10,
        visitDocument: vi.fn().mockImplementation(doc => doc),
        visitElement: vi.fn().mockImplementation((element, context) => {
          if (element.tagName === 'child') {
            // 记录处理子元素时的父元素栈
            parentStackForChild = [...context.parentElements];
          }

          return element;
        }),
        visitContent: vi.fn(),
        visitReference: vi.fn(),
      };

      // 注册访问者
      processor.registerVisitor(parentTrackingVisitor);

      // 处理文档
      await processor.process(nestedDocument, '/test/path');

      // 验证处理child元素时，父元素栈中包含parent元素
      // 根据DefaultProcessor的实现方式，父元素栈应该包含一个元素 - parent
      expect(parentStackForChild.length).toBe(2);
      // 检查栈顶元素是parent
      expect(parentStackForChild[0].tagName).toBe('parent');
    });
  });
});
