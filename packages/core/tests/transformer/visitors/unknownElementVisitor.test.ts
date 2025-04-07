import { describe, it, expect, beforeEach } from 'vitest';
import { UnknownElementVisitor } from '../../../src/transformer/visitors/unknownElementVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { NodeType, Element, Content } from '../../../src/types/node';
import { ProcessedDocument } from '../../../src/processor/interfaces/processor';
import { ContextManager } from '../../../src/transformer/context/contextManager';

describe('UnknownElementVisitor', () => {
  let visitor: UnknownElementVisitor;
  let contextManager: ContextManager;
  
  // 创建测试上下文
  const createContext = (document: ProcessedDocument): TransformContext => {
    return contextManager.createRootContext(document, {
      visitors: []
    });
  };
  
  beforeEach(() => {
    visitor = new UnknownElementVisitor();
    contextManager = new ContextManager();
  });
  
  it('应该具有正确的名称和默认优先级', () => {
    expect(visitor.name).toBe('unknownElement');
    expect(visitor.getPriority()).toBe(10); // 优先级应该低于ElementVisitor
  });
  
  it('应该识别并标记未知元素', async () => {
    // 准备
    const knownTags = ['div', 'span', 'p', 'a', 'img'];
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'unknown-tag',
      attributes: { id: 'test' },
      children: [],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 30 } }
    };
    
    const context = createContext(document);
    
    // 配置访问者
    visitor = new UnknownElementVisitor(10, {
      knownTags,
      markUnknownTags: true
    });
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isUnknown', true);
    expect(result.meta).toHaveProperty('originalTag', 'unknown-tag');
  });
  
  it('应该替换未知元素为通用容器', async () => {
    // 准备
    const knownTags = ['div', 'span', 'p', 'a', 'img'];
    const contentNode: Content = {
      type: NodeType.CONTENT,
      value: '测试内容',
      position: { start: { line: 1, column: 30, offset: 29 }, end: { line: 1, column: 40, offset: 39 } }
    };

    const element = {
      type: NodeType.ELEMENT,
      tagName: 'custom-component',
      attributes: { id: 'test', class: 'container' },
      children: [contentNode],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 50, offset: 49 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 60 } }
    };
    
    const context = createContext(document);
    
    // 配置访问者
    visitor = new UnknownElementVisitor(10, {
      knownTags,
      replaceUnknownTags: true,
      replacementTag: 'div'
    });
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('tagName', 'div'); // 标签应该被替换为div
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('originalTag', 'custom-component');
    expect(result.meta).toHaveProperty('isUnknown', true);
    
    // 原有内容和属性应该保留
    expect(result.attributes).toHaveProperty('id', 'test');
    expect(result.attributes).toHaveProperty('class', 'container');
    expect(result.children[0]).toHaveProperty('value', '测试内容');
  });
  
  it('应该忽略已知元素', async () => {
    // 准备
    const knownTags = ['div', 'span', 'p', 'a', 'img'];
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'div', // 已知标签
      attributes: { id: 'test' },
      children: [],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 30 } }
    };
    
    const context = createContext(document);
    
    // 配置访问者
    visitor = new UnknownElementVisitor(10, {
      knownTags,
      replaceUnknownTags: true,
      markUnknownTags: true
    });
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证 - 不应该被修改
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('tagName', 'div');
    expect(result.meta).toBeUndefined(); // 不应该有meta字段
  });
  
  it('应该处理自定义标签规则', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'custom-tag',
      attributes: { id: 'test' },
      children: [],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 30 } }
    };
    
    const context = createContext(document);
    
    // 配置访问者 - 使用自定义判断规则
    visitor = new UnknownElementVisitor(10, {
      isUnknownTag: (tagName: string) => tagName.includes('-'),
      replaceUnknownTags: true,
      replacementTag: 'unknown'
    });
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('tagName', 'unknown'); // 自定义规则判断为未知标签并替换
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('originalTag', 'custom-tag');
  });
  
  it('应该递归处理嵌套的未知元素', async () => {
    // 准备
    const knownTags = ['div', 'span', 'p'];
    
    const nestedUnknownElement = {
      type: NodeType.ELEMENT,
      tagName: 'unknown-child',
      attributes: {},
      children: [],
      position: { start: { line: 2, column: 3, offset: 25 }, end: { line: 2, column: 30, offset: 52 } }
    };
    
    const parentElement = {
      type: NodeType.ELEMENT,
      tagName: 'unknown-parent',
      attributes: {},
      children: [nestedUnknownElement],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 60 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [parentElement],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 4, column: 0, offset: 70 } }
    };
    
    const context = createContext(document);
    
    // 配置访问者
    visitor = new UnknownElementVisitor(10, {
      knownTags,
      replaceUnknownTags: true,
      replacementTag: 'div'
    });
    
    // 执行 - 从文档开始访问以测试递归处理
    const result = await visitor.visitDocument(document, context);
    
    // 验证
    expect(result).not.toBe(null);
    
    // 父元素应该被替换
    const processedParent = result.children[0];
    expect(processedParent).toHaveProperty('tagName', 'div');
    expect(processedParent.meta).toHaveProperty('originalTag', 'unknown-parent');
    
    // 子元素也应该被替换
    const processedChild = processedParent.children[0];
    expect(processedChild).toHaveProperty('tagName', 'div');
    expect(processedChild.meta).toHaveProperty('originalTag', 'unknown-child');
  });
  
  it('应该支持自定义替换处理器', async () => {
    // 准备
    const contentNode: Content = {
      type: NodeType.CONTENT,
      value: '点击我',
      position: { start: { line: 1, column: 30, offset: 29 }, end: { line: 1, column: 40, offset: 39 } }
    };
    
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'custom-button',
      attributes: { color: 'primary', size: 'large' },
      children: [contentNode],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 50, offset: 49 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 60 } }
    };
    
    const context = createContext(document);
    
    // 配置访问者 - 使用自定义处理器
    visitor = new UnknownElementVisitor(10, {
      knownTags: ['div', 'span', 'p'],
      replaceUnknownTags: true,
      customReplacer: (element: Element) => {
        if (element.tagName === 'custom-button') {
          // 自定义按钮转换为带类名的按钮
          return {
            ...element,
            tagName: 'button',
            attributes: {
              ...element.attributes,
              class: `btn btn-${element.attributes.color || 'default'} btn-${element.attributes.size || 'medium'}`
            },
            meta: {
              ...element.meta,
              isCustomButton: true,
              originalTag: element.tagName
            }
          };
        }
        return null; // 返回null表示使用默认处理
      }
    });
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('tagName', 'button');
    expect(result.attributes).toHaveProperty('class', 'btn btn-primary btn-large');
    expect(result.meta).toHaveProperty('isCustomButton', true);
    expect(result.meta).toHaveProperty('originalTag', 'custom-button');
  });
  
  it('应该保留原始标签但添加警告标记', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'web-component',
      attributes: { id: 'test' },
      children: [],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 30 } }
    };
    
    const context = createContext(document);
    
    // 配置访问者 - 保留原始标签
    visitor = new UnknownElementVisitor(10, {
      knownTags: ['div', 'span', 'p'],
      markUnknownTags: true,
      replaceUnknownTags: false, // 不替换
      addWarning: true // 添加警告
    });
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('tagName', 'web-component'); // 原始标签应该保留
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isUnknown', true);
    expect(result.meta).toHaveProperty('warning', '未知标签: web-component');
  });
}); 