/**
 * 访问者扩展能力测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeType, Element, Content, Node, Document } from '../../../src/types/node';
import { DefaultProcessor } from '../../../src/processor/defaultProcessor';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { NodeVisitor } from '../../../src/processor/interfaces/nodeVisitor';

// 创建一个自定义访问者
class CustomVisitor implements NodeVisitor {
  public name = 'CustomVisitor';
  public priority = 100; // 默认优先级
  public visitCalled = false;
  public visitElementCalled = false;
  public visitContentCalled = false;

  constructor(priority?: number) {
    if (priority !== undefined) {
      this.priority = priority;
    }
  }

  // visit方法是不会被自动调用的，我们应该实现具体的visitElement等方法
  async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
    this.visitElementCalled = true;
    this.visitCalled = true;
    
    // 自定义元素处理逻辑
    if (element.attributes && element.attributes['data-custom'] === 'true') {
      // 添加一个自定义标记
      element.attributes['data-processed'] = 'by-custom-visitor';
    }
    
    // 处理子元素（递归处理内容节点）
    if (element.children && element.children.length > 0) {
      const newChildren = [];
      for (const child of element.children) {
        if (child.type === NodeType.CONTENT) {
          newChildren.push(await this.visitContent(child as Content, context));
        } else {
          newChildren.push(child);
        }
      }
      element.children = newChildren;
    }
    
    return element;
  }

  async visitContent(content: Content, context: ProcessingContext): Promise<Content> {
    this.visitContentCalled = true;
    this.visitCalled = true;
    
    // 自定义内容处理逻辑
    if (content.value && content.value.includes('[[custom]]')) {
      // 替换特定标记
      content.value = content.value.replace('[[custom]]', '<custom-tag>替换的内容</custom-tag>');
    }
    return content;
  }
}

// 创建另一个自定义访问者，用于测试多访问者协作
class AnotherVisitor implements NodeVisitor {
  public name = 'AnotherVisitor';
  public priority = 50; // 较低的优先级
  public visitCalled = false;

  constructor(priority?: number) {
    if (priority !== undefined) {
      this.priority = priority;
    }
  }

  async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
    this.visitCalled = true;
    
    // 检查是否已被其他访问者处理
    if (element.attributes && element.attributes['data-processed']) {
      // 添加额外标记
      element.attributes['data-also-processed'] = 'by-another-visitor';
    }
    
    return element;
  }
}

describe('访问者扩展能力测试', () => {
  let processor: DefaultProcessor;
  
  beforeEach(() => {
    processor = new DefaultProcessor();
  });
  
  it('应该能注册和执行自定义访问者', async () => {
    // 创建自定义访问者
    const customVisitor = new CustomVisitor();
    
    // 注册到处理器
    processor.registerVisitor(customVisitor);
    
    // 创建测试文档
    const testDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'test',
          attributes: { 'data-custom': 'true', id: 'test-element' },
          children: [
            {
              type: NodeType.CONTENT,
              value: '这是一段包含[[custom]]标记的内容',
              position: { 
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 30, offset: 29 }
              }
            } as Content
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 2, column: 1, offset: 30 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 2, column: 1, offset: 30 }
      }
    };
    
    // 处理文档
    const result = await processor.process(testDocument, '/test/custom-visitor.xml');
    
    // 验证访问者被调用
    expect(customVisitor.visitElementCalled).toBe(true);
    expect(customVisitor.visitContentCalled).toBe(true);
    expect(customVisitor.visitCalled).toBe(true);
    
    // 验证处理结果
    expect(result.type).toBe(NodeType.DOCUMENT);
    const resultElement = result.children[0] as Element;
    expect(resultElement.attributes['data-processed']).toBe('by-custom-visitor');
    
    // 验证内容处理
    const contentNode = resultElement.children[0] as Content;
    expect(contentNode.value).toContain('<custom-tag>替换的内容</custom-tag>');
    expect(contentNode.value).not.toContain('[[custom]]');
  });
  
  it('应该根据优先级排序执行访问者', async () => {
    // 创建多个优先级不同的访问者
    const highPriorityVisitor = new CustomVisitor(200); // 高优先级
    const mediumPriorityVisitor = new CustomVisitor(100); // 中优先级
    const lowPriorityVisitor = new CustomVisitor(50); // 低优先级
    
    // 按不同顺序注册访问者
    processor.registerVisitor(lowPriorityVisitor);
    processor.registerVisitor(highPriorityVisitor);
    processor.registerVisitor(mediumPriorityVisitor);
    
    // 手动排序访问者
    (processor as any).sortVisitors();
    
    // 获取访问者列表验证排序
    const visitors = (processor as any).visitors;
    
    // 验证访问者按优先级降序排列
    expect(visitors[0].priority).toBe(200);
    expect(visitors[1].priority).toBe(100);
    expect(visitors[2].priority).toBe(50);
    
    // 创建测试文档
    const testDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'test',
          attributes: { id: 'priority-test' },
          children: [],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 10, offset: 9 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
    
    // 使用spy跟踪visitElement方法调用
    const highSpy = vi.spyOn(highPriorityVisitor, 'visitElement');
    const mediumSpy = vi.spyOn(mediumPriorityVisitor, 'visitElement');
    const lowSpy = vi.spyOn(lowPriorityVisitor, 'visitElement');
    
    // 处理文档
    await processor.process(testDocument, '/test/priority-test.xml');
    
    // 验证调用顺序
    expect(highSpy.mock.invocationCallOrder[0]).toBeLessThan(mediumSpy.mock.invocationCallOrder[0]);
    expect(mediumSpy.mock.invocationCallOrder[0]).toBeLessThan(lowSpy.mock.invocationCallOrder[0]);
  });
  
  it('应该支持多访问者协作处理', async () => {
    // 创建两个协作的访问者
    const customVisitor = new CustomVisitor(100);
    const anotherVisitor = new AnotherVisitor(50);
    
    // 注册访问者
    processor.registerVisitor(customVisitor);
    processor.registerVisitor(anotherVisitor);
    
    // 创建测试文档
    const testDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'test',
          attributes: { 'data-custom': 'true', id: 'collaboration-test' },
          children: [],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 10, offset: 9 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
    
    // 处理文档
    const result = await processor.process(testDocument, '/test/collaboration-test.xml');
    
    // 验证两个访问者都被调用
    expect(customVisitor.visitCalled).toBe(true);
    expect(anotherVisitor.visitCalled).toBe(true);
    
    // 验证协作处理结果
    const resultElement = result.children[0] as Element;
    expect(resultElement.attributes['data-processed']).toBe('by-custom-visitor');
    expect(resultElement.attributes['data-also-processed']).toBe('by-another-visitor');
  });
  
  it('应该允许访问者修改上下文数据供后续访问者使用', async () => {
    // 创建一个向上下文添加数据的访问者
    class ContextSetterVisitor implements NodeVisitor {
      public name = 'ContextSetterVisitor';
      public priority = 150;
      public executed = false;
      
      async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
        this.executed = true;
        // 向上下文添加数据
        context.variables.testKey = 'testValue';
        // 使用变量存储缓存数据
        context.variables.testCache = { data: 'cacheData' };
        return element;
      }
    }
    
    // 创建一个从上下文读取数据的访问者
    class ContextReaderVisitor implements NodeVisitor {
      public name = 'ContextReaderVisitor';
      public priority = 50;
      public contextData: any = null;
      public cacheData: any = null;
      public executed = false;
      
      async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
        this.executed = true;
        // 读取上下文数据
        this.contextData = context.variables.testKey;
        this.cacheData = context.variables.testCache;
        return element;
      }
    }
    
    // 创建访问者实例
    const setterVisitor = new ContextSetterVisitor();
    const readerVisitor = new ContextReaderVisitor();
    
    // 注册访问者
    processor.registerVisitor(setterVisitor);
    processor.registerVisitor(readerVisitor);
    
    // 创建测试文档
    const testDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'test',
          attributes: { id: 'context-test' },
          children: [],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 10, offset: 9 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
    
    // 处理文档
    await processor.process(testDocument, '/test/context-test.xml');
    
    // 验证访问者被执行
    expect(setterVisitor.executed).toBe(true);
    expect(readerVisitor.executed).toBe(true);
    
    // 验证上下文数据传递
    expect(readerVisitor.contextData).toBe('testValue');
    expect(readerVisitor.cacheData).toEqual({ data: 'cacheData' });
  });
}); 