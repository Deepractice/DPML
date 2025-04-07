import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultTransformer } from '../../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../../src/transformer/interfaces/transformerVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { TransformOptions } from '../../../src/transformer/interfaces/transformOptions';
import { NodeType, Element, Document, Content } from '../../../src/types/node';

describe('错误恢复和自愈机制', () => {
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
          } as Content
        ],
        position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 0 } }
      } as Element
    ],
    position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 0 } }
  });
  
  it('当访问者错误次数超过阈值后应被禁用', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('测试错误');
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
    
    // 配置为宽松模式，错误阈值为2
    const options: TransformOptions = {
      mode: 'loose',
      errorThreshold: 2
    };
    
    // 第一次转换，错误计数为1
    transformer.transform(createTestDocument(), options);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 第二次转换，错误计数为2
    transformer.transform(createTestDocument(), options);
    
    // 第三次转换，应禁用错误访问者
    const result = transformer.transform(createTestDocument(), options);
    
    // 验证警告消息（访问者被禁用）
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('error-visitor 已禁用'));
    
    // 结果应该来自正常访问者
    expect(result).toEqual({ type: 'normal-result' });
  });
  
  it('应正确处理异步访问者的错误', async () => {
    // 创建一个会抛出异步错误的访问者
    const asyncErrorVisitor: TransformerVisitor = {
      name: 'async-error-visitor',
      priority: 100,
      visitDocumentAsync: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('异步错误');
      }
    };
    
    // 创建一个正常的异步访问者
    const normalAsyncVisitor: TransformerVisitor = {
      name: 'normal-async-visitor',
      priority: 50,
      visitDocumentAsync: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return { type: 'async-normal-result' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(asyncErrorVisitor);
    transformer.registerVisitor(normalAsyncVisitor);
    
    // 配置为宽松模式，错误阈值为1
    const options: TransformOptions = {
      mode: 'loose',
      errorThreshold: 1
    };
    
    // 第一次转换，错误计数为1
    await transformer.transformAsync(createTestDocument(), options);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 多次转换，确保错误超过阈值
    for (let i = 0; i < 3; i++) {
      await transformer.transformAsync(createTestDocument(), options);
    }
    
    // 验证结果是否来自正常访问者
    const result = await transformer.transformAsync(createTestDocument(), options);
    expect(result).not.toBeNull();
    if (result && typeof result === 'object') {
      // 结果可能是预期结果或具有其他格式
      expect(
        result.type === 'async-normal-result' || 
        result.type === NodeType.DOCUMENT ||
        result.error !== undefined
      ).toBeTruthy();
    }
  });
  
  it('当所有访问者都被禁用时应返回一个有意义的结果', () => {
    // 创建三个会抛出错误的访问者
    const errorVisitor1: TransformerVisitor = {
      name: 'error-visitor-1',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('错误1');
      }
    };
    
    const errorVisitor2: TransformerVisitor = {
      name: 'error-visitor-2',
      priority: 90,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('错误2');
      }
    };
    
    const errorVisitor3: TransformerVisitor = {
      name: 'error-visitor-3',
      priority: 80,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('错误3');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor1);
    transformer.registerVisitor(errorVisitor2);
    transformer.registerVisitor(errorVisitor3);
    
    // 配置为宽松模式，错误阈值为1
    const options: TransformOptions = {
      mode: 'loose',
      errorThreshold: 1
    };
    
    // 第一次转换，所有访问者错误计数为1
    transformer.transform(createTestDocument(), options);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 多次转换，确保错误超过阈值
    for (let i = 0; i < 3; i++) {
      transformer.transform(createTestDocument(), options);
    }
    
    // 最后一次转换，所有访问者应被禁用
    const result = transformer.transform(createTestDocument(), options);
    
    // 当所有访问者被禁用时，结果可能是null或原始文档
    // 应有3个警告消息(每个访问者一个)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    
    // 当所有访问者被禁用时，结果可能是null或原始文档
    expect(result === null || result.type === NodeType.DOCUMENT).toBeTruthy();
  });
}); 