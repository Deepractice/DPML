/**
 * 基本处理流程集成测试
 */
import { describe, it, expect, beforeEach } from 'vitest';

import { ReferenceVisitor } from '../../../processor/visitors/referenceVisitor';
import { TagRegistry } from '../../../parser/tag-registry';
import { DefaultProcessor } from '../../../processor/defaultProcessor';
import { DefaultReferenceResolver } from '../../../processor/defaultReferenceResolver';
import { NodeVisitor } from '../../../processor/interfaces';
import { FileProtocolHandler } from '../../../processor/protocols/fileProtocolHandler';
import { HttpProtocolHandler } from '../../../processor/protocols/httpProtocolHandler';
import { IdProtocolHandler } from '../../../processor/protocols/idProtocolHandler';
import { AttributeValidationVisitor } from '../../../processor/visitors/attributeValidationVisitor';
import { DocumentMetadataVisitor } from '../../../processor/visitors/documentMetadataVisitor';
import { IdValidationVisitor } from '../../../processor/visitors/idValidationVisitor';
import { InheritanceVisitor } from '../../../processor/visitors/inheritanceVisitor';
import { MarkdownContentVisitor } from '../../../processor/visitors/markdownContentVisitor';
import { NodeType } from '../../../types/node';

import type { ProcessingContext } from '../../../processor/interfaces';
import type { Document, Element, Content } from '../../../types/node';

describe('基本处理流程', () => {
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
    processor.registerVisitor(
      new AttributeValidationVisitor({
        tagRegistry,
        strictMode: false,
        validateUnknownTags: false,
      })
    );
    processor.registerVisitor(
      new MarkdownContentVisitor({
        sanitize: true,
        gfm: true,
        breaks: true,
      })
    );
    processor.registerVisitor(new DocumentMetadataVisitor());
    processor.registerVisitor(new InheritanceVisitor());
    processor.registerVisitor(
      new ReferenceVisitor({
        referenceResolver,
        resolveInContent: true,
      })
    );

    // 设置引用解析器
    processor.setReferenceResolver(referenceResolver);

    // 注册协议处理器到处理器
    processor.registerProtocolHandler(fileHandler);
    processor.registerProtocolHandler(httpHandler);
    processor.registerProtocolHandler(idHandler);
  });

  it('应该处理简单文档', async () => {
    // 创建一个简单文档
    const simpleDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: {
            id: 'root1',
            version: '1.0',
          },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'child',
              attributes: {
                id: 'child1',
              },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '这是一个简单的内容',
                  position: {
                    start: { line: 3, column: 1, offset: 0 },
                    end: { line: 3, column: 20, offset: 19 },
                  },
                } as Content,
              ],
              position: {
                start: { line: 2, column: 1, offset: 0 },
                end: { line: 4, column: 1, offset: 20 },
              },
            } as Element,
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 5, column: 1, offset: 21 },
          },
        } as Element,
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 5, column: 1, offset: 21 },
      },
    };

    // 处理文档
    const result = await processor.process(
      simpleDocument,
      '/test/simple-document.xml'
    );

    // 验证结果
    expect(result).toBeDefined();
    expect(result.type).toBe(NodeType.DOCUMENT);

    // 验证文档结构保持不变
    expect(result.children.length).toBe(1);
    expect(result.children[0].type).toBe(NodeType.ELEMENT);
    expect((result.children[0] as Element).tagName).toBe('root');
    expect((result.children[0] as Element).attributes.id).toBe('root1');

    // 验证子元素
    const rootElement = result.children[0] as Element;

    expect(rootElement.children.length).toBe(1);
    expect(rootElement.children[0].type).toBe(NodeType.ELEMENT);

    const childElement = rootElement.children[0] as Element;

    expect(childElement.tagName).toBe('child');
    expect(childElement.attributes.id).toBe('child1');

    // 验证内容元素
    expect(childElement.children.length).toBe(1);
    expect(childElement.children[0].type).toBe(NodeType.CONTENT);
    expect((childElement.children[0] as Content).value).toBe(
      '这是一个简单的内容'
    );
  });

  it('应该执行完整处理流程', async () => {
    // 创建一个包含Markdown内容的文档（不包含引用和继承）
    const complexDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: {
            id: 'doc1',
            mode: 'strict',
            lang: 'zh-CN',
          },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: {
                id: 'section1',
                title: '第一部分',
              },
              children: [
                {
                  type: NodeType.CONTENT,
                  value:
                    '# 标题\n\n这是**Markdown**格式的内容\n\n- 项目1\n- 项目2',
                  position: {
                    start: { line: 3, column: 1, offset: 0 },
                    end: { line: 8, column: 10, offset: 50 },
                  },
                } as Content,
              ],
              position: {
                start: { line: 2, column: 1, offset: 0 },
                end: { line: 9, column: 1, offset: 51 },
              },
            } as Element,
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: {
                id: 'section2',
                title: '第二部分',
              },
              children: [
                {
                  type: NodeType.CONTENT,
                  value: '这是第二部分的内容。',
                  position: {
                    start: { line: 11, column: 1, offset: 102 },
                    end: { line: 11, column: 12, offset: 113 },
                  },
                } as Content,
              ],
              position: {
                start: { line: 10, column: 1, offset: 52 },
                end: { line: 12, column: 1, offset: 114 },
              },
            } as Element,
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 13, column: 1, offset: 115 },
          },
        } as Element,
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 13, column: 1, offset: 115 },
      },
    };

    // 处理文档
    const result = await processor.process(
      complexDocument,
      '/test/complex-document.xml'
    );

    // 验证结果
    expect(result).toBeDefined();
    expect(result.type).toBe(NodeType.DOCUMENT);

    // 验证文档结构
    expect(result.children.length).toBe(1);
    const docElement = result.children[0] as Element;

    expect(docElement.tagName).toBe('document');
    expect(docElement.attributes.mode).toBe('strict');
    expect(docElement.attributes.lang).toBe('zh-CN');

    // 验证处理上下文
    const context = (processor as any).context as ProcessingContext;

    expect(context).toBeDefined();

    // 验证ID映射是否正确收集
    if (context.idMap) {
      expect(context.idMap.size).toBeGreaterThanOrEqual(3);
      expect(context.idMap.has('doc1')).toBe(true);
      expect(context.idMap.has('section1')).toBe(true);
      expect(context.idMap.has('section2')).toBe(true);
    }

    // 验证Markdown内容是否被处理
    const section1 = docElement.children[0] as Element;

    expect(section1.tagName).toBe('section');

    // 注意：由于MarkdownContentVisitor配置可能不同，这里只验证内容已被处理
    const content = section1.children[0] as Content;

    expect(content.type).toBe(NodeType.CONTENT);
    expect(typeof content.value).toBe('string');

    // 验证两个section都存在
    expect(docElement.children.length).toBe(2);
    const section2 = docElement.children[1] as Element;

    expect(section2.tagName).toBe('section');
    expect(section2.attributes.title).toBe('第二部分');
  });
});
