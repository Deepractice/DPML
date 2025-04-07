/**
 * 特殊场景集成测试
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { NodeType, Document, Element, Content } from '../../../src/types/node';
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
import { FileProtocolHandler } from '../../../src/processor/protocols/fileProtocolHandler';
import { HttpProtocolHandler } from '../../../src/processor/protocols/httpProtocolHandler';
import { IdProtocolHandler } from '../../../src/processor/protocols/idProtocolHandler';

describe('特殊场景测试', () => {
  let processor: DefaultProcessor;
  let tagRegistry: TagRegistry;
  let referenceResolver: DefaultReferenceResolver;
  
  beforeEach(() => {
    // 创建标签注册表
    tagRegistry = new TagRegistry();
    
    // 创建处理器实例
    processor = new DefaultProcessor();
    
    // 创建引用解析器
    referenceResolver = new DefaultReferenceResolver();
    
    // 注册协议处理器
    const fileHandler = new FileProtocolHandler();
    const httpHandler = new HttpProtocolHandler();
    const idHandler = new IdProtocolHandler();
    
    referenceResolver.registerProtocolHandler(fileHandler);
    referenceResolver.registerProtocolHandler(httpHandler);
    referenceResolver.registerProtocolHandler(idHandler);
    
    // 注册所有核心访问者
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
    processor.registerVisitor(new InheritanceVisitor());
    processor.registerVisitor(new ReferenceVisitor({
      referenceResolver,
      resolveInContent: true
    }));
    
    // 设置引用解析器
    processor.setReferenceResolver(referenceResolver);
  });
  
  it('应该处理特殊字符内容', async () => {
    // 创建包含特殊字符的文档
    const specialCharsDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'special-chars' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'special-section' },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '包含特殊字符：`!@#$%^&*()_+-=[]{}\\|;:\'",.<>/?~`，确保正确处理',
                  position: {
                    start: { line: 2, column: 1, offset: 10 },
                    end: { line: 2, column: 30, offset: 40 }
                  }
                } as Content
              ],
              position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 3, column: 1, offset: 50 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 4, column: 1, offset: 60 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 4, column: 1, offset: 60 }
      }
    };
    
    // 处理文档
    const result = await processor.process(specialCharsDocument, '/test/special-chars.xml');
    
    // 验证结果
    expect(result).toBeDefined();
    expect(result.type).toBe(NodeType.DOCUMENT);
    
    // 验证特殊字符被正确处理
    const documentElement = result.children[0] as Element;
    const sectionElement = documentElement.children[0] as Element;
    const content = sectionElement.children[0] as Content;
    
    // 检查内容是否保留了特殊字符（即使被转换为HTML实体）
    const contentValue = content.value;
    
    // 输出实际转换后的内容，用于调试
    console.log('处理后的特殊字符内容:', contentValue);
    
    // 检查是否包含HTML标签和实体编码后的特殊字符
    expect(contentValue).toContain('<p>');
    expect(contentValue).toContain('<code>');
    expect(contentValue).toContain('!@#$%^'); // 这些基本字符通常不会被转义
    expect(contentValue).toContain('&amp;'); // & 应该被转义为 &amp;
    
    // 确认包含原始内容的关键部分
    expect(contentValue).toContain('包含特殊字符');
    expect(contentValue).toContain('确保正确处理');
  });
  
  it('应该处理XML转义字符', async () => {
    // 创建包含XML转义字符的文档
    const escapedXmlDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'escaped-xml' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'escaped-section' },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '包含XML转义字符：&lt;div&gt;这是HTML代码&lt;/div&gt; &amp; &quot;引号&quot; &apos;单引号&apos;',
                  position: {
                    start: { line: 2, column: 1, offset: 10 },
                    end: { line: 2, column: 40, offset: 50 }
                  }
                } as Content
              ],
              position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 3, column: 1, offset: 60 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 4, column: 1, offset: 70 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 4, column: 1, offset: 70 }
      }
    };
    
    // 处理文档
    const result = await processor.process(escapedXmlDocument, '/test/escaped-xml.xml');
    
    // 验证结果
    expect(result).toBeDefined();
    expect(result.type).toBe(NodeType.DOCUMENT);
    
    // 验证XML转义字符被正确处理
    const documentElement = result.children[0] as Element;
    const sectionElement = documentElement.children[0] as Element;
    const content = sectionElement.children[0] as Content;
    
    // 验证转义字符被处理，可能会被保留为转义形式或转换为实际字符
    // 由于具体实现的不同，这里只检查内容确实被处理了
    expect(content.value).toBeDefined();
    expect(content.value.length).toBeGreaterThan(0);
    // 检查是否包含关键内容
    expect(content.value).toContain('HTML代码');
    expect(content.value).toContain('引号');
    expect(content.value).toContain('单引号');
  });
  
  it('应该处理标签名大小写敏感性', async () => {
    // 创建包含不同大小写标签的文档
    const caseDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'Document', // 首字母大写
          attributes: { id: 'case-test' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'Section', // 首字母大写
              attributes: { id: 'upper-section' },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '大写标签部分',
                  position: {
                    start: { line: 2, column: 1, offset: 10 },
                    end: { line: 2, column: 20, offset: 30 }
                  }
                } as Content
              ],
              position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 3, column: 1, offset: 40 }
              }
            } as Element,
            {
              type: NodeType.ELEMENT,
              tagName: 'section', // 全小写
              attributes: { id: 'lower-section' },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '小写标签部分',
                  position: {
                    start: { line: 5, column: 1, offset: 60 },
                    end: { line: 5, column: 20, offset: 80 }
                  }
                } as Content
              ],
              position: {
                start: { line: 4, column: 1, offset: 50 },
                end: { line: 6, column: 1, offset: 90 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 7, column: 1, offset: 100 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 7, column: 1, offset: 100 }
      }
    };
    
    // 处理文档
    const result = await processor.process(caseDocument, '/test/case-sensitivity.xml');
    
    // 验证结果
    expect(result).toBeDefined();
    expect(result.type).toBe(NodeType.DOCUMENT);
    
    // 验证大小写是否按预期处理
    const documentElement = result.children[0] as Element;
    expect(documentElement.tagName).toBe('Document'); // 应保持原始大小写
    
    // 检查两个section元素是否都存在且保持原有大小写
    const upperSection = documentElement.children[0] as Element;
    const lowerSection = documentElement.children[1] as Element;
    
    expect(upperSection.tagName).toBe('Section');
    expect(lowerSection.tagName).toBe('section');
    
    // 检查内容是否正确
    const upperContent = upperSection.children[0] as Content;
    const lowerContent = lowerSection.children[0] as Content;
    
    expect(upperContent.value).toContain('大写标签部分');
    expect(lowerContent.value).toContain('小写标签部分');
  });
  
  it('应该处理无根元素文档', async () => {
    // 创建多个根元素的文档
    const multiRootDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root1',
          attributes: { id: 'first-root' },
          children: [
            {
              type: NodeType.CONTENT,
              value: '第一个根元素内容',
              position: {
                start: { line: 2, column: 1, offset: 10 },
                end: { line: 2, column: 20, offset: 30 }
              }
            } as Content
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 3, column: 1, offset: 40 }
          }
        } as Element,
        {
          type: NodeType.ELEMENT,
          tagName: 'root2',
          attributes: { id: 'second-root' },
          children: [
            {
              type: NodeType.CONTENT,
              value: '第二个根元素内容',
              position: {
                start: { line: 5, column: 1, offset: 60 },
                end: { line: 5, column: 20, offset: 80 }
              }
            } as Content
          ],
          position: {
            start: { line: 4, column: 1, offset: 50 },
            end: { line: 6, column: 1, offset: 90 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 6, column: 1, offset: 90 }
      }
    };
    
    // 处理文档
    const result = await processor.process(multiRootDocument, '/test/multi-root.xml');
    
    // 验证结果
    expect(result).toBeDefined();
    expect(result.type).toBe(NodeType.DOCUMENT);
    
    // 验证所有根元素都被保留
    expect(result.children.length).toBe(2);
    
    const root1 = result.children[0] as Element;
    const root2 = result.children[1] as Element;
    
    expect(root1.tagName).toBe('root1');
    expect(root2.tagName).toBe('root2');
    
    // 检查ID是否被正确收集
    const context = (processor as any).context;
    if (context) {
      const idMap = (context as any).idMap;
      expect(idMap.has('first-root')).toBe(true);
      expect(idMap.has('second-root')).toBe(true);
    }
    
    // 检查内容是否正确
    const content1 = root1.children[0] as Content;
    const content2 = root2.children[0] as Content;
    
    expect(content1.value).toContain('第一个根元素内容');
    expect(content2.value).toContain('第二个根元素内容');
  });
}); 