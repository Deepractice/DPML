import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeType, Reference, Document } from '../../src/types/node';
import { ProcessingContext } from '../../src/processor/processingContext';
import { DefaultReferenceResolver } from '../../src/processor/defaultReferenceResolver';
import { ProtocolHandler, ResolvedReference } from '../../src/processor/interfaces';
import { ReferenceError, ErrorCode } from '../../src/errors/types';

describe('DefaultReferenceResolver', () => {
  let resolver: DefaultReferenceResolver;
  let context: ProcessingContext;
  let mockHttpHandler: ProtocolHandler;
  let mockFileHandler: ProtocolHandler;
  let mockIdHandler: ProtocolHandler;
  
  const createMockReference = (protocol: string, path: string): Reference => ({
    type: NodeType.REFERENCE,
    protocol,
    path,
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  });
  
  beforeEach(() => {
    // 创建处理上下文
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };
    
    context = new ProcessingContext(document, '/test/path');
    
    // 创建模拟协议处理器
    mockHttpHandler = {
      canHandle: vi.fn(protocol => protocol === 'http' || protocol === 'https'),
      handle: vi.fn().mockImplementation(async (reference: Reference) => ({ 
        content: `HTTP content from ${reference.path}` 
      }))
    };
    
    mockFileHandler = {
      canHandle: vi.fn(protocol => protocol === 'file'),
      handle: vi.fn().mockImplementation(async (reference: Reference) => ({ 
        content: `File content from ${reference.path}` 
      }))
    };
    
    mockIdHandler = {
      canHandle: vi.fn(protocol => protocol === 'id'),
      handle: vi.fn().mockImplementation(async (reference: Reference) => ({ 
        id: reference.path, 
        type: 'element' 
      }))
    };
    
    // 创建解析器实例并注册处理器
    resolver = new DefaultReferenceResolver({
      defaultProtocolHandlers: [mockHttpHandler, mockFileHandler]
    });
  });
  
  it('应该注册和获取协议处理器', () => {
    // 通过构造函数注册的处理器应该可以获取
    expect(resolver.getProtocolHandler('http')).toBe(mockHttpHandler);
    expect(resolver.getProtocolHandler('https')).toBe(mockHttpHandler);
    expect(resolver.getProtocolHandler('file')).toBe(mockFileHandler);
    expect(resolver.getProtocolHandler('id')).toBeUndefined();
    
    // 测试后注册的处理器
    resolver.registerProtocolHandler(mockIdHandler);
    expect(resolver.getProtocolHandler('id')).toBe(mockIdHandler);
    
    // 当有多个处理器可以处理同一协议时，应该返回最后注册的
    const anotherHttpHandler: ProtocolHandler = {
      canHandle: vi.fn(protocol => protocol === 'http'),
      handle: vi.fn()
    };
    
    resolver.registerProtocolHandler(anotherHttpHandler);
    expect(resolver.getProtocolHandler('http')).toBe(anotherHttpHandler);
  });
  
  it('应该正确解析引用', async () => {
    // HTTP引用
    const httpReference = createMockReference('http', 'example.com/resource');
    const httpResult = await resolver.resolve(httpReference, context);
    
    expect(httpResult).toEqual({
      reference: httpReference,
      value: { content: 'HTTP content from example.com/resource' }
    });
    expect(mockHttpHandler.handle).toHaveBeenCalledWith(httpReference);
    
    // 文件引用
    const fileReference = createMockReference('file', '/path/to/file');
    const fileResult = await resolver.resolve(fileReference, context);
    
    expect(fileResult).toEqual({
      reference: fileReference,
      value: { content: 'File content from /path/to/file' }
    });
    expect(mockFileHandler.handle).toHaveBeenCalledWith(fileReference);
  });
  
  it('应该使用引用缓存', async () => {
    // 创建引用
    const reference = createMockReference('http', 'example.com/resource');
    
    // 第一次解析
    await resolver.resolve(reference, context);
    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1);
    
    // 重置模拟函数计数
    vi.clearAllMocks();
    
    // 第二次解析同一引用应该使用缓存
    await resolver.resolve(reference, context);
    expect(mockHttpHandler.handle).not.toHaveBeenCalled();
    
    // 禁用缓存的解析器
    const noCacheResolver = new DefaultReferenceResolver({
      defaultProtocolHandlers: [mockHttpHandler],
      useCache: false
    });
    
    // 使用禁用缓存的解析器
    await noCacheResolver.resolve(reference, context);
    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1);
    
    // 再次解析，应该再次调用处理器
    vi.clearAllMocks();
    await noCacheResolver.resolve(reference, context);
    expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1);
  });
  
  it('处理不支持的协议时应抛出错误', async () => {
    const unknownReference = createMockReference('unknown', 'test');
    
    await expect(resolver.resolve(unknownReference, context)).rejects.toThrow(ReferenceError);
    await expect(resolver.resolve(unknownReference, context)).rejects.toThrow('不支持的引用协议');
  });
  
  it('处理引用解析失败时应抛出错误', async () => {
    // 模拟处理失败
    const failingHttpHandler: ProtocolHandler = {
      canHandle: vi.fn().mockReturnValue(true),
      handle: vi.fn().mockRejectedValue(new Error('Connection failed'))
    };
    
    // 创建使用失败处理器的解析器
    const failingResolver = new DefaultReferenceResolver({
      defaultProtocolHandlers: [failingHttpHandler]
    });
    
    const httpReference = createMockReference('http', 'example.com/fail');
    
    await expect(failingResolver.resolve(httpReference, context)).rejects.toThrow(ReferenceError);
    await expect(failingResolver.resolve(httpReference, context)).rejects.toThrow('引用解析失败');
  });
});
