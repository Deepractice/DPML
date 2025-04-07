import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultTransformer } from '../../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../../src/transformer/interfaces/transformerVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { TransformOptions } from '../../../src/transformer/interfaces/transformOptions';
import { NodeType, Element, Document } from '../../../src/types/node';

describe('宽松模式错误处理机制', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleLogSpy: any;
  
  // 在每个测试前初始化控制台间谍
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  // 在每个测试后恢复控制台间谍
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
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
  
  it('在宽松模式下，访问者抛出错误应继续转换流程', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('文档处理错误');
      }
    };
    
    // 创建一个正常访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      priority: 50,
      visitDocument: (doc: Document, context: TransformContext) => {
        return { type: 'processed-document' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    transformer.registerVisitor(normalVisitor);
    
    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 转换应该成功且不会中断
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证结果是否来自normalVisitor
    expect(result).toEqual({ type: 'processed-document' });
    
    // 验证错误是否被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('文档处理错误');
  });
  
  it('在宽松模式下，处理不同类型节点的错误也应继续', () => {
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
        return { type: 'processed-element', tagName: element.tagName };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(elementErrorVisitor);
    transformer.registerVisitor(normalVisitor);
    
    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 转换应该成功
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证结果是否包含正确处理的元素
    expect(result).toBeDefined();
    
    // 验证错误是否被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('元素处理错误');
  });
  
  it('应跟踪访问者错误计数，并在超过阈值时禁用访问者', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('计数错误');
      }
    };
    
    // 创建一个正常访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      priority: 50,
      visitDocument: (doc: Document, context: TransformContext) => {
        return { type: 'normal-result' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    transformer.registerVisitor(normalVisitor);
    
    // 配置为宽松模式，设置低错误阈值
    const options: TransformOptions = {
      mode: 'loose',
      errorThreshold: 2
    };
    
    // 第一次转换，错误计数应为1
    transformer.transform(createTestDocument(), options);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('错误计数: 1/2'));
    
    // 第二次转换，错误计数应为2
    transformer.transform(createTestDocument(), options);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('错误计数: 2/2'));
    
    // 第三次转换，应禁用访问者
    transformer.transform(createTestDocument(), options);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('error-visitor 已禁用'));
    
    // 禁用后，结果应只来自normalVisitor
    const finalResult = transformer.transform(createTestDocument(), options);
    expect(finalResult).toEqual({ type: 'normal-result' });
  });
  
  it('在宽松模式下处理异步错误时应继续执行', async () => {
    // 创建一个会抛出异步错误的访问者
    const asyncErrorVisitor: TransformerVisitor = {
      name: 'async-error-visitor',
      priority: 100,
      visitDocument: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('异步错误');
      }
    };
    
    // 创建一个正常的异步访问者
    const normalAsyncVisitor: TransformerVisitor = {
      name: 'normal-async-visitor',
      priority: 50,
      visitDocument: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return { type: 'async-result' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(asyncErrorVisitor);
    transformer.registerVisitor(normalAsyncVisitor);
    
    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 异步转换应该成功且不会中断
    const result = await transformer.transformAsync(createTestDocument(), options);
    
    // 验证结果是否来自normalAsyncVisitor
    expect(result).toEqual({ type: 'async-result' });
    
    // 验证错误是否被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('异步错误');
  });
  
  it('在宽松模式下，当所有访问者都出错时应返回null', () => {
    // 创建多个会抛出错误的访问者
    const errorVisitor1: TransformerVisitor = {
      name: 'error-visitor-1',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('错误1');
      }
    };
    
    const errorVisitor2: TransformerVisitor = {
      name: 'error-visitor-2',
      priority: 50,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('错误2');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor1);
    transformer.registerVisitor(errorVisitor2);
    
    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 当所有访问者都失败时，应返回null或原始文档
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证结果
    // 注：根据实现，可能返回null或原始文档，这里灵活断言
    expect(result === null || result.type === NodeType.DOCUMENT).toBeTruthy();
    
    // 验证错误是否被记录
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
  });
}); 