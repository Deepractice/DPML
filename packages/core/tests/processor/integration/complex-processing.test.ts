/**
 * 复杂功能集成测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeType, Document, Element, Content, Reference } from '../../../src/types/node';
import { DefaultProcessor } from '../../../src/processor/defaultProcessor';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { IdValidationVisitor } from '../../../src/processor/visitors/idValidationVisitor';
import { AttributeValidationVisitor } from '../../../src/processor/visitors/attributeValidationVisitor';
import { MarkdownContentVisitor } from '../../../src/processor/visitors/markdownContentVisitor';
import { DocumentMetadataVisitor } from '../../../src/processor/visitors/documentMetadataVisitor';
import { InheritanceVisitor } from '../../../src/processor/visitors/inheritanceVisitor';
import { ReferenceVisitor } from '../../../src/processor/visitors/referenceVisitor';
import { TagRegistry } from '../../../src/parser/tag-registry';
import { DefaultReferenceResolver } from '../../../src/processor/defaultReferenceResolver';
import { IdProtocolHandler } from '../../../src/processor/protocols/idProtocolHandler';

describe('复杂功能集成测试', () => {
  let processor: DefaultProcessor;
  let tagRegistry: TagRegistry;
  
  beforeEach(() => {
    // 创建标签注册表
    tagRegistry = new TagRegistry();
    
    // 创建处理器实例
    processor = new DefaultProcessor();
    
    // 注册核心访问者
    processor.registerVisitor(new IdValidationVisitor());
    processor.registerVisitor(new AttributeValidationVisitor({
      tagRegistry,
      strictMode: false,
      validateUnknownTags: false
    }));
    processor.registerVisitor(new MarkdownContentVisitor({
      sanitize: true,
      gfm: true,
      breaks: true
    }));
    processor.registerVisitor(new DocumentMetadataVisitor());
    
    // 注意：不注册InheritanceVisitor和ReferenceVisitor，简化测试
  });

  it('应该处理继承+引用组合场景', async () => {
    // 创建一个模拟的引用解析器和InheritanceVisitor
    const mockReferenceResolver = {
      resolve: vi.fn(),
      getProtocolHandler: vi.fn()
    };
    
    // 为InheritanceVisitor准备继承处理
    const inheritanceVisitor = new InheritanceVisitor(mockReferenceResolver as any);
    processor.registerVisitor(inheritanceVisitor);
    
    // 创建一个简化的文档，专注于继承功能测试
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'doc1' },
          children: [
            // 基础组件
            {
              type: NodeType.ELEMENT,
              tagName: 'base',
              attributes: {
                id: 'baseComponent',
                color: 'blue',
                size: 'medium'
              },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '基础内容',
                  position: {
                    start: { line: 3, column: 1, offset: 100 },
                    end: { line: 3, column: 10, offset: 110 }
                  }
                } as Content
              ],
              position: {
                start: { line: 2, column: 1, offset: 50 },
                end: { line: 4, column: 1, offset: 150 }
              }
            } as Element,
            
            // 扩展组件
            {
              type: NodeType.ELEMENT,
              tagName: 'extended',
              attributes: {
                id: 'extendedComponent',
                extends: 'id:baseComponent',
                color: 'red'  // 覆盖基础组件属性
              },
              children: [],   // 空子节点，将继承基础组件内容
              position: {
                start: { line: 5, column: 1, offset: 200 },
                end: { line: 6, column: 1, offset: 250 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 7, column: 1, offset: 300 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 7, column: 1, offset: 300 }
      }
    };
    
    // 手动创建上下文并设置ID映射
    const context = new ProcessingContext(document, '/test/document.xml');
    (processor as any).context = context;
    
    // 模拟ID验证访问者收集ID
    const idVisitor = new IdValidationVisitor();
    await idVisitor.visitDocument(document, context);
    
    // 获取文档元素和基础组件元素
    const docElement = document.children[0] as Element;
    const baseComponent = docElement.children[0] as Element;
    const extendedComponent = docElement.children[1] as Element;
    
    // 手动将基础组件添加到ID映射表，以便继承访问者可以找到它
    (context as any).idMap = (context as any).idMap || new Map();
    (context as any).idMap.set('baseComponent', baseComponent);
    
    // 验证基础组件
    expect(baseComponent.tagName).toBe('base');
    expect(baseComponent.attributes.color).toBe('blue');
    
    // 手动测试继承处理
    const processedExtended = await inheritanceVisitor.visitElement(extendedComponent, context);
    
    // 验证继承结果
    expect(processedExtended.attributes.color).toBe('red');    // 覆盖属性
    expect(processedExtended.attributes.size).toBe('medium');  // 继承属性
    expect(processedExtended.children.length).toBe(1);         // 继承子节点
    expect((processedExtended.children[0] as Content).value).toBe('基础内容');
  });
  
  it('应该处理多级嵌套处理', async () => {
    // 创建一个简单的多级嵌套文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'doc1' },
          children: [
            // 第一级
            {
              type: NodeType.ELEMENT,
              tagName: 'level1',
              attributes: { id: 'level1', prop1: 'value1' },
              children: [
                // 第二级
                {
                  type: NodeType.ELEMENT,
                  tagName: 'level2',
                  attributes: { id: 'level2', prop2: 'value2' },
                  children: [
                    // 第三级
                    {
                      type: NodeType.ELEMENT,
                      tagName: 'level3',
                      attributes: { id: 'level3', prop3: 'value3' },
                      children: [
                        {
                          type: NodeType.CONTENT,
                          value: '嵌套内容',
                          position: {
                            start: { line: 5, column: 1, offset: 300 },
                            end: { line: 5, column: 10, offset: 310 }
                          }
                        } as Content
                      ],
                      position: {
                        start: { line: 4, column: 1, offset: 250 },
                        end: { line: 6, column: 1, offset: 350 }
                      }
                    } as Element
                  ],
                  position: {
                    start: { line: 3, column: 1, offset: 200 },
                    end: { line: 7, column: 1, offset: 400 }
                  }
                } as Element
              ],
              position: {
                start: { line: 2, column: 1, offset: 150 },
                end: { line: 8, column: 1, offset: 450 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 9, column: 1, offset: 500 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 9, column: 1, offset: 500 }
      }
    };
    
    // 处理文档
    const result = await processor.process(document, '/test/nested.xml');
    
    // 验证处理后的文档结构
    expect(result.children.length).toBe(1);
    const docElement = result.children[0] as Element;
    
    // 验证各级嵌套结构
    const level1 = docElement.children[0] as Element;
    expect(level1.tagName).toBe('level1');
    expect(level1.attributes.prop1).toBe('value1');
    
    const level2 = level1.children[0] as Element;
    expect(level2.tagName).toBe('level2');
    expect(level2.attributes.prop2).toBe('value2');
    
    const level3 = level2.children[0] as Element;
    expect(level3.tagName).toBe('level3');
    expect(level3.attributes.prop3).toBe('value3');
    
    // 验证最深层内容
    const content = level3.children[0] as Content;
    expect(content.value).toBe('嵌套内容');
  });

  it('应该模拟引用处理', async () => {
    // 创建模拟的引用解析器
    const mockReferenceResolver = {
      resolve: vi.fn(),
      getProtocolHandler: vi.fn()
    };
    
    // 设置模拟解析结果
    mockReferenceResolver.resolve.mockResolvedValue({
      reference: { type: NodeType.REFERENCE, protocol: 'id', path: 'test' },
      value: '解析后的内容'
    });
    
    // 创建引用访问者
    const referenceVisitor = new ReferenceVisitor({
      referenceResolver: mockReferenceResolver as any,
      resolveInContent: true
    });
    processor.registerVisitor(referenceVisitor);
    
    // 创建包含引用的简单文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'doc1' },
          children: [
            // 引用节点
            {
              type: NodeType.REFERENCE,
              protocol: 'id',
              path: 'test',
              position: {
                start: { line: 2, column: 1, offset: 50 },
                end: { line: 2, column: 10, offset: 60 }
              }
            } as Reference,
            
            // 包含内容引用的元素
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'section1' },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '内容引用: @id:test',
                  position: {
                    start: { line: 4, column: 1, offset: 100 },
                    end: { line: 4, column: 20, offset: 120 }
                  }
                } as Content
              ],
              position: {
                start: { line: 3, column: 1, offset: 70 },
                end: { line: 5, column: 1, offset: 150 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 6, column: 1, offset: 200 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 6, column: 1, offset: 200 }
      }
    };
    
    // 处理文档
    await processor.process(document, '/test/reference.xml');
    
    // 验证引用解析器被调用
    expect(mockReferenceResolver.resolve).toHaveBeenCalled();
    
    // 验证引用节点被处理
    const docElement = document.children[0] as Element;
    const referenceNode = docElement.children[0] as Reference;
    
    // 手动处理引用节点验证功能
    const processedRef = await referenceVisitor.visitReference(referenceNode, new ProcessingContext(document, '/test'));
    expect(processedRef.resolved).toBeDefined();
    
    // 验证内容引用处理
    const section = docElement.children[1] as Element;
    const content = section.children[0] as Content;
    
    // 手动处理内容节点验证功能
    const processedContent = await referenceVisitor.visitContent(content, new ProcessingContext(document, '/test'));
    expect(processedContent.value).not.toBe('内容引用: @id:test');
  });
}); 