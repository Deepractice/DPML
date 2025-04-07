import { describe, it, expect } from 'vitest';
import { NoopVisitor } from '../../../src/transformer/visitors/noopVisitor';
import { NodeType } from '../../../src/types/node';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';

describe('NoopVisitor', () => {
  // 创建一个模拟上下文
  const createMockContext = (): TransformContext => {
    return {
      output: null,
      document: { type: NodeType.DOCUMENT, children: [] } as any,
      options: { visitors: [] },
      variables: {},
      path: [],
      parentResults: []
    } as TransformContext;
  };
  
  it('应该实现BaseVisitor接口', () => {
    const visitor = new NoopVisitor();
    
    // 验证基本属性
    expect(visitor.name).toBe('noop');
    expect(visitor.getPriority()).toBe(0);
  });
  
  it('应该在所有visit方法中返回原始节点', () => {
    const visitor = new NoopVisitor();
    
    // 模拟上下文
    const context = createMockContext();
    
    // 测试各节点类型
    const documentNode = { type: NodeType.DOCUMENT, children: [] };
    const elementNode = { type: NodeType.ELEMENT, tagName: 'test', attributes: {}, children: [] };
    const contentNode = { type: NodeType.CONTENT, value: 'test' };
    const referenceNode = { type: NodeType.REFERENCE, protocol: 'test', path: 'target' };
    
    // 执行各类型节点的访问方法
    const docResult = visitor.visitDocument(documentNode as any, context);
    const elemResult = visitor.visitElement(elementNode as any, context);
    const contentResult = visitor.visitContent(contentNode as any, context);
    const refResult = visitor.visitReference(referenceNode as any, context);
    
    // 验证返回的是原始节点
    expect(docResult).toBe(documentNode);
    expect(elemResult).toBe(elementNode);
    expect(contentResult).toBe(contentNode);
    expect(refResult).toBe(referenceNode);
  });
  
  it('通用visit方法应该返回原始节点', () => {
    const visitor = new NoopVisitor();
    
    // 模拟上下文
    const context = createMockContext();
    
    // 测试各节点类型
    const documentNode = { type: NodeType.DOCUMENT, children: [] };
    const elementNode = { type: NodeType.ELEMENT, tagName: 'test', attributes: {}, children: [] };
    const contentNode = { type: NodeType.CONTENT, value: 'test' };
    const referenceNode = { type: NodeType.REFERENCE, protocol: 'test', path: 'target' };
    
    // 执行通用visit方法
    const docResult = visitor.visit(documentNode, context);
    const elemResult = visitor.visit(elementNode, context);
    const contentResult = visitor.visit(contentNode, context);
    const refResult = visitor.visit(referenceNode, context);
    
    // 验证返回的是原始节点
    expect(docResult).toBe(documentNode);
    expect(elemResult).toBe(elementNode);
    expect(contentResult).toBe(contentNode);
    expect(refResult).toBe(referenceNode);
  });
  
  it('异步访问方法应该返回原始节点', async () => {
    const visitor = new NoopVisitor();
    
    // 模拟上下文
    const context = createMockContext();
    
    // 测试节点
    const documentNode = { type: NodeType.DOCUMENT, children: [] };
    
    // 执行异步visit方法
    const result = await visitor.visitAsync(documentNode, context);
    
    // 验证返回的是原始节点
    expect(result).toBe(documentNode);
  });
}); 