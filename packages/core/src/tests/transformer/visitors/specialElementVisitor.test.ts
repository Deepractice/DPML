import { describe, it, expect, beforeEach } from 'vitest';
import { SpecialElementVisitor } from '../../../transformer/visitors/specialElementVisitor';
import { TransformContext } from '../../../transformer/interfaces/transformContext';
import { NodeType, Element, Content } from '../../../types/node';
import { ProcessedDocument } from '../../../processor/interfaces/processor';
import { ContextManager } from '../../../transformer/context/contextManager';

describe('SpecialElementVisitor', () => {
  let visitor: SpecialElementVisitor;
  let contextManager: ContextManager;
  
  // 创建测试上下文
  const createContext = (document: ProcessedDocument): TransformContext => {
    return contextManager.createRootContext(document, {
      visitors: []
    });
  };
  
  beforeEach(() => {
    visitor = new SpecialElementVisitor();
    contextManager = new ContextManager();
  });
  
  it('应该具有正确的名称和默认优先级', () => {
    expect(visitor.name).toBe('specialElement');
    expect(visitor.getPriority()).toBe(15); // 优先级应该在ElementVisitor和UnknownElementVisitor之间
  });
  
  it('应该处理图片元素', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'img',
      attributes: { 
        src: '/path/to/image.jpg', 
        alt: '示例图片',
        width: '300',
        height: '200'
      },
      children: [],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 50, offset: 49 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 60 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isImage', true);
    expect(result.meta).toHaveProperty('imagePath', '/path/to/image.jpg');
    expect(result.meta).toHaveProperty('description', '示例图片');
    expect(result.meta).toHaveProperty('dimensions', { width: 300, height: 200 });
  });
  
  it('应该处理链接元素', async () => {
    // 准备
    const contentNode: Content = {
      type: NodeType.CONTENT,
      value: '点击这里',
      position: { start: { line: 1, column: 30, offset: 29 }, end: { line: 1, column: 40, offset: 39 } }
    };
    
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'a',
      attributes: { 
        href: 'https://example.com', 
        target: '_blank',
        title: '示例链接'
      },
      children: [contentNode],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 50, offset: 49 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 60 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isLink', true);
    expect(result.meta).toHaveProperty('url', 'https://example.com');
    expect(result.meta).toHaveProperty('linkText', '点击这里');
    expect(result.meta).toHaveProperty('title', '示例链接');
    expect(result.meta).toHaveProperty('isExternal', true);
  });
  
  it('应该处理代码块元素', async () => {
    // 准备
    const contentNode: Content = {
      type: NodeType.CONTENT,
      value: 'const x = 42;',
      position: { start: { line: 1, column: 30, offset: 29 }, end: { line: 1, column: 40, offset: 39 } }
    };
    
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'code',
      attributes: { 
        language: 'javascript', 
        highlight: 'true'
      },
      children: [contentNode],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 50, offset: 49 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 60 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isCode', true);
    expect(result.meta).toHaveProperty('language', 'javascript');
    expect(result.meta).toHaveProperty('code', 'const x = 42;');
    expect(result.meta).toHaveProperty('highlight', true);
  });
  
  it('应该处理表格元素', async () => {
    // 准备一个简单的表格结构
    const cellContent1: Content = {
      type: NodeType.CONTENT,
      value: '名称',
      position: { start: { line: 2, column: 5, offset: 20 }, end: { line: 2, column: 10, offset: 25 } }
    };
    
    const cellContent2: Content = {
      type: NodeType.CONTENT,
      value: '年龄',
      position: { start: { line: 2, column: 15, offset: 30 }, end: { line: 2, column: 20, offset: 35 } }
    };
    
    const cellContent3: Content = {
      type: NodeType.CONTENT,
      value: '张三',
      position: { start: { line: 3, column: 5, offset: 45 }, end: { line: 3, column: 10, offset: 50 } }
    };
    
    const cellContent4: Content = {
      type: NodeType.CONTENT,
      value: '25',
      position: { start: { line: 3, column: 15, offset: 55 }, end: { line: 3, column: 20, offset: 60 } }
    };
    
    const cell1 = {
      type: NodeType.ELEMENT,
      tagName: 'th',
      attributes: {},
      children: [cellContent1],
      position: { start: { line: 2, column: 3, offset: 18 }, end: { line: 2, column: 12, offset: 27 } }
    };
    
    const cell2 = {
      type: NodeType.ELEMENT,
      tagName: 'th',
      attributes: {},
      children: [cellContent2],
      position: { start: { line: 2, column: 13, offset: 28 }, end: { line: 2, column: 22, offset: 37 } }
    };
    
    const cell3 = {
      type: NodeType.ELEMENT,
      tagName: 'td',
      attributes: {},
      children: [cellContent3],
      position: { start: { line: 3, column: 3, offset: 43 }, end: { line: 3, column: 12, offset: 52 } }
    };
    
    const cell4 = {
      type: NodeType.ELEMENT,
      tagName: 'td',
      attributes: {},
      children: [cellContent4],
      position: { start: { line: 3, column: 13, offset: 53 }, end: { line: 3, column: 22, offset: 62 } }
    };
    
    const headerRow = {
      type: NodeType.ELEMENT,
      tagName: 'tr',
      attributes: {},
      children: [cell1, cell2],
      position: { start: { line: 2, column: 1, offset: 16 }, end: { line: 2, column: 24, offset: 39 } }
    };
    
    const dataRow = {
      type: NodeType.ELEMENT,
      tagName: 'tr',
      attributes: {},
      children: [cell3, cell4],
      position: { start: { line: 3, column: 1, offset: 41 }, end: { line: 3, column: 24, offset: 64 } }
    };
    
    const tableHead = {
      type: NodeType.ELEMENT,
      tagName: 'thead',
      attributes: {},
      children: [headerRow],
      position: { start: { line: 1, column: 3, offset: 5 }, end: { line: 2, column: 26, offset: 41 } }
    };
    
    const tableBody = {
      type: NodeType.ELEMENT,
      tagName: 'tbody',
      attributes: {},
      children: [dataRow],
      position: { start: { line: 2, column: 3, offset: 43 }, end: { line: 3, column: 26, offset: 66 } }
    };
    
    const tableElement = {
      type: NodeType.ELEMENT,
      tagName: 'table',
      attributes: { 
        border: '1',
        style: 'width: 100%'
      },
      children: [tableHead, tableBody],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 4, column: 1, offset: 75 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [tableElement],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 5, column: 0, offset: 80 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = await visitor.visitElement(tableElement as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isTable', true);
    
    // 验证提取的表格数据
    expect(result.meta).toHaveProperty('tableData');
    const tableData = result.meta.tableData;
    expect(tableData).toHaveLength(2); // 两行数据
    expect(tableData[0]).toEqual(['名称', '年龄']); // 表头行
    expect(tableData[1]).toEqual(['张三', '25']); // 数据行
  });
  
  it('应该处理列表元素', async () => {
    // 准备一个简单的有序列表
    const item1Content: Content = {
      type: NodeType.CONTENT,
      value: '第一项',
      position: { start: { line: 2, column: 5, offset: 20 }, end: { line: 2, column: 10, offset: 25 } }
    };
    
    const item2Content: Content = {
      type: NodeType.CONTENT,
      value: '第二项',
      position: { start: { line: 3, column: 5, offset: 35 }, end: { line: 3, column: 10, offset: 40 } }
    };
    
    const item3Content: Content = {
      type: NodeType.CONTENT,
      value: '第三项',
      position: { start: { line: 4, column: 5, offset: 50 }, end: { line: 4, column: 10, offset: 55 } }
    };
    
    const item1 = {
      type: NodeType.ELEMENT,
      tagName: 'li',
      attributes: {},
      children: [item1Content],
      position: { start: { line: 2, column: 3, offset: 18 }, end: { line: 2, column: 12, offset: 27 } }
    };
    
    const item2 = {
      type: NodeType.ELEMENT,
      tagName: 'li',
      attributes: {},
      children: [item2Content],
      position: { start: { line: 3, column: 3, offset: 33 }, end: { line: 3, column: 12, offset: 42 } }
    };
    
    const item3 = {
      type: NodeType.ELEMENT,
      tagName: 'li',
      attributes: {},
      children: [item3Content],
      position: { start: { line: 4, column: 3, offset: 48 }, end: { line: 4, column: 12, offset: 57 } }
    };
    
    const listElement = {
      type: NodeType.ELEMENT,
      tagName: 'ol',
      attributes: { 
        start: '1',
        type: 'decimal'
      },
      children: [item1, item2, item3],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 5, column: 1, offset: 65 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [listElement],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 6, column: 0, offset: 70 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = await visitor.visitElement(listElement as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isList', true);
    expect(result.meta).toHaveProperty('listType', 'ordered');
    expect(result.meta).toHaveProperty('startNumber', 1);
    
    // 验证提取的列表项数据
    expect(result.meta).toHaveProperty('items');
    expect(result.meta.items).toHaveLength(3);
    expect(result.meta.items[0]).toBe('第一项');
    expect(result.meta.items[1]).toBe('第二项');
    expect(result.meta.items[2]).toBe('第三项');
  });
  
  it('应该处理引用块元素', async () => {
    // 准备
    const paragraph1: Content = {
      type: NodeType.CONTENT,
      value: '这是一段引用的文字',
      position: { start: { line: 2, column: 5, offset: 20 }, end: { line: 2, column: 15, offset: 30 } }
    };
    
    const paragraph2: Content = {
      type: NodeType.CONTENT,
      value: '这是第二段引用',
      position: { start: { line: 3, column: 5, offset: 40 }, end: { line: 3, column: 15, offset: 50 } }
    };
    
    const p1 = {
      type: NodeType.ELEMENT,
      tagName: 'p',
      attributes: {},
      children: [paragraph1],
      position: { start: { line: 2, column: 3, offset: 18 }, end: { line: 2, column: 17, offset: 32 } }
    };
    
    const p2 = {
      type: NodeType.ELEMENT,
      tagName: 'p',
      attributes: {},
      children: [paragraph2],
      position: { start: { line: 3, column: 3, offset: 38 }, end: { line: 3, column: 17, offset: 52 } }
    };
    
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'blockquote',
      attributes: { 
        cite: 'https://example.com/quote',
        author: '张三'
      },
      children: [p1, p2],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 4, column: 1, offset: 60 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 5, column: 0, offset: 65 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isQuote', true);
    expect(result.meta).toHaveProperty('source', 'https://example.com/quote');
    expect(result.meta).toHaveProperty('author', '张三');
    
    // 验证提取的引用内容
    expect(result.meta).toHaveProperty('content');
    expect(result.meta.content).toBe('这是一段引用的文字\n这是第二段引用');
  });
  
  it('应该处理多媒体元素', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'video',
      attributes: { 
        src: 'https://example.com/video.mp4',
        width: '640',
        height: '360',
        controls: 'true',
        autoplay: 'false'
      },
      children: [],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 50, offset: 49 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 60 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isMedia', true);
    expect(result.meta).toHaveProperty('mediaType', 'video');
    expect(result.meta).toHaveProperty('src', 'https://example.com/video.mp4');
    expect(result.meta).toHaveProperty('dimensions', { width: 640, height: 360 });
    expect(result.meta).toHaveProperty('controls', true);
    expect(result.meta).toHaveProperty('autoplay', false);
  });
  
  it('应该处理自定义类型元素', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'custom',
      attributes: { type: 'special' },
      children: [],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 20, offset: 19 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 2, column: 0, offset: 30 } }
    };
    
    const context = createContext(document);
    
    // 配置访问者使用自定义处理器
    visitor = new SpecialElementVisitor(15, {
      customHandlers: {
        'custom': (element: Element) => {
          return {
            ...element,
            meta: {
              ...element.meta,
              isCustom: true,
              customType: element.attributes.type
            }
          };
        }
      }
    });
    
    // 执行
    const result = await visitor.visitElement(element as Element, context);
    
    // 验证
    expect(result).not.toBe(null);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('isCustom', true);
    expect(result.meta).toHaveProperty('customType', 'special');
  });
  
  it('应该递归处理嵌套特殊元素', async () => {
    // 准备带有嵌套结构的列表元素
    const nestedContentNode: Content = {
      type: NodeType.CONTENT,
      value: '嵌套代码',
      position: { start: { line: 3, column: 10, offset: 45 }, end: { line: 3, column: 15, offset: 50 } }
    };
    
    const nestedCodeElement = {
      type: NodeType.ELEMENT,
      tagName: 'code',
      attributes: { language: 'javascript' },
      children: [nestedContentNode],
      position: { start: { line: 3, column: 5, offset: 40 }, end: { line: 3, column: 20, offset: 55 } }
    };
    
    const itemContent: Content = {
      type: NodeType.CONTENT,
      value: '列表项: ',
      position: { start: { line: 3, column: 3, offset: 35 }, end: { line: 3, column: 8, offset: 40 } }
    };
    
    const listItem = {
      type: NodeType.ELEMENT,
      tagName: 'li',
      attributes: {},
      children: [itemContent, nestedCodeElement],
      position: { start: { line: 3, column: 1, offset: 33 }, end: { line: 3, column: 22, offset: 57 } }
    };
    
    const listElement = {
      type: NodeType.ELEMENT,
      tagName: 'ul',
      attributes: {},
      children: [listItem],
      position: { start: { line: 2, column: 1, offset: 25 }, end: { line: 4, column: 1, offset: 65 } }
    };
    
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [listElement],
      position: { start: { line: 0, column: 0, offset: 0 }, end: { line: 5, column: 0, offset: 70 } }
    };
    
    const context = createContext(document);
    
    // 执行
    const result = await visitor.visitDocument(document, context);
    
    // 验证列表元素
    const processedList = result.children[0];
    expect(processedList).toHaveProperty('meta');
    expect(processedList.meta).toHaveProperty('isList', true);
    expect(processedList.meta).toHaveProperty('listType', 'unordered');
    
    // 验证嵌套代码元素也被处理
    const processedListItem = processedList.children[0];
    const processedCode = processedListItem.children[1];
    expect(processedCode).toHaveProperty('meta');
    expect(processedCode.meta).toHaveProperty('isCode', true);
    expect(processedCode.meta).toHaveProperty('language', 'javascript');
    expect(processedCode.meta).toHaveProperty('code', '嵌套代码');
  });
}); 