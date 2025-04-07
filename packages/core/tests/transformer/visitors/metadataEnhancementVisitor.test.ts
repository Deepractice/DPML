import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataEnhancementVisitor } from '../../../src/transformer/visitors/metadataEnhancementVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { NodeType } from '../../../src/types/node';
import { ProcessedDocument } from '../../../src/processor/interfaces/processor';
import { ContextManager } from '../../../src/transformer/context/contextManager';

describe('MetadataEnhancementVisitor', () => {
  let visitor: MetadataEnhancementVisitor;
  let contextManager: ContextManager;
  
  // 创建测试上下文
  const createContext = (document: ProcessedDocument): TransformContext => {
    return contextManager.createRootContext(document, {
      visitors: []
    });
  };
  
  beforeEach(() => {
    visitor = new MetadataEnhancementVisitor();
    contextManager = new ContextManager();
  });
  
  it('应该具有正确的名称和默认优先级', () => {
    expect(visitor.name).toBe('metadata-enhancement');
    expect(visitor.getPriority()).toBe(20); // 假设优先级为20
  });
  
  it('应该能从文档元数据中提取和增强信息', () => {
    // 准备
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } },
      metadata: {
        title: '测试文档',
        author: '开发者',
        tags: ['test', 'metadata']
      }
    };
    const context = createContext(document);
    
    // 执行
    const result = visitor.visitDocument(document, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('title', '测试文档');
    expect(result.meta).toHaveProperty('author', '开发者');
    expect(result.meta).toHaveProperty('tags');
    expect(result.meta.tags).toEqual(['test', 'metadata']);
    expect(result.meta).toHaveProperty('generatedAt');
    expect(typeof result.meta.generatedAt).toBe('string');
  });
  
  it('应该将文档semantics转换为meta数据', () => {
    // 准备
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } },
      semantics: {
        model: {
          name: 'gpt-4',
          temperature: 0.7
        },
        format: 'json'
      }
    };
    const context = createContext(document);
    
    // 执行
    const result = visitor.visitDocument(document, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('model');
    expect(result.meta.model).toEqual({
      name: 'gpt-4',
      temperature: 0.7
    });
    expect(result.meta).toHaveProperty('outputFormat', 'json');
  });
  
  it('应该合并文档元数据和语义信息', () => {
    // 准备
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } },
      metadata: {
        title: '测试文档',
        version: '1.0'
      },
      semantics: {
        model: 'gpt-4',
        format: 'markdown'
      }
    };
    const context = createContext(document);
    
    // 执行
    const result = visitor.visitDocument(document, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('title', '测试文档');
    expect(result.meta).toHaveProperty('version', '1.0');
    expect(result.meta).toHaveProperty('model', 'gpt-4');
    expect(result.meta).toHaveProperty('outputFormat', 'markdown');
  });
  
  it('应该在已有meta的情况下增强meta', () => {
    // 准备
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } },
      meta: {
        title: '预设标题',
        customField: '自定义值'
      },
      metadata: {
        title: '新标题',
        author: '作者'
      }
    };
    const context = createContext(document);
    
    // 执行
    const result = visitor.visitDocument(document, context);
    
    // 验证 - 新meta应保留customField，但title应被覆盖
    expect(result).toBeDefined();
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('title', '新标题');
    expect(result.meta).toHaveProperty('customField', '自定义值');
    expect(result.meta).toHaveProperty('author', '作者');
  });
  
  it('应该从上下文变量中提取元数据', () => {
    // 准备
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    const context = createContext(document);
    
    // 设置上下文变量
    context.variables['outputFormat'] = 'xml';
    context.variables['language'] = 'zh-CN';
    context.variables['metaTitle'] = '从变量中提取的标题';
    
    // 执行
    const result = visitor.visitDocument(document, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('outputFormat', 'xml');
    expect(result.meta).toHaveProperty('language', 'zh-CN');
    expect(result.meta).toHaveProperty('title', '从变量中提取的标题');
  });
  
  it('应该为元素节点增强元数据', () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'section',
      attributes: {
        id: 'intro',
        title: '引言'
      },
      children: [],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 2, column: 1, offset: 20 } },
      metadata: {
        role: 'introduction',
        order: 1
      }
    };
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 3, column: 0, offset: 30 } }
    };
    const context = createContext(document);
    
    // 执行
    const result = visitor.visitElement(element as any, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toEqual(element); // 元素本身不应被修改，只是增强元数据
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('role', 'introduction');
    expect(result.meta).toHaveProperty('order', 1);
    expect(result.meta).toHaveProperty('id', 'intro');
    expect(result.meta).toHaveProperty('title', '引言');
  });
  
  it('应该递归增强子元素的元数据', () => {
    // 准备
    const paragraph = {
      type: NodeType.ELEMENT,
      tagName: 'paragraph',
      attributes: { style: 'bold' },
      children: [],
      position: { start: { line: 2, column: 2, offset: 10 }, end: { line: 2, column: 20, offset: 28 } }
    };
    const section = {
      type: NodeType.ELEMENT,
      tagName: 'section',
      attributes: { id: 'content' },
      children: [paragraph],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 40 } }
    };
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [section],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 4, column: 0, offset: 50 } }
    };
    const context = createContext(document);
    
    // 执行 - 访问文档，会递归处理子元素
    visitor.visitDocument(document, context);
    
    // 验证
    expect(section).toHaveProperty('meta');
    expect(section.meta).toHaveProperty('id', 'content');
    
    expect(paragraph).toHaveProperty('meta');
    expect(paragraph.meta).toHaveProperty('style', 'bold');
  });
}); 