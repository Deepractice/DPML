import { describe, it, expect, beforeEach } from 'vitest';

import { ContextManager } from '../../../transformer/context/contextManager';
import {
  ElementVisitor,
  ElementVisitorOptions,
} from '../../../transformer/visitors/elementVisitor';
import { NodeType } from '../../../types/node';

import type { ProcessedDocument } from '../../../processor/interfaces/processor';
import type { TransformContext } from '../../../transformer/interfaces/transformContext';
import type { Element } from '../../../types/node';

describe('ElementVisitor', () => {
  let visitor: ElementVisitor;
  let contextManager: ContextManager;

  // 创建测试上下文
  const createContext = (document: ProcessedDocument): TransformContext => {
    return contextManager.createRootContext(document, {
      visitors: [],
    });
  };

  beforeEach(() => {
    visitor = new ElementVisitor();
    contextManager = new ContextManager();
  });

  it('应该具有正确的名称和默认优先级', () => {
    expect(visitor.name).toBe('element');
    expect(visitor.getPriority()).toBe(20); // 优先级为20
  });

  it('应该正确处理简单元素', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'div',
      attributes: { id: 'test', class: 'container' },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 30 },
      },
    };

    const context = createContext(document);

    // 执行
    const result = await visitor.visitElement(element as Element, context);

    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('type', 'element');
    expect(result).toHaveProperty('tagName', 'div');
    expect(result).toHaveProperty('attributes');
    expect(result.attributes).toHaveProperty('id', 'test');
    expect(result.attributes).toHaveProperty('class', 'container');
  });

  it('应该处理嵌套元素和内容', async () => {
    // 准备
    const contentNode = {
      type: NodeType.CONTENT,
      value: '这是一段文本',
      position: {
        start: { line: 2, column: 3, offset: 10 },
        end: { line: 2, column: 10, offset: 17 },
      },
    };

    const childElement = {
      type: NodeType.ELEMENT,
      tagName: 'span',
      attributes: { class: 'highlight' },
      children: [contentNode],
      position: {
        start: { line: 2, column: 1, offset: 8 },
        end: { line: 2, column: 30, offset: 37 },
      },
    };

    const parentElement = {
      type: NodeType.ELEMENT,
      tagName: 'div',
      attributes: { id: 'container' },
      children: [childElement],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 3, column: 1, offset: 45 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [parentElement],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 4, column: 0, offset: 50 },
      },
    };

    const context = createContext(document);

    // 执行 - 从文档开始访问
    const result = await visitor.visitDocument(document, context);

    // 验证文档结构被保留
    expect(result).not.toBe(null);
    expect(result.children[0]).toHaveProperty('tagName', 'div');

    // 验证嵌套元素被处理
    const processedDiv = result.children[0];

    expect(processedDiv.children[0]).toHaveProperty('tagName', 'span');

    // 验证内容被保留
    const processedSpan = processedDiv.children[0];

    expect(processedSpan.children[0]).toHaveProperty('type', NodeType.CONTENT);
    expect(processedSpan.children[0]).toHaveProperty('value', '这是一段文本');
  });

  it('应该处理元素属性转换', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'img',
      attributes: {
        src: './image.jpg',
        width: '100',
        height: '200',
        loading: 'lazy',
      },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 50, offset: 49 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 60 },
      },
    };

    const context = createContext(document);

    // 配置元素访问者处理数值类型属性
    visitor = new ElementVisitor(20, {
      numericAttributes: ['width', 'height'],
      booleanAttributes: ['loading'],
      convertNumericAttributes: true,
      convertBooleanAttributes: true,
    });

    // 执行
    const result = await visitor.visitElement(element as Element, context);

    // 验证
    expect(result).not.toBe(null);
    expect(result.attributes).toHaveProperty('src', './image.jpg');
    // 数值属性应该被转换为数字
    expect(result.attributes).toHaveProperty('width', 100);
    expect(result.attributes).toHaveProperty('height', 200);
    // 布尔属性处理（这里实际是字符串，所以不会转为布尔值）
    expect(result.attributes).toHaveProperty('loading', 'lazy');
  });

  it('应该处理布尔属性转换', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'input',
      attributes: {
        type: 'checkbox',
        checked: 'true',
        required: 'false',
        disabled: '',
      },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 50, offset: 49 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 60 },
      },
    };

    const context = createContext(document);

    // 配置元素访问者处理布尔属性
    visitor = new ElementVisitor(20, {
      booleanAttributes: ['checked', 'required', 'disabled'],
      convertBooleanAttributes: true,
    });

    // 执行
    const result = await visitor.visitElement(element as Element, context);

    // 验证
    expect(result).not.toBe(null);
    expect(result.attributes).toHaveProperty('type', 'checkbox');
    // 布尔属性应该被转换
    expect(result.attributes).toHaveProperty('checked', true);
    expect(result.attributes).toHaveProperty('required', false);
    // 空属性视为true
    expect(result.attributes).toHaveProperty('disabled', true);
  });

  it('应该支持自定义转换器', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'custom',
      attributes: {
        data: '{"name":"test", "value":123}',
        list: '1,2,3,4,5',
        timestamp: '2023-01-01T12:00:00Z',
      },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 50, offset: 49 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 60 },
      },
    };

    const context = createContext(document);

    // 配置元素访问者使用自定义转换器
    visitor = new ElementVisitor(20, {
      attributeConverters: {
        data: (value: string) => JSON.parse(value),
        list: (value: string) => value.split(',').map(Number),
        timestamp: (value: string) => new Date(value).toISOString(),
      },
    });

    // 执行
    const result = await visitor.visitElement(element as Element, context);

    // 验证
    expect(result).not.toBe(null);
    // data 属性应该被解析为对象
    expect(result.attributes.data).toEqual({ name: 'test', value: 123 });
    // list 属性应该被解析为数组
    expect(result.attributes.list).toEqual([1, 2, 3, 4, 5]);
    // timestamp 属性应该被转换为ISO字符串
    expect(result.attributes.timestamp).toBe('2023-01-01T12:00:00.000Z');
  });

  it('应该处理不同类型的特殊元素', async () => {
    // 准备几种不同类型的特殊元素
    const elements = [
      {
        type: NodeType.ELEMENT,
        tagName: 'code',
        attributes: { language: 'javascript' },
        children: [{ type: NodeType.CONTENT, value: 'const x = 1;' }],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 },
        },
      },
      {
        type: NodeType.ELEMENT,
        tagName: 'link',
        attributes: { href: 'https://example.com', target: '_blank' },
        children: [{ type: NodeType.CONTENT, value: '示例链接' }],
        position: {
          start: { line: 2, column: 1, offset: 20 },
          end: { line: 2, column: 20, offset: 39 },
        },
      },
      {
        type: NodeType.ELEMENT,
        tagName: 'list',
        attributes: { type: 'ordered' },
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'item',
            children: [{ type: NodeType.CONTENT, value: '第一项' }],
          },
          {
            type: NodeType.ELEMENT,
            tagName: 'item',
            children: [{ type: NodeType.CONTENT, value: '第二项' }],
          },
        ],
        position: {
          start: { line: 3, column: 1, offset: 40 },
          end: { line: 3, column: 20, offset: 59 },
        },
      },
    ];

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: elements,
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 4, column: 0, offset: 60 },
      },
    };

    const context = createContext(document);

    // 配置元素访问者处理特殊元素
    visitor = new ElementVisitor(20, {
      specialElements: {
        code: (element: Element, ctx: TransformContext) => {
          return {
            ...element,
            meta: {
              ...element.meta,
              isCode: true,
              language: element.attributes.language,
            },
          };
        },
        link: (element: Element, ctx: TransformContext) => {
          const content = element.children[0]?.value || '';

          return {
            ...element,
            meta: {
              ...element.meta,
              isLink: true,
              url: element.attributes.href,
              text: content,
            },
          };
        },
      },
    });

    // 执行
    const result = await visitor.visitDocument(document, context);

    // 验证
    expect(result).not.toBe(null);

    // 验证code元素处理
    const codeElement = result.children[0];

    expect(codeElement).toHaveProperty('meta');
    expect(codeElement.meta).toHaveProperty('isCode', true);
    expect(codeElement.meta).toHaveProperty('language', 'javascript');

    // 验证link元素处理
    const linkElement = result.children[1];

    expect(linkElement).toHaveProperty('meta');
    expect(linkElement.meta).toHaveProperty('isLink', true);
    expect(linkElement.meta).toHaveProperty('url', 'https://example.com');
    expect(linkElement.meta).toHaveProperty('text', '示例链接');

    // 验证list元素处理 - 没有特殊处理，应该保持原样
    const listElement = result.children[2];

    expect(listElement).toHaveProperty('tagName', 'list');
    expect(listElement.children.length).toBe(2);
  });

  it('应该收集元素元数据', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'section',
      attributes: {
        id: 'intro',
        title: '介绍',
        importance: 'high',
        created: '2023-01-01',
      },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 50, offset: 49 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 60 },
      },
    };

    const context = createContext(document);

    // 配置元素访问者收集元数据
    visitor = new ElementVisitor(20, {
      metadataAttributes: ['title', 'importance', 'created'],
      collectMetadata: true,
    });

    // 执行
    const result = await visitor.visitElement(element as Element, context);

    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('title', '介绍');
    expect(result.meta).toHaveProperty('importance', 'high');
    expect(result.meta).toHaveProperty('created', '2023-01-01');
    // id不应该被收集为元数据
    expect(result.meta).not.toHaveProperty('id');
  });

  it('应该处理元素类名转换', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'div',
      attributes: {
        class: 'container primary large',
      },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 50, offset: 49 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 60 },
      },
    };

    const context = createContext(document);

    // 配置元素访问者处理类名
    visitor = new ElementVisitor(20, {
      processClassNames: true,
    });

    // 执行
    const result = await visitor.visitElement(element as Element, context);

    // 验证
    expect(result).not.toBe(null);
    expect(result.attributes).toHaveProperty(
      'class',
      'container primary large'
    );
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('classNames');
    expect(result.meta.classNames).toEqual(['container', 'primary', 'large']);
  });
});
