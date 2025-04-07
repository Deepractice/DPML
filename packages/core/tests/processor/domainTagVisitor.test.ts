import { Element, NodeType } from '../../src/types/node';
import { ProcessingContext } from '../../src/processor/interfaces';
import { TagProcessor, TagProcessorRegistry } from '../../src/processor/interfaces';
import { DomainTagVisitor } from '../../src/processor/visitors/domainTagVisitor';
import { vi } from 'vitest';

describe('DomainTagVisitor', () => {
  // 创建一个模拟的ProcessingContext
  const createMockContext = () => {
    return {
      document: { type: NodeType.DOCUMENT, children: [], position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } } },
      currentPath: '/test/path',
      filePath: '/test/path',
      resolvedReferences: new Map(),
      parentElements: [],
      variables: {},
      idMap: new Map()
    } as ProcessingContext;
  };
  
  // 创建一个模拟的TagProcessorRegistry
  class MockTagProcessorRegistry implements TagProcessorRegistry {
    private processors: Map<string, TagProcessor[]> = new Map();
    
    registerProcessor(tagName: string, processor: TagProcessor): void {
      const existingProcessors = this.processors.get(tagName) || [];
      existingProcessors.push(processor);
      this.processors.set(tagName, existingProcessors);
    }
    
    getProcessors(tagName: string): TagProcessor[] {
      return this.processors.get(tagName) || [];
    }
  }
  
  it('should not modify elements without registered processors', async () => {
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'unregistered-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    const registry = new MockTagProcessorRegistry();
    const context = createMockContext();
    const visitor = new DomainTagVisitor(registry);
    
    const result = await visitor.visitElement(element, context);
    
    expect(result).toEqual(element);
  });
  
  it('should apply registered processor to matching element', async () => {
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    // 创建一个模拟的标签处理器
    const mockProcessor: TagProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(async (el) => {
        if (!el.metadata) {
          el.metadata = {};
        }
        el.metadata.processed = true;
        el.metadata.processorName = 'mockProcessor';
        return el;
      })
    };
    
    // 注册处理器
    const registry = new MockTagProcessorRegistry();
    registry.registerProcessor('test-tag', mockProcessor);
    
    const context = createMockContext();
    const visitor = new DomainTagVisitor(registry);
    
    const result = await visitor.visitElement(element, context);
    
    // 验证处理器是否被调用
    expect(mockProcessor.canProcess).toHaveBeenCalledWith(element);
    expect(mockProcessor.process).toHaveBeenCalledWith(element, context);
    
    // 验证元素是否被处理
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('mockProcessor');
  });
  
  it('should apply multiple processors in order', async () => {
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'multi-processor-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    // 创建多个模拟处理器
    const processor1: TagProcessor = {
      priority: 10,
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(async (el) => {
        if (!el.metadata) {
          el.metadata = {};
        }
        el.metadata.processor1 = true;
        return el;
      })
    };
    
    const processor2: TagProcessor = {
      priority: 20,
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(async (el) => {
        if (!el.metadata) {
          el.metadata = {};
        }
        el.metadata.processor2 = true;
        return el;
      })
    };
    
    // 注册处理器
    const registry = new MockTagProcessorRegistry();
    registry.registerProcessor('multi-processor-tag', processor1);
    registry.registerProcessor('multi-processor-tag', processor2);
    
    const context = createMockContext();
    const visitor = new DomainTagVisitor(registry);
    
    const result = await visitor.visitElement(element, context);
    
    // 验证所有处理器都被调用
    expect(processor1.canProcess).toHaveBeenCalledWith(element);
    expect(processor1.process).toHaveBeenCalled();
    expect(processor2.canProcess).toHaveBeenCalled();
    expect(processor2.process).toHaveBeenCalled();
    
    // 验证元素包含两个处理器的元数据
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.processor1).toBe(true);
    expect(result.metadata!.processor2).toBe(true);
  });
  
  it('should handle processor errors gracefully', async () => {
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'error-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    // 创建一个会抛出错误的处理器
    const errorProcessor: TagProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(async () => {
        throw new Error('Processor error');
      })
    };
    
    // 注册处理器
    const registry = new MockTagProcessorRegistry();
    registry.registerProcessor('error-tag', errorProcessor);
    
    const context = createMockContext();
    const visitor = new DomainTagVisitor(registry);
    
    // 验证访问者能够处理处理器抛出的错误
    // 我们期望元素保持不变，而不是抛出错误
    const result = await visitor.visitElement(element, context);
    expect(result).toEqual(element);
    
    // 验证处理器尝试处理过
    expect(errorProcessor.canProcess).toHaveBeenCalled();
    expect(errorProcessor.process).toHaveBeenCalled();
  });
}); 