/**
 * 引用解析器扩展能力测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeType, Element, Content, Document, Reference } from '../../../types/node';
import { DefaultProcessor } from '../../../processor/defaultProcessor';
import { DefaultReferenceResolver } from '../../../processor/defaultReferenceResolver';
import { ProcessingContext } from '../../../processor/processingContext';
import { ProtocolHandler } from '../../../processor/interfaces/protocolHandler';
import { ReferenceResolver } from '../../../processor/interfaces/referenceResolver';
import { ReferenceVisitor } from '../../../processor/visitors/referenceVisitor';

// 自定义协议处理器 - 用于测试
class TestProtocolHandler implements ProtocolHandler {
  public protocol = 'test';
  
  canHandle(protocol: string): boolean {
    return protocol === 'test';
  }
  
  async handle(reference: Reference): Promise<any> {
    return {
      type: 'test',
      id: reference.path,
      content: `测试内容: ${reference.path}`
    };
  }
}

// 自定义引用转换解析器
class TransformingReferenceResolver implements ReferenceResolver {
  private innerResolver: ReferenceResolver;
  private transformFunctions: Record<string, (reference: Reference) => Reference> = {};
  
  constructor(resolver: ReferenceResolver) {
    this.innerResolver = resolver;
  }
  
  // 添加转换函数
  addTransform(protocol: string, transform: (reference: Reference) => Reference): void {
    this.transformFunctions[protocol] = transform;
  }
  
  getProtocolHandler(protocol: string): ProtocolHandler | undefined {
    return this.innerResolver.getProtocolHandler(protocol);
  }
  
  async resolve(reference: Reference, context: ProcessingContext): Promise<any> {
    // 应用转换
    let transformedReference = reference;
    
    if (this.transformFunctions[reference.protocol]) {
      transformedReference = this.transformFunctions[reference.protocol](reference);
    }
    
    // 使用内部解析器解析转换后的引用
    return this.innerResolver.resolve(transformedReference, context);
  }
}

// 完全自定义的解析器
class CustomReferenceResolver implements ReferenceResolver {
  private handlers: ProtocolHandler[] = [];
  private cache: Map<string, any> = new Map();
  
  registerProtocolHandler(handler: ProtocolHandler): void {
    this.handlers.push(handler);
  }
  
  getProtocolHandler(protocol: string): ProtocolHandler | undefined {
    return this.handlers.find(handler => handler.canHandle(protocol));
  }
  
  async resolve(reference: Reference, context: ProcessingContext): Promise<any> {
    // 生成缓存键
    const cacheKey = `${reference.protocol}:${reference.path}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return {
        reference,
        value: this.cache.get(cacheKey)
      };
    }
    
    // 获取协议处理器
    const handler = this.getProtocolHandler(reference.protocol);
    
    if (!handler) {
      throw new Error(`不支持的引用协议: ${reference.protocol}`);
    }
    
    try {
      // 处理引用
      const value = await handler.handle(reference);
      
      // 存入缓存
      this.cache.set(cacheKey, value);
      
      return {
        reference,
        value
      };
    } catch (error) {
      throw new Error(`引用解析失败: ${reference.protocol}:${reference.path}: ${(error as Error).message}`);
    }
  }
}

describe('引用解析器扩展能力测试', () => {
  let processor: DefaultProcessor;
  let defaultResolver: DefaultReferenceResolver;
  let testHandler: TestProtocolHandler;
  
  beforeEach(() => {
    // 创建默认引用解析器和处理器
    defaultResolver = new DefaultReferenceResolver();
    testHandler = new TestProtocolHandler();
    defaultResolver.registerProtocolHandler(testHandler);
    
    processor = new DefaultProcessor();
  });
  
  it('应该支持自定义的引用转换解析器', async () => {
    // 创建转换解析器
    const transformingResolver = new TransformingReferenceResolver(defaultResolver);
    
    // 添加转换: version -> test
    transformingResolver.addTransform('version', (reference: Reference) => {
      // 将version协议转换为test协议
      return {
        ...reference,
        protocol: 'test',
        path: `${reference.path}-version`
      };
    });
    
    // 注册到处理器
    processor.setReferenceResolver(transformingResolver);
    processor.registerVisitor(new ReferenceVisitor({
      referenceResolver: transformingResolver,
      resolveInContent: true
    }));
    
    // 创建测试引用
    const versionRef: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'version',
      path: 'item123',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 }
      }
    };
    
    // 创建测试文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'test-transform' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'section1' },
              children: [
                versionRef
              ],
              position: {
                start: { line: 2, column: 1, offset: 30 },
                end: { line: 4, column: 1, offset: 80 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 5, column: 1, offset: 90 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 5, column: 1, offset: 90 }
      }
    };
    
    // 使用转换解析器处理
    const context = new ProcessingContext(document, '/test/transform.xml');
    const result = await transformingResolver.resolve(versionRef, context);
    
    // 验证转换
    expect(result.value.type).toBe('test');
    expect(result.value.id).toBe('item123-version');
    expect(result.value.content).toBe('测试内容: item123-version');
    
    // 监视协议处理器
    const handleSpy = vi.spyOn(testHandler, 'handle');
    
    // 处理文档
    await processor.process(document, '/test/transform.xml');
    
    // 验证处理器被调用且使用了转换后的协议和路径
    expect(handleSpy).toHaveBeenCalled();
    const lastCall = handleSpy.mock.lastCall;
    expect(lastCall?.[0].protocol).toBe('test');
    expect(lastCall?.[0].path).toBe('item123-version');
  });
  
  it('应该支持完全自定义的引用解析器', async () => {
    // 创建自定义解析器
    const customResolver = new CustomReferenceResolver();
    customResolver.registerProtocolHandler(testHandler);
    
    // 注册到处理器
    processor.setReferenceResolver(customResolver);
    processor.registerVisitor(new ReferenceVisitor({
      referenceResolver: customResolver,
      resolveInContent: true
    }));
    
    // 创建测试引用
    const testRef: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'test',
      path: 'custom-item',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 }
      }
    };
    
    // 创建测试文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'test-custom' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'section1' },
              children: [
                testRef
              ],
              position: {
                start: { line: 2, column: 1, offset: 30 },
                end: { line: 4, column: 1, offset: 80 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 5, column: 1, offset: 90 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 5, column: 1, offset: 90 }
      }
    };
    
    // 使用自定义解析器处理
    const context = new ProcessingContext(document, '/test/custom.xml');
    
    // 首先测试解析器能正确工作
    const result = await customResolver.resolve(testRef, context);
    
    // 验证结果
    expect(result.value.type).toBe('test');
    expect(result.value.id).toBe('custom-item');
    expect(result.value.content).toBe('测试内容: custom-item');
    
    // 测试缓存机制
    // 先清除之前调用的缓存
    (customResolver as any).cache.clear();
    
    // 设置spy在resolve调用前
    const handleSpy = vi.spyOn(testHandler, 'handle');
    
    // 第一次调用，协议处理器应该被调用
    await customResolver.resolve(testRef, context);
    expect(handleSpy).toHaveBeenCalledTimes(1);
    
    // 再次调用同一个引用，应该使用缓存
    handleSpy.mockClear();
    await customResolver.resolve(testRef, context);
    expect(handleSpy).not.toHaveBeenCalled();
    
    // 处理文档
    await processor.process(document, '/test/custom.xml');
  });
}); 