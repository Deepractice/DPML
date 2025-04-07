import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReferenceInlineVisitor } from '../../../src/transformer/visitors/referenceInlineVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { NodeType } from '../../../src/types/node';
import { ProcessedDocument } from '../../../src/processor/interfaces/processor';
import { ContextManager } from '../../../src/transformer/context/contextManager';

describe('ReferenceInlineVisitor', () => {
  let visitor: ReferenceInlineVisitor;
  let contextManager: ContextManager;
  
  // 创建测试上下文
  const createContext = (document: ProcessedDocument): TransformContext => {
    return contextManager.createRootContext(document, {
      visitors: []
    });
  };
  
  beforeEach(() => {
    visitor = new ReferenceInlineVisitor();
    contextManager = new ContextManager();
  });
  
  it('应该具有正确的名称和默认优先级', () => {
    expect(visitor.name).toBe('reference-inline');
    expect(visitor.getPriority()).toBe(30); // 假设优先级为30
  });
  
  it('应该处理已解析的引用', () => {
    // 准备
    const resolvedContent = {
      type: 'content',
      value: '这是已解析的内容'
    };
    
    const reference = {
      type: NodeType.REFERENCE,
      protocol: 'test',
      path: 'resolved-content',
      resolved: resolvedContent,
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [reference],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 20 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = visitor.visitReference(reference as any, context);
    
    // 验证
    expect(result).toBe(resolvedContent);
  });
  
  it('应该处理未解析的引用', () => {
    // 准备
    const reference = {
      type: NodeType.REFERENCE,
      protocol: 'test',
      path: 'unresolved-content',
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [reference],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 20 } }
    };
    
    const context = createContext(document);
    
    // 访问器不处理未解析的引用，应该返回原始引用
    const result = visitor.visitReference(reference as any, context);
    expect(result).toBe(reference);
  });
  
  it('应该使用配置的转换模式', () => {
    // 准备配置了clone模式的访问器
    const cloneVisitor = new ReferenceInlineVisitor(30, { mode: 'clone' });
    
    const originalContent = {
      type: 'content', 
      value: '原始内容',
      metadata: { source: 'original' }
    };
    
    const reference = {
      type: NodeType.REFERENCE,
      protocol: 'test',
      path: 'content-to-clone',
      resolved: originalContent,
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [reference],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 20 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = cloneVisitor.visitReference(reference as any, context);
    
    // 验证结果是克隆的而不是引用相同对象
    expect(result).not.toBe(originalContent);
    expect(result).toEqual(originalContent);
    
    // 修改结果不应影响原始内容
    result.value = '修改后的内容';
    expect(originalContent.value).toBe('原始内容');
  });
  
  it('应该递归处理引用内容中的引用', () => {
    // 准备嵌套引用
    const innerContent = {
      type: 'content',
      value: '内部内容'
    };
    
    const innerReference = {
      type: NodeType.REFERENCE,
      protocol: 'test',
      path: 'inner-content',
      resolved: innerContent,
      position: { start: { line: 2, column: 2, offset: 30 }, end: { line: 2, column: 20, offset: 48 } }
    };
    
    const outerReference = {
      type: NodeType.REFERENCE,
      protocol: 'test',
      path: 'outer-content',
      resolved: {
        type: 'element',
        tagName: 'container',
        attributes: {},
        children: [innerReference],
        position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 50 } }
      },
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [outerReference],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 20 } }
    };
    
    const context = createContext(document);
    
    // 添加visitReference的spy
    const visitReferenceSpy = vi.spyOn(visitor, 'visitReference');
    
    // 执行
    const result = visitor.visitReference(outerReference as any, context);
    
    // 验证
    expect(visitReferenceSpy).toHaveBeenCalledTimes(2);
    
    // 验证嵌套引用被处理
    expect(result).toHaveProperty('children');
    expect(result.children[0]).toBe(innerContent);
  });
  
  it('应该为转换后的内容添加来源信息', () => {
    // 准备
    const resolvedContent = {
      type: 'content',
      value: '引用内容'
    };
    
    const reference = {
      type: NodeType.REFERENCE,
      protocol: 'file',
      path: '/example/path.txt',
      resolved: resolvedContent,
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [reference],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 20 } }
    };
    
    // 创建配置了addSourceInfo的访问器
    const sourceVisitor = new ReferenceInlineVisitor(30, { 
      mode: 'reference', 
      addSourceInfo: true 
    });
    
    const context = createContext(document);
    
    // 执行
    const result = sourceVisitor.visitReference(reference as any, context);
    
    // 验证
    expect(result).toBe(resolvedContent);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('source');
    expect(result.meta.source).toHaveProperty('protocol', 'file');
    expect(result.meta.source).toHaveProperty('path', '/example/path.txt');
  });
}); 