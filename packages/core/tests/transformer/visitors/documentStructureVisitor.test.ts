import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentStructureVisitor } from '../../../src/transformer/visitors/documentStructureVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { NodeType } from '../../../src/types/node';
import { ProcessedDocument } from '../../../src/processor/interfaces/processor';
import { ContextManager } from '../../../src/transformer/context/contextManager';

describe('DocumentStructureVisitor', () => {
  let visitor: DocumentStructureVisitor;
  let contextManager: ContextManager;
  
  // 创建一个测试文档
  const createTestDocument = (): ProcessedDocument => {
    return {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'section',
          attributes: { id: 'section1', title: '第一节' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'paragraph',
              attributes: {},
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '这是第一段内容',
                  position: { start: { line: 3, column: 3, offset: 50 }, end: { line: 3, column: 23, offset: 70 } }
                }
              ],
              position: { start: { line: 2, column: 2, offset: 30 }, end: { line: 4, column: 2, offset: 80 } }
            },
            {
              type: NodeType.ELEMENT,
              tagName: 'paragraph',
              attributes: {},
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '这是第二段内容',
                  position: { start: { line: 6, column: 3, offset: 100 }, end: { line: 6, column: 23, offset: 120 } }
                }
              ],
              position: { start: { line: 5, column: 2, offset: 90 }, end: { line: 7, column: 2, offset: 130 } }
            }
          ],
          position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 8, column: 1, offset: 150 } }
        }
      ],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 9, column: 0, offset: 160 } },
      metadata: {
        title: '测试文档',
        author: '开发者',
        version: '1.0.0'
      }
    };
  };
  
  // 创建测试上下文
  const createContext = (document: ProcessedDocument): TransformContext => {
    return contextManager.createRootContext(document, {
      visitors: []
    });
  };
  
  beforeEach(() => {
    visitor = new DocumentStructureVisitor();
    contextManager = new ContextManager();
  });
  
  it('应该具有正确的名称和默认优先级', () => {
    expect(visitor.name).toBe('document-structure');
    expect(visitor.getPriority()).toBe(10); // 假设默认优先级为10
  });
  
  it('应该将文档转换为包含结构化数据的对象', () => {
    // 准备
    const document = createTestDocument();
    const context = createContext(document);
    
    // 执行
    const result = visitor.visitDocument(document, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('type', 'document');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toEqual({
      title: '测试文档',
      author: '开发者',
      version: '1.0.0'
    });
    
    // 检查是否有内容或sections属性
    expect(result).toHaveProperty('sections');
    expect(Array.isArray(result.sections)).toBe(true);
    expect(result.sections.length).toBe(1);
    
    // 检查section结构
    const section = result.sections[0];
    expect(section).toHaveProperty('id', 'section1');
    expect(section).toHaveProperty('title', '第一节');
    expect(section).toHaveProperty('paragraphs');
    expect(Array.isArray(section.paragraphs)).toBe(true);
    expect(section.paragraphs.length).toBe(2);
    
    // 检查paragraphs
    expect(section.paragraphs[0]).toHaveProperty('content', '这是第一段内容');
    expect(section.paragraphs[1]).toHaveProperty('content', '这是第二段内容');
  });
  
  it('应该处理空文档', () => {
    // 准备
    const emptyDocument: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }
    };
    const context = createContext(emptyDocument);
    
    // 执行
    const result = visitor.visitDocument(emptyDocument, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('type', 'document');
    expect(result).toHaveProperty('sections');
    expect(result.sections).toEqual([]);
  });
  
  it('应该处理具有元数据的文档', () => {
    // 准备
    const docWithMeta: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } },
      metadata: {
        title: '只有元数据的文档',
        createdAt: '2023-08-01',
        tags: ['test', 'metadata']
      }
    };
    const context = createContext(docWithMeta);
    
    // 执行
    const result = visitor.visitDocument(docWithMeta, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toEqual({
      title: '只有元数据的文档',
      createdAt: '2023-08-01',
      tags: ['test', 'metadata']
    });
  });
  
  it('应该处理未知元素类型', () => {
    // 准备
    const docWithUnknownElements: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'unknown-tag',
          attributes: { custom: 'value' },
          children: [
            {
              type: NodeType.CONTENT,
              value: '未知标签内容',
              position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 10, offset: 9 } }
            }
          ],
          position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 2, column: 1, offset: 20 } }
        }
      ],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 3, column: 0, offset: 30 } }
    };
    const context = createContext(docWithUnknownElements);
    
    // 执行
    const result = visitor.visitDocument(docWithUnknownElements, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('elements');
    expect(Array.isArray(result.elements)).toBe(true);
    expect(result.elements.length).toBe(1);
    
    // 检查未知元素的处理方式
    const unknownElement = result.elements[0];
    expect(unknownElement).toHaveProperty('type', 'unknown-tag');
    expect(unknownElement).toHaveProperty('attributes');
    expect(unknownElement.attributes).toEqual({ custom: 'value' });
    expect(unknownElement).toHaveProperty('content', '未知标签内容');
  });
  
  it('应该递归处理嵌套元素', () => {
    // 准备
    const nestedDocument: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'section',
          attributes: { id: 'nested' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'subsection',
              attributes: { id: 'sub1' },
              children: [
                {
                  type: NodeType.ELEMENT,
                  tagName: 'paragraph',
                  attributes: {},
                  children: [
                    {
                      type: NodeType.CONTENT,
                      value: '嵌套内容',
                      position: { start: { line: 3, column: 3, offset: 50 }, end: { line: 3, column: 8, offset: 55 } }
                    }
                  ],
                  position: { start: { line: 2, column: 2, offset: 30 }, end: { line: 4, column: 2, offset: 60 } }
                }
              ],
              position: { start: { line: 1, column: 1, offset: 20 }, end: { line: 5, column: 1, offset: 70 } }
            }
          ],
          position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 6, column: 0, offset: 80 } }
        }
      ],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 7, column: 0, offset: 90 } }
    };
    const context = createContext(nestedDocument);
    
    // 执行
    const result = visitor.visitDocument(nestedDocument, context);
    
    // 验证
    expect(result).toBeDefined();
    expect(result).toHaveProperty('sections');
    expect(result.sections.length).toBe(1);
    
    // 检查嵌套结构
    const section = result.sections[0];
    expect(section).toHaveProperty('id', 'nested');
    expect(section).toHaveProperty('subsections');
    expect(section.subsections.length).toBe(1);
    
    const subsection = section.subsections[0];
    expect(subsection).toHaveProperty('id', 'sub1');
    expect(subsection).toHaveProperty('paragraphs');
    expect(subsection.paragraphs.length).toBe(1);
    expect(subsection.paragraphs[0]).toHaveProperty('content', '嵌套内容');
  });
}); 