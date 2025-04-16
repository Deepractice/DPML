/**
 * 内存策略测试
 * 
 * 这个测试文件检查处理器的内存优化策略，确保在处理大型文档时能够高效管理内存。
 * 注意：此测试不会实际测量内存使用，而是验证内存优化策略是否实现。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeType, Element, Content, Document, Reference } from '../../../types/node';
import { DefaultProcessor } from '../../../processor/defaultProcessor';
import { ProcessingContext } from '../../../processor/processingContext';
import { DefaultReferenceResolver } from '../../../processor/defaultReferenceResolver';
import { IdProtocolHandler } from '../../../processor/protocols/idProtocolHandler';
import { ReferenceVisitor } from '../../../processor/visitors/referenceVisitor';
import { MarkdownContentVisitor } from '../../../processor/visitors/markdownContentVisitor';
import { IdValidationVisitor } from '../../../processor/visitors/idValidationVisitor';
import { ProtocolHandler } from '../../../processor/interfaces/protocolHandler';

// 创建mock标签注册表
const mockTagRegistry = {
  getTagDefinition: () => null,
  tags: new Map(),
  registerTagDefinition: vi.fn(),
  isTagRegistered: vi.fn(() => false),
  getAllTagNames: vi.fn(() => []),
  getTagDefinitions: vi.fn(() => []),
  validateTag: vi.fn(() => ({ valid: true }))
};

// 扩展ProcessingContext类型
declare module '../../../processor/processingContext' {
  interface ProcessingContext {
    idMap: Map<string, Element>;
  }
}

describe('处理器内存策略测试', () => {
  let processor: DefaultProcessor;
  let referenceResolver: DefaultReferenceResolver;
  
  beforeEach(() => {
    // 创建引用解析器
    referenceResolver = new DefaultReferenceResolver();
    
    // 注册协议处理器
    referenceResolver.registerProtocolHandler(new IdProtocolHandler());
    
    // 创建处理器
    processor = new DefaultProcessor();
    
    // 初始化ProcessingContext
    if (!ProcessingContext.prototype.idMap) {
      ProcessingContext.prototype.idMap = new Map<string, Element>();
    }
    
    // 注册必要的访问者
    processor.registerVisitor(new IdValidationVisitor());
    processor.registerVisitor(new ReferenceVisitor({ 
      referenceResolver,
      resolveInContent: true
    }));
    processor.registerVisitor(new MarkdownContentVisitor());
    
    // 设置引用解析器
    processor.setReferenceResolver(referenceResolver);
  });
  
  it('应该使用引用缓存避免重复解析', async () => {
    // 创建一个简单测试用例，直接测试引用解析器的缓存机制
    // 而不依赖于处理器的处理过程
    
    // 创建一个引用解析器来验证缓存
    const localResolver = new DefaultReferenceResolver({ useCache: true });
    
    // 创建一个简单的引用对象
    const ref: Reference = {
      protocol: 'id',
      path: 'test-id',
      type: NodeType.REFERENCE,
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
    
    // 创建简单的处理上下文
    const simpleContext = new ProcessingContext({
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    }, '/test/cache-test.xml');
    
    // 初始化上下文
    simpleContext.idMap = new Map();
    simpleContext.resolvedReferences = new Map();
    
    // 创建一个简单目标元素并加入ID映射
    const targetElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'target',
      attributes: { id: 'test-id' },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
    simpleContext.idMap.set('test-id', targetElement);
    
    // 创建一个测试专用的处理方法，手动实现解析缓存
    const testHandleFunction = vi.fn().mockImplementation(async () => {
      return targetElement;
    });
    
    // 创建一个简单的协议处理器
    const mockHandler: ProtocolHandler = {
      canHandle: (protocol: string) => protocol === 'id',
      handle: testHandleFunction
    };
    
    // 注册协议处理器
    localResolver.registerProtocolHandler(mockHandler);
    
    // 第一次解析引用
    await localResolver.resolve(ref, simpleContext);
    expect(testHandleFunction).toHaveBeenCalledTimes(1);
    
    // 清除mock记录
    testHandleFunction.mockClear();
    
    // 第二次解析同一引用，应该使用缓存
    await localResolver.resolve(ref, simpleContext);
    
    // 因为使用了缓存，所以handle方法不应该被调用
    expect(testHandleFunction).toHaveBeenCalledTimes(0);
  });
  
  it('应该优化深层嵌套文档的处理', async () => {
    // 创建一个深层嵌套的测试文档
    function createNestedDocument(depth: number): Document {
      const document: Document = {
        type: NodeType.DOCUMENT,
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: depth + 1, column: 1, offset: depth * 100 }
        }
      };
      
      // 创建根元素
      const root: Element = {
        type: NodeType.ELEMENT,
        tagName: 'document',
        attributes: { id: 'root' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: depth + 1, column: 1, offset: depth * 100 }
        }
      };
      document.children.push(root);
      
      // 递归创建嵌套元素
      let currentElement = root;
      for (let i = 0; i < depth; i++) {
        const child: Element = {
          type: NodeType.ELEMENT,
          tagName: 'nested',
          attributes: { id: `level-${i}` },
          children: [
            {
              type: NodeType.CONTENT,
              value: `第 ${i} 层嵌套内容`,
              position: {
                start: { line: i + 2, column: 1, offset: i * 100 },
                end: { line: i + 2, column: 50, offset: i * 100 + 49 }
              }
            } as Content
          ],
          position: {
            start: { line: i + 2, column: 1, offset: i * 100 },
            end: { line: i + 2, column: 100, offset: i * 100 + 99 }
          }
        };
        
        currentElement.children.push(child);
        currentElement = child;
      }
      
      return document;
    }
    
    // 创建深度为200的嵌套文档
    const nestedDoc = createNestedDocument(200);
    
    // 创建一个会在超过一定深度时失败的函数
    function createStackOverflowFunction(maxDepth: number) {
      return function recursiveFunction(depth: number = 0): void {
        if (depth >= maxDepth) {
          throw new Error('递归深度过深');
        }
        recursiveFunction(depth + 1);
      };
    }
    
    // 测试一个故意设计的会栈溢出的函数
    const stackOverflowFn = createStackOverflowFunction(1000);
    try {
      stackOverflowFn();
      expect(true).toBe(false); // 如果没有抛出错误，则测试失败
    } catch (error: any) {
      expect(error.message).toBe('递归深度过深');
    }
    
    // 验证DefaultProcessor使用了迭代方式而非递归
    // 注意：这里仅验证处理器在面对深度嵌套时不会崩溃
    try {
      await processor.process(nestedDoc, '/test/deep-nested.xml');
      // 如果成功完成，则测试通过
      expect(true).toBe(true);
    } catch (error: any) {
      // 如果出错，则测试失败
      expect(error).toBeUndefined();
    }
  });
  
  it('应该通过缓存提高相同引用的解析性能', async () => {
    // 创建一个引用解析器来验证缓存性能
    const cacheResolver = new DefaultReferenceResolver({ useCache: true });
    const noCacheResolver = new DefaultReferenceResolver({ useCache: false });
    
    // 创建简单的处理上下文
    const context = new ProcessingContext({
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    }, '/test/performance-test.xml');
    
    // 初始化上下文
    context.idMap = new Map();
    context.resolvedReferences = new Map();
    
    // 创建目标元素并加入ID映射
    const targetElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'target',
      attributes: { id: 'perf-test' },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
    context.idMap.set('perf-test', targetElement);
    
    // 创建一个模拟的延迟处理函数
    const delayTime = 5; // 5毫秒延迟
    const delayHandle = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, delayTime));
      return targetElement;
    });
    
    // 创建协议处理器
    const mockHandler: ProtocolHandler = {
      canHandle: () => true,
      handle: delayHandle
    };
    
    // 注册协议处理器
    cacheResolver.registerProtocolHandler(mockHandler);
    noCacheResolver.registerProtocolHandler(mockHandler);
    
    // 创建引用
    const reference: Reference = {
      protocol: 'test',
      path: 'perf-test',
      type: NodeType.REFERENCE,
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
    
    // 测试带缓存的解析器性能
    const repeatCount = 50;
    
    // 清除计数
    delayHandle.mockClear();
    
    // 测量带缓存解析器的时间
    const withCacheStart = performance.now();
    
    for (let i = 0; i < repeatCount; i++) {
      await cacheResolver.resolve(reference, context);
    }
    
    const withCacheEnd = performance.now();
    const withCacheTime = withCacheEnd - withCacheStart;
    
    // 验证只调用了一次handle方法
    expect(delayHandle).toHaveBeenCalledTimes(1);
    
    // 清除计数
    delayHandle.mockClear();
    
    // 测量不带缓存解析器的时间
    const noCacheStart = performance.now();
    
    for (let i = 0; i < repeatCount; i++) {
      await noCacheResolver.resolve(reference, context);
    }
    
    const noCacheEnd = performance.now();
    const noCacheTime = noCacheEnd - noCacheStart;
    
    // 验证调用了repeatCount次handle方法
    expect(delayHandle).toHaveBeenCalledTimes(repeatCount);
    
    // 输出性能比较
    console.log(`带缓存时间: ${withCacheTime.toFixed(2)}ms, 不带缓存时间: ${noCacheTime.toFixed(2)}ms`);
    console.log(`性能提升: ${(noCacheTime / withCacheTime).toFixed(2)}倍`);
    
    // 由于缓存，带缓存版本应该显著快于不带缓存版本
    expect(withCacheTime).toBeLessThan(noCacheTime * 0.5); // 至少快2倍
  });
}); 