import { describe, it, expect } from 'vitest';
import { TransformerVisitor } from '../../transformer/interfaces/transformerVisitor';
import { ProcessedDocument } from '../../processor/interfaces/processor';
import { Element, Content, Reference, NodeType } from '../../types/node';
import { TransformContext } from '../../transformer/interfaces/transformContext';
import { TransformOptions } from '../../transformer/interfaces/transformOptions';

describe('TransformerVisitor', () => {
  // 创建模拟数据
  const mockDocument: ProcessedDocument = {
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  };

  const mockElement: Element = {
    type: NodeType.ELEMENT,
    tagName: 'test',
    attributes: {},
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  };

  const mockContent: Content = {
    type: NodeType.CONTENT,
    value: 'Test content',
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  };

  const mockReference: Reference = {
    type: NodeType.REFERENCE,
    protocol: 'test',
    path: 'reference/path',
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  };

  const mockOptions: TransformOptions = {
    format: 'json'
  };

  const mockContext: TransformContext = {
    output: {},
    document: mockDocument,
    options: mockOptions,
    variables: {},
    path: [],
    parentResults: []
  };

  it('应该能创建具有完整访问方法的访问者', () => {
    const visitor: TransformerVisitor = {
      visitDocument: (document, context) => ({ type: 'document' }),
      visitElement: (element, context) => ({ type: 'element', name: element.tagName }),
      visitContent: (content, context) => ({ type: 'content', value: content.value }),
      visitReference: (reference, context) => ({ type: 'reference', path: reference.path }),
      priority: 100
    };

    expect(visitor.visitDocument).toBeDefined();
    expect(visitor.visitElement).toBeDefined();
    expect(visitor.visitContent).toBeDefined();
    expect(visitor.visitReference).toBeDefined();
    expect(visitor.priority).toBe(100);

    // 测试各方法的返回值
    expect(visitor.visitDocument!(mockDocument, mockContext)).toEqual({ type: 'document' });
    expect(visitor.visitElement!(mockElement, mockContext)).toEqual({ type: 'element', name: 'test' });
    expect(visitor.visitContent!(mockContent, mockContext)).toEqual({ type: 'content', value: 'Test content' });
    expect(visitor.visitReference!(mockReference, mockContext)).toEqual({ type: 'reference', path: 'reference/path' });
  });

  it('应该能创建只关注特定节点类型的访问者', () => {
    const elementVisitor: TransformerVisitor = {
      visitElement: (element, context) => ({ type: 'element', name: element.tagName }),
      priority: 80
    };

    expect(elementVisitor.visitDocument).toBeUndefined();
    expect(elementVisitor.visitElement).toBeDefined();
    expect(elementVisitor.visitContent).toBeUndefined();
    expect(elementVisitor.visitReference).toBeUndefined();
    expect(elementVisitor.priority).toBe(80);

    expect(elementVisitor.visitElement!(mockElement, mockContext)).toEqual({ type: 'element', name: 'test' });
  });

  it('应该能创建不指定优先级的访问者(使用默认优先级)', () => {
    const contentVisitor: TransformerVisitor = {
      visitContent: (content, context) => ({ type: 'content', value: content.value })
    };

    expect(contentVisitor.visitContent).toBeDefined();
    expect(contentVisitor.priority).toBeUndefined();

    expect(contentVisitor.visitContent!(mockContent, mockContext)).toEqual({ type: 'content', value: 'Test content' });
  });

  it('应该能创建修改上下文的访问者', () => {
    const contextModifyingVisitor: TransformerVisitor = {
      visitDocument: (document, context) => {
        context.variables['testVar'] = 'modified';
        return { type: 'document', modified: true };
      }
    };

    const context: TransformContext = {
      output: {},
      document: mockDocument,
      options: mockOptions,
      variables: {},
      path: [],
      parentResults: []
    };

    expect(contextModifyingVisitor.visitDocument!(mockDocument, context)).toEqual({ type: 'document', modified: true });
    expect(context.variables['testVar']).toBe('modified');
  });
}); 