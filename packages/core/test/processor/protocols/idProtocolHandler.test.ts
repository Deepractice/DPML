/**
 * IdProtocolHandler测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reference, NodeType, Element, Document } from '../../../src/types/node';
import { IdProtocolHandler } from '../../../src/processor/protocols/idProtocolHandler';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { ReferenceError } from '../../../src/errors/types';

describe('IdProtocolHandler', () => {
  let handler: IdProtocolHandler;
  let mockContext: ProcessingContext;
  let mockIdMap: Map<string, Element>;
  
  // 创建测试引用对象的辅助函数
  const createReference = (id: string): Reference => ({
    type: NodeType.REFERENCE,
    protocol: 'id',
    path: id,
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  });
  
  // 创建元素对象的辅助函数
  const createElement = (id: string): Element => ({
    type: NodeType.ELEMENT,
    tagName: 'test',
    attributes: { id },
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  });
  
  beforeEach(() => {
    // 创建模拟上下文
    mockIdMap = new Map<string, Element>();
    
    // 创建一个mock文档
    const mockDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };
    
    mockContext = new ProcessingContext(mockDocument, '/test/path');
    
    // 使用Object.defineProperty设置idMap
    Object.defineProperty(mockContext, 'idMap', {
      value: mockIdMap,
      writable: true
    });
    
    // 创建处理器实例
    handler = new IdProtocolHandler();
  });
  
  it('应该正确识别支持的协议', () => {
    expect(handler.canHandle('id')).toBe(true);
    expect(handler.canHandle('http')).toBe(false);
    expect(handler.canHandle('https')).toBe(false);
    expect(handler.canHandle('file')).toBe(false);
    expect(handler.canHandle('')).toBe(false);
  });
  
  it('应该在没有设置上下文时抛出错误', async () => {
    const reference = createReference('test-id');
    
    await expect(handler.handle(reference)).rejects.toThrow('ID协议处理器未设置上下文');
  });
  
  it('应该在处理上下文中没有ID映射时抛出错误', async () => {
    const reference = createReference('test-id');
    
    // 设置上下文但不包含idMap
    handler.setContext({
      processingContext: {} as ProcessingContext
    });
    
    await expect(handler.handle(reference)).rejects.toThrow('处理上下文中未初始化ID映射');
  });
  
  it('应该正确处理存在的ID引用', async () => {
    const reference = createReference('test-id');
    const element = createElement('test-id');
    
    // 添加元素到ID映射
    mockIdMap.set('test-id', element);
    
    // 设置处理上下文
    handler.setContext({
      processingContext: mockContext
    });
    
    const result = await handler.handle(reference);
    
    expect(result).toBe(element);
  });
  
  it('应该在找不到元素时抛出ReferenceError', async () => {
    const reference = createReference('non-existent-id');
    
    // 设置处理上下文
    handler.setContext({
      processingContext: mockContext
    });
    
    // 断言抛出指定的错误
    await expect(handler.handle(reference)).rejects.toThrow(ReferenceError);
    await expect(handler.handle(reference)).rejects.toThrow('找不到ID为"non-existent-id"的元素');
  });
  
  it('应该在处理引用时使用当前已设置的上下文', async () => {
    const reference = createReference('test-id');
    const element = createElement('test-id');
    
    // 添加元素到ID映射
    mockIdMap.set('test-id', element);
    
    // 设置处理上下文
    handler.setContext({
      processingContext: mockContext
    });
    
    // 处理引用
    const result = await handler.handle(reference);
    
    expect(result).toBe(element);
    
    // 更改上下文
    const newElement = createElement('test-id-new');
    mockIdMap.clear();
    mockIdMap.set('test-id', newElement);
    
    // 再次处理同一引用
    const newResult = await handler.handle(reference);
    
    // 应该使用最新的上下文
    expect(newResult).toBe(newElement);
  });
  
  it('应该可以多次设置上下文', () => {
    const context1 = { processingContext: {} as ProcessingContext };
    const context2 = { processingContext: {} as ProcessingContext };
    
    handler.setContext(context1);
    expect((handler as any).context).toBe(context1);
    
    handler.setContext(context2);
    expect((handler as any).context).toBe(context2);
  });
}); 