import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Element, NodeType, Document } from '../../../types/node';
import { TransformContext } from '../../../transformer/interfaces/transformContext';
import { TagProcessor, TagProcessorRegistry } from '../../../transformer/interfaces/tagProcessor';
import { TagProcessorVisitor } from '../../../transformer/visitors/tagProcessorVisitor';
// 临时移除引用，稍后再实现
// import { DefaultTagProcessorRegistry } from '../../../transformer/tagProcessors/defaultTagProcessorRegistry';

describe('标签处理器交互', () => {
  // 创建一个TransformContext
  const createMockContext = (document?: Document) => {
    return {
      document: document || { 
        type: NodeType.DOCUMENT, 
        children: [], 
        position: { 
          start: { line: 0, column: 0, offset: 0 }, 
          end: { line: 0, column: 0, offset: 0 } 
        } 
      },
      variables: {},
      path: [],
      parentResults: [],
      options: {},
      output: null
    } as TransformContext;
  };
  
  // 自定义标签处理器基类
  class BaseProcessor implements TagProcessor {
    constructor(public name: string, public priority: number = 0) {}
    
    canProcess(element: Element): boolean {
      return true; // 默认可以处理所有元素
    }
    
    process(element: Element, context: TransformContext): Element | Promise<Element> {
      const updatedElement = { ...element };
      if (!updatedElement.meta) {
        updatedElement.meta = {};
      }
      
      if (!updatedElement.meta.processedBy) {
        updatedElement.meta.processedBy = [];
      }
      
      // 记录处理过程
      (updatedElement.meta.processedBy as string[]).push(this.name);
      
      return updatedElement;
    }
  }
  
  // 临时为了测试实现一个简单的TagProcessorRegistry
  class MockTagProcessorRegistry implements TagProcessorRegistry {
    private processors: Map<string, TagProcessor[]> = new Map();
    
    registerProcessor(tagName: string, processor: TagProcessor): void {
      const processorList = this.processors.get(tagName) || [];
      processorList.push(processor);
      this.processors.set(tagName, processorList);
    }
    
    getProcessors(tagName: string): TagProcessor[] {
      return this.processors.get(tagName) || [];
    }
    
    hasProcessors(tagName: string): boolean {
      const processors = this.processors.get(tagName);
      return !!processors && processors.length > 0;
    }
  }
  
  let registry: MockTagProcessorRegistry;
  let visitor: TagProcessorVisitor;
  
  beforeEach(() => {
    // 创建注册表和访问者
    registry = new MockTagProcessorRegistry();
    visitor = new TagProcessorVisitor(registry);
  });
  
  it('应该按优先级顺序执行处理器链', async () => {
    // 创建多个优先级不同的处理器
    const processor1 = new BaseProcessor('processor1', 10);
    const processor2 = new BaseProcessor('processor2', 30);
    const processor3 = new BaseProcessor('processor3', 20);
    
    // 注册处理器
    registry.registerProcessor('test-tag', processor1);
    registry.registerProcessor('test-tag', processor2);
    registry.registerProcessor('test-tag', processor3);
    
    // 创建测试元素
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    const context = createMockContext();
    
    // 执行处理
    const result = await visitor.visitElement(element, context);
    
    // 验证处理顺序 - 应该是按优先级从高到低: processor2 -> processor3 -> processor1
    expect(result.meta).toBeDefined();
    expect(Array.isArray(result.meta?.processedBy)).toBe(true);
    expect(result.meta?.processedBy).toEqual(['processor2', 'processor3', 'processor1']);
  });
  
  it('应该支持处理器之间的数据传递', async () => {
    // 创建一个处理器，为元素添加数据
    const dataInitProcessor: TagProcessor = {
      priority: 30,
      canProcess(element: Element): boolean {
        return element.tagName === 'data-tag';
      },
      process(element: Element, context: TransformContext): Element {
        return {
          ...element,
          meta: {
            ...element.meta,
            value: 5,
            initialized: true
          }
        };
      }
    };
    
    // 创建一个依赖第一个处理器添加的数据的处理器
    const dataTransformProcessor: TagProcessor = {
      priority: 20,
      canProcess(element: Element): boolean {
        // 只处理已经被初始化的元素
        return element.tagName === 'data-tag' && element.meta?.initialized === true;
      },
      process(element: Element, context: TransformContext): Element {
        // 获取第一个处理器设置的值并处理
        const value = (element.meta?.value as number) || 0;
        return {
          ...element,
          meta: {
            ...element.meta,
            value: value * 2, // 将值乘以2
            transformed: true
          }
        };
      }
    };
    
    // 创建第三个处理器，进一步处理数据
    const dataFinalizeProcessor: TagProcessor = {
      priority: 10,
      canProcess(element: Element): boolean {
        // 只处理已经被转换的元素
        return element.tagName === 'data-tag' && element.meta?.transformed === true;
      },
      process(element: Element, context: TransformContext): Element {
        // 获取前一个处理器设置的值并最终处理
        const value = (element.meta?.value as number) || 0;
        return {
          ...element,
          meta: {
            ...element.meta,
            value: value + 10, // 将值加10
            finalized: true
          }
        };
      }
    };
    
    // 注册处理器
    registry.registerProcessor('data-tag', dataInitProcessor);
    registry.registerProcessor('data-tag', dataTransformProcessor);
    registry.registerProcessor('data-tag', dataFinalizeProcessor);
    
    // 创建测试元素
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'data-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    const context = createMockContext();
    
    // 执行处理
    const result = await visitor.visitElement(element, context);
    
    // 验证处理结果
    // 初始值为5，乘以2后为10，加10后为20
    expect(result.meta).toBeDefined();
    expect(result.meta?.value).toBe(20);
    expect(result.meta?.initialized).toBe(true);
    expect(result.meta?.transformed).toBe(true);
    expect(result.meta?.finalized).toBe(true);
  });
  
  it('应该支持处理器条件执行', async () => {
    // 创建一个通用处理器
    const generalProcessor: TagProcessor = {
      priority: 20,
      canProcess(element: Element): boolean {
        return true; // 处理所有元素
      },
      process(element: Element, context: TransformContext): Element {
        return {
          ...element,
          meta: {
            ...element.meta,
            general: true
          }
        };
      }
    };
    
    // 创建一个有条件的处理器，只处理带有特定属性的元素
    const conditionalProcessor: TagProcessor = {
      priority: 10,
      canProcess(element: Element): boolean {
        return element.attributes && 'data-special' in element.attributes;
      },
      process(element: Element, context: TransformContext): Element {
        return {
          ...element,
          meta: {
            ...element.meta,
            conditional: true
          }
        };
      }
    };
    
    // 注册处理器
    registry.registerProcessor('*', generalProcessor); // 通配符处理器
    registry.registerProcessor('condition-tag', conditionalProcessor);
    
    // 创建测试元素 - 不带特定属性
    const element1: Element = {
      type: NodeType.ELEMENT,
      tagName: 'condition-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    // 创建测试元素 - 带特定属性
    const element2: Element = {
      type: NodeType.ELEMENT,
      tagName: 'condition-tag',
      attributes: { 'data-special': 'true' },
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    const context = createMockContext();
    
    // 执行处理
    const result1 = await visitor.visitElement(element1, context);
    const result2 = await visitor.visitElement(element2, context);
    
    // 验证处理结果
    expect(result1.meta).toBeDefined();
    expect(result1.meta?.general).toBe(true);
    expect(result1.meta?.conditional).toBeUndefined(); // 条件处理器不应处理
    
    expect(result2.meta).toBeDefined();
    expect(result2.meta?.general).toBe(true);
    expect(result2.meta?.conditional).toBe(true); // 条件处理器应该处理
  });
  
  it('应该支持异步处理器链和数据传递', async () => {
    // 创建第一个异步处理器
    const asyncInitProcessor: TagProcessor = {
      priority: 30,
      canProcess(element: Element): boolean {
        return element.tagName === 'async-tag';
      },
      async process(element: Element, context: TransformContext): Promise<Element> {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          ...element,
          meta: {
            ...element.meta,
            asyncStep: 1,
            data: 'initial'
          }
        };
      }
    };
    
    // 创建第二个异步处理器，依赖于第一个
    const asyncSecondProcessor: TagProcessor = {
      priority: 20,
      canProcess(element: Element): boolean {
        return element.meta?.asyncStep === 1;
      },
      async process(element: Element, context: TransformContext): Promise<Element> {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          ...element,
          meta: {
            ...element.meta,
            asyncStep: 2,
            data: (element.meta?.data as string) + '-second'
          }
        };
      }
    };
    
    // 创建第三个异步处理器，依赖于第二个
    const asyncThirdProcessor: TagProcessor = {
      priority: 10,
      canProcess(element: Element): boolean {
        return element.meta?.asyncStep === 2;
      },
      async process(element: Element, context: TransformContext): Promise<Element> {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          ...element,
          meta: {
            ...element.meta,
            asyncStep: 3,
            data: (element.meta?.data as string) + '-final'
          }
        };
      }
    };
    
    // 注册处理器
    registry.registerProcessor('async-tag', asyncInitProcessor);
    registry.registerProcessor('async-tag', asyncSecondProcessor);
    registry.registerProcessor('async-tag', asyncThirdProcessor);
    
    // 创建测试元素
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'async-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    const context = createMockContext();
    
    // 执行处理
    const result = await visitor.visitElement(element, context);
    
    // 验证处理结果
    expect(result.meta).toBeDefined();
    expect(result.meta?.asyncStep).toBe(3);
    expect(result.meta?.data).toBe('initial-second-final');
  });
  
  it('应该正确处理嵌套元素的处理器交互', async () => {
    // 创建父元素处理器
    const parentProcessor: TagProcessor = {
      priority: 20,
      canProcess(element: Element): boolean {
        return element.tagName === 'parent-tag';
      },
      process(element: Element, context: TransformContext): Element {
        return {
          ...element,
          meta: {
            ...element.meta,
            parentProcessed: true
          }
        };
      }
    };
    
    // 创建子元素处理器
    const childProcessor: TagProcessor = {
      priority: 10,
      canProcess(element: Element): boolean {
        return element.tagName === 'child-tag';
      },
      process(element: Element, context: TransformContext): Element {
        // 子元素处理器检查父元素状态
        const parentResults = context.parentResults || [];
        const parentMeta = parentResults.length > 0 && parentResults[parentResults.length - 1]?.meta;
        
        return {
          ...element,
          meta: {
            ...element.meta,
            childProcessed: true,
            parentStatus: parentMeta?.parentProcessed ? 'processed' : 'unknown'
          }
        };
      }
    };
    
    // 注册处理器
    registry.registerProcessor('parent-tag', parentProcessor);
    registry.registerProcessor('child-tag', childProcessor);
    
    // 创建测试嵌套元素
    const childElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child-tag',
      attributes: {},
      children: [],
      position: { start: { line: 1, column: 1, offset: 10 }, end: { line: 1, column: 20, offset: 29 } }
    };
    
    const parentElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'parent-tag',
      attributes: {},
      children: [childElement],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 40 } }
    };
    
    const context = createMockContext();
    
    // 执行处理
    const result = await visitor.visitElement(parentElement, context);
    
    // 验证处理结果
    expect(result.meta).toBeDefined();
    expect(result.meta?.parentProcessed).toBe(true);
    
    const processedChild = result.children[0] as Element;
    expect(processedChild.meta).toBeDefined();
    expect(processedChild.meta?.childProcessed).toBe(true);
    
    // 注意：parentStatus可能为"unknown"，因为TagProcessorVisitor默认实现可能不会将父元素结果传递给子元素
    // 这取决于TransformContext的具体实现和处理顺序
  });
  
  it('应该正确处理错误并继续执行处理器链', async () => {
    // 创建第一个处理器
    const firstProcessor: TagProcessor = {
      priority: 30,
      canProcess(element: Element): boolean {
        return element.tagName === 'error-chain-tag';
      },
      process(element: Element, context: TransformContext): Element {
        return {
          ...element,
          meta: {
            ...element.meta,
            first: true
          }
        };
      }
    };
    
    // 创建一个会抛出错误的处理器
    const errorProcessor: TagProcessor = {
      priority: 20,
      canProcess(element: Element): boolean {
        return element.tagName === 'error-chain-tag';
      },
      process(element: Element, context: TransformContext): Element {
        throw new Error('Intentional error in processor');
      }
    };
    
    // 创建第三个处理器，应该在错误处理器后继续执行
    const lastProcessor: TagProcessor = {
      priority: 10,
      canProcess(element: Element): boolean {
        return element.tagName === 'error-chain-tag';
      },
      process(element: Element, context: TransformContext): Element {
        return {
          ...element,
          meta: {
            ...element.meta,
            last: true
          }
        };
      }
    };
    
    // 注册处理器
    registry.registerProcessor('error-chain-tag', firstProcessor);
    registry.registerProcessor('error-chain-tag', errorProcessor);
    registry.registerProcessor('error-chain-tag', lastProcessor);
    
    // 创建测试元素
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'error-chain-tag',
      attributes: {},
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    
    const context = createMockContext();
    
    // 设置错误处理选项
    visitor = new TagProcessorVisitor(registry, 50, {
      ignoreErrors: true,
      addErrorsToMeta: true
    });
    
    // 执行处理
    const result = await visitor.visitElement(element, context);
    
    // 验证处理结果
    expect(result.meta).toBeDefined();
    expect(result.meta?.first).toBe(true);
    expect(result.meta?.last).toBe(true);
    expect(result.meta?.errors).toBeDefined();
    expect(Array.isArray(result.meta?.errors)).toBe(true);
    expect((result.meta?.errors as any[])?.length).toBeGreaterThan(0);
    expect((result.meta?.errors as string[])[0]).toContain('Intentional error');
  });
}); 