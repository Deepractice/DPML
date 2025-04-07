import { describe, it, expect, beforeEach } from 'vitest';
import { NodeType, Document, Element, SourcePosition } from '../../../src/types/node';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { 
  DocumentMetadataVisitor, 
  DocumentMode,
  DocumentMetadata 
} from '../../../src/processor/visitors/documentMetadataVisitor';

describe('DocumentMetadataVisitor', () => {
  let visitor: DocumentMetadataVisitor;
  let context: ProcessingContext;
  let document: Document;
  const mockPosition: SourcePosition = {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 }
  };

  beforeEach(() => {
    // 创建基础文档
    document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: mockPosition
    };
    
    // 创建处理上下文
    context = new ProcessingContext(document, '/test/path');
    
    // 创建访问者
    visitor = new DocumentMetadataVisitor();
  });

  it('应该收集文档元数据', async () => {
    // 创建带有元数据的根元素
    const rootElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'dpml',
      attributes: {
        lang: 'zh-CN',
        schema: 'test-schema',
        version: '1.0.0'
      },
      children: [],
      position: mockPosition
    };
    
    // 添加到文档
    document.children = [rootElement];
    
    // 访问文档
    await visitor.visitDocument(document, context);
    
    // 验证元数据被收集
    const metadata = context.variables.metadata as DocumentMetadata;
    expect(metadata).toBeDefined();
    expect(metadata.lang).toBe('zh-CN');
    expect(metadata.schema).toBe('test-schema');
    expect(metadata.version).toBe('1.0.0');
    // 默认模式是 LOOSE
    expect(metadata.mode).toBe(DocumentMode.LOOSE);
  });
  
  it('应该处理mode属性', async () => {
    // 测试严格模式
    const strictElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'dpml',
      attributes: {
        mode: 'strict'
      },
      children: [],
      position: mockPosition
    };
    
    document.children = [strictElement];
    await visitor.visitDocument(document, context);
    
    expect(context.variables.metadata.mode).toBe(DocumentMode.STRICT);
    
    // 测试宽松模式
    const looseElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'dpml',
      attributes: {
        mode: 'loose'
      },
      children: [],
      position: mockPosition
    };
    
    document.children = [looseElement];
    await visitor.visitDocument(document, context);
    
    expect(context.variables.metadata.mode).toBe(DocumentMode.LOOSE);
    
    // 测试无效模式（应默认为宽松模式）
    const invalidElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'dpml',
      attributes: {
        mode: 'invalid'
      },
      children: [],
      position: mockPosition
    };
    
    document.children = [invalidElement];
    await visitor.visitDocument(document, context);
    
    expect(context.variables.metadata.mode).toBe(DocumentMode.LOOSE);
  });
  
  it('应该记录lang属性', async () => {
    // 测试中文
    const zhElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'dpml',
      attributes: {
        lang: 'zh-CN'
      },
      children: [],
      position: mockPosition
    };
    
    document.children = [zhElement];
    await visitor.visitDocument(document, context);
    
    expect(context.variables.metadata.lang).toBe('zh-CN');
    
    // 测试英文
    const enElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'dpml',
      attributes: {
        lang: 'en-US'
      },
      children: [],
      position: mockPosition
    };
    
    document.children = [enElement];
    await visitor.visitDocument(document, context);
    
    expect(context.variables.metadata.lang).toBe('en-US');
  });
  
  it('应该处理schema属性', async () => {
    const schemaElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'dpml',
      attributes: {
        schema: 'test-schema'
      },
      children: [],
      position: mockPosition
    };
    
    document.children = [schemaElement];
    await visitor.visitDocument(document, context);
    
    expect(context.variables.metadata.schema).toBe('test-schema');
  });
  
  it('没有根元素时应使用默认元数据', async () => {
    // 空文档
    document.children = [];
    
    // 访问文档
    await visitor.visitDocument(document, context);
    
    // 验证使用默认元数据
    const metadata = context.variables.metadata as DocumentMetadata;
    expect(metadata).toBeDefined();
    expect(metadata.mode).toBe(DocumentMode.LOOSE);
    expect(metadata.lang).toBeUndefined();
    expect(metadata.schema).toBeUndefined();
    expect(metadata.version).toBeUndefined();
  });
  
  it('应该使用配置的默认模式', async () => {
    // 创建使用严格模式默认值的访问者
    const strictVisitor = new DocumentMetadataVisitor({
      defaultMode: DocumentMode.STRICT
    });
    
    // 空文档
    document.children = [];
    
    // 访问文档
    await strictVisitor.visitDocument(document, context);
    
    // 验证使用严格模式
    expect(context.variables.metadata.mode).toBe(DocumentMode.STRICT);
    
    // 当没有指定模式时，也应使用默认的严格模式
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'dpml',
      attributes: {},
      children: [],
      position: mockPosition
    };
    
    document.children = [element];
    await strictVisitor.visitDocument(document, context);
    
    expect(context.variables.metadata.mode).toBe(DocumentMode.STRICT);
  });
});
