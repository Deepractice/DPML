import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultTransformer } from '../../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../../src/transformer/interfaces/transformerVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { TransformOptions } from '../../../src/transformer/interfaces/transformOptions';
import { NodeType, Element, Document } from '../../../src/types/node';
import { OutputAdapterFactory } from '../../../src/transformer/interfaces/outputAdapterFactory';
import { OutputAdapter } from '../../../src/transformer/interfaces/outputAdapter';

describe('未知格式处理机制', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  
  // 在每个测试前初始化控制台间谍
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  // 在每个测试后恢复控制台间谍
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
  
  // 创建一个测试文档
  const createTestDocument = (): Document => ({
    type: NodeType.DOCUMENT,
    children: [
      {
        type: NodeType.ELEMENT,
        tagName: 'root',
        attributes: {},
        children: [
          {
            type: NodeType.CONTENT,
            value: 'Hello, world!',
            position: { start: { line: 2, column: 1, offset: 0 }, end: { line: 2, column: 14, offset: 13 } }
          }
        ],
        position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 0 } }
      }
    ],
    position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 0 } }
  });
  
  // 创建模拟的适配器工厂
  const createMockAdapterFactory = (): OutputAdapterFactory => {
    // 创建一个只支持已知格式的模拟适配器工厂
    return {
      getAdapter: (format: string): OutputAdapter | null => {
        // 只支持json和xml格式
        if (format === 'json' || format === 'xml') {
          return {
            adapt: (data: any) => {
              return format === 'json' ? JSON.stringify(data) : `<xml>${JSON.stringify(data)}</xml>`;
            }
          };
        }
        return null;
      },
      registerAdapter: vi.fn(),
      hasAdapter: (format: string): boolean => {
        return format === 'json' || format === 'xml';
      }
    };
  };
  
  it('在严格模式下，请求未知格式应抛出错误', () => {
    // 创建转换器和模拟适配器工厂
    const adapterFactory = createMockAdapterFactory();
    const transformer = new DefaultTransformer({
      adapterFactory
    });
    
    // 配置为严格模式并请求未知格式
    const options: TransformOptions = {
      mode: 'strict',
      format: 'unknown-format'
    };
    
    // 转换应该抛出错误
    expect(() => transformer.transform(createTestDocument(), options)).toThrow(/unknown-format/i);
  });
  
  it('在宽松模式下，请求未知格式应回退到默认格式', () => {
    // 创建模拟的适配器工厂的间谍
    const adapterFactory = createMockAdapterFactory();
    const getAdapterSpy = vi.spyOn(adapterFactory, 'getAdapter');
    
    // 创建转换器
    const transformer = new DefaultTransformer({
      adapterFactory
    });
    
    // 配置为宽松模式并请求未知格式
    const options: TransformOptions = {
      mode: 'loose',
      format: 'unknown-format'
    };
    
    // 执行转换
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证结果不为null（应使用默认适配器）
    expect(result).not.toBeNull();
    
    // 验证警告被记录
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('unknown-format')
    );
    
    // 验证尝试获取未知适配器，然后回退到默认适配器
    expect(getAdapterSpy).toHaveBeenCalledWith('unknown-format');
  });
  
  it('在宽松模式下，未注册任何适配器时应使用内部默认处理', () => {
    // 创建一个空的适配器工厂（不注册任何适配器）
    const emptyAdapterFactory: OutputAdapterFactory = {
      getAdapter: () => null, // 始终返回null，表示没有找到适配器
      registerAdapter: vi.fn(),
      hasAdapter: () => false // 始终返回false，表示没有适配器
    };
    
    // 创建转换器使用空适配器工厂
    const transformer = new DefaultTransformer({
      adapterFactory: emptyAdapterFactory
    });
    
    // 配置为宽松模式并请求任何格式
    const options: TransformOptions = {
      mode: 'loose',
      format: 'any-format'
    };
    
    // 执行转换，应该使用内部默认处理
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证结果是转换后的结构（不会返回null）
    expect(result).not.toBeNull();
    
    // 验证警告被记录
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
  
  it('即使所有访问者都失败，只要不要求输出格式转换，也应返回原始文档', () => {
    // 创建一个总是抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      visitDocument: () => { throw new Error('访问者错误'); }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    
    // 配置为宽松模式但不指定输出格式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 执行转换
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证结果是原始文档
    expect(result).toBeDefined();
    expect(result?.type).toBe(NodeType.DOCUMENT);
    
    // 验证错误被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
  
  it('在异步转换中应该正确处理未知格式', async () => {
    // 创建转换器和模拟适配器工厂
    const adapterFactory = createMockAdapterFactory();
    const transformer = new DefaultTransformer({
      adapterFactory
    });
    
    // 创建一个正常的异步访问者
    const asyncVisitor: TransformerVisitor = {
      name: 'async-visitor',
      visitDocument: async (doc: Document) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { ...doc, processed: true };
      }
    };
    
    transformer.registerVisitor(asyncVisitor);
    
    // 配置为宽松模式并请求未知格式
    const options: TransformOptions = {
      mode: 'loose',
      format: 'unknown-async-format'
    };
    
    // 执行异步转换
    const result = await transformer.transformAsync(createTestDocument(), options);
    
    // 验证结果不为null（应使用默认适配器）
    expect(result).not.toBeNull();
    
    // 验证警告被记录
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('unknown-async-format')
    );
  });
}); 