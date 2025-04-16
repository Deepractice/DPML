import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultTransformer } from '../../../transformer/defaultTransformer';
import { TransformerVisitor } from '../../../transformer/interfaces/transformerVisitor';
import { TransformContext } from '../../../transformer/interfaces/transformContext';
import { TransformOptions } from '../../../transformer/interfaces/transformOptions';
import { NodeType, Element, Document, Content } from '../../../types/node';

describe('严格模式错误处理机制', () => {
  let consoleErrorSpy: any;
  
  // 在每个测试前初始化控制台间谍
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  // 在每个测试后恢复控制台间谍
  afterEach(() => {
    consoleErrorSpy.mockRestore();
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
          } as Content
        ],
        position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 0 } }
      } as Element
    ],
    position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 0 } }
  });
  
  it('在严格模式下，访问者抛出错误应中断转换流程', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('文档处理错误');
      }
    };
    
    // 创建一个正常访问者，不应该被执行到
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
    
    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };
    
    // 转换应该失败并抛出错误
    expect(() => {
      transformer.transform(createTestDocument(), options);
    }).toThrow('文档处理错误');
    
    // 验证错误不应该被记录到控制台(因为会直接抛出)
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
  
  it('在严格模式下，处理不同类型节点的错误也应中断', () => {
    // 创建一个会在元素节点抛出错误的访问者
    const elementErrorVisitor: TransformerVisitor = {
      name: 'element-error-visitor',
      priority: 100,
      visitElement: (element: Element, context: TransformContext) => {
        throw new Error('元素处理错误');
      }
    };
    
    // 创建一个正常访问者，不应该被执行到
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
    
    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };
    
    // 转换应该失败并抛出错误
    expect(() => {
      transformer.transform(createTestDocument(), options);
    }).toThrow('元素处理错误');
    
    // 验证错误不应该被记录到控制台(因为会直接抛出)
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
  
  it('在严格模式下处理异步错误时应中断执行', async () => {
    // 创建一个会抛出异步错误的访问者
    const asyncErrorVisitor: TransformerVisitor = {
      name: 'async-error-visitor',
      priority: 100,
      visitDocumentAsync: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('异步错误');
      }
    };
    
    // 创建一个正常的异步访问者，不应该被执行到
    const normalAsyncVisitor: TransformerVisitor = {
      name: 'normal-async-visitor',
      priority: 50,
      visitDocumentAsync: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return { type: 'async-result' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(asyncErrorVisitor);
    transformer.registerVisitor(normalAsyncVisitor);
    
    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };
    
    // 异步转换应该失败并抛出错误
    let error: Error | undefined;
    try {
      await transformer.transformAsync(createTestDocument(), options);
    } catch (e) {
      error = e as Error;
    }
    
    // 验证错误是否被抛出
    expect(error).toBeDefined();
    expect(error?.message).toContain('异步错误');
    
    // 验证错误不应该被记录到控制台(因为会直接抛出)
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
}); 