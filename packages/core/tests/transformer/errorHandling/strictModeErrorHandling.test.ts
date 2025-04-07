import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultTransformer } from '../../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../../src/transformer/interfaces/transformerVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { TransformOptions } from '../../../src/transformer/interfaces/transformOptions';
import { NodeType, Element, Document } from '../../../src/types/node';

describe('严格模式错误处理机制', () => {
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
  
  it('在严格模式下，应立即中断转换并抛出错误', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('文档处理错误');
      }
    };
    
    // 创建一个正常访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      visitDocument: (doc: Document, context: TransformContext) => {
        return { type: 'processed-document' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    transformer.registerVisitor(normalVisitor);
    
    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };
    
    // 转换应该抛出错误
    expect(() => transformer.transform(createTestDocument(), options)).toThrow('文档处理错误');
    
    // 验证正常访问者没有被调用
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
  
  it('在严格模式下，不同类型节点的错误都应该立即中断', () => {
    // 创建一个会在元素节点抛出错误的访问者
    const elementErrorVisitor: TransformerVisitor = {
      name: 'element-error-visitor',
      priority: 100,
      visitElement: (element: Element, context: TransformContext) => {
        throw new Error('元素处理错误');
      }
    };
    
    // 创建一个正常访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      priority: 50,
      visitElement: (element: Element, context: TransformContext) => {
        return { type: 'processed-element' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(elementErrorVisitor);
    transformer.registerVisitor(normalVisitor);
    
    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };
    
    // 转换应该抛出错误
    expect(() => transformer.transform(createTestDocument(), options)).toThrow('元素处理错误');
  });
  
  it('在严格模式下，错误信息应包含详细的上下文', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('自定义错误消息');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    
    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };
    
    // 捕获错误并验证详细信息
    try {
      transformer.transform(createTestDocument(), options);
      // 如果没有抛出错误，使测试失败
      expect(true).toBe(false);
    } catch (error: any) {
      // 错误消息应包含自定义消息
      expect(error.message).toContain('自定义错误消息');
      // 错误消息应包含访问者名称
      expect(error.message).toContain('error-visitor');
      // 错误消息应包含节点类型
      expect(error.message).toContain('document');
      // 错误应该包含访问者信息
      expect(error.visitorInfo).toBeDefined();
      expect(error.visitorInfo.name).toBe('error-visitor');
    }
  });
  
  it('在严格模式下，无论错误阈值设置如何，都应立即抛出错误', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('测试错误阈值');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    
    // 配置为严格模式且设置很高的错误阈值
    const options: TransformOptions = {
      mode: 'strict',
      errorThreshold: 100 // 设置一个很高的错误阈值
    };
    
    // 尽管错误阈值很高，转换仍应该立即抛出错误
    expect(() => transformer.transform(createTestDocument(), options)).toThrow('测试错误阈值');
  });
  
  it('在严格模式下，即使是异步转换也应该抛出错误', async () => {
    // 创建一个会抛出异步错误的访问者
    const asyncErrorVisitor: TransformerVisitor = {
      name: 'async-error-visitor',
      visitDocument: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('异步错误');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(asyncErrorVisitor);
    
    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };
    
    // 异步转换应该抛出错误
    await expect(transformer.transformAsync(createTestDocument(), options)).rejects.toThrow('异步错误');
  });
}); 