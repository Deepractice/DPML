import { TransformerVisitor } from '../interfaces/transformerVisitor';
import { TransformContext } from '../interfaces/transformContext';
import { Element, NodeType, Node, Document, Content } from '../../types/node';

/**
 * 特殊元素处理器类型
 * 用于处理特定类型的元素
 */
export type SpecialElementHandler = (
  element: Element, 
  context: TransformContext
) => Element | Promise<Element>;

/**
 * 特殊元素访问者配置选项
 */
export interface SpecialElementVisitorOptions {
  /**
   * 自定义处理器映射
   * 键为元素标签名，值为处理函数
   */
  customHandlers?: Record<string, SpecialElementHandler>;
  
  /**
   * 是否递归处理子元素
   * 默认为true
   */
  processChildren?: boolean;
  
  /**
   * 需要处理的标签列表
   * 如果未提供，则处理所有已知的特殊标签
   */
  targeTags?: string[];
  
  /**
   * 是否启用图片处理
   * 默认为true
   */
  enableImageProcessing?: boolean;
  
  /**
   * 是否启用链接处理
   * 默认为true
   */
  enableLinkProcessing?: boolean;
  
  /**
   * 是否启用代码块处理
   * 默认为true
   */
  enableCodeProcessing?: boolean;
  
  /**
   * 是否启用表格处理
   * 默认为true
   */
  enableTableProcessing?: boolean;
  
  /**
   * 是否启用列表处理
   * 默认为true
   */
  enableListProcessing?: boolean;
  
  /**
   * 是否启用引用块处理
   * 默认为true
   */
  enableQuoteProcessing?: boolean;
  
  /**
   * 是否启用多媒体元素处理
   * 默认为true
   */
  enableMediaProcessing?: boolean;
}

/**
 * 特殊元素访问者
 * 
 * 处理文档中的特殊元素，如图片、链接、代码块、表格、列表等
 */
export class SpecialElementVisitor implements TransformerVisitor {
  /**
   * 访问者名称
   */
  readonly name: string = 'specialElement';
  
  /**
   * 访问者优先级
   */
  priority: number;
  
  /**
   * 配置选项
   */
  private options: SpecialElementVisitorOptions;
  
  /**
   * 内置处理器映射
   */
  private handlers: Record<string, SpecialElementHandler | undefined>;
  
  /**
   * 构造函数
   * @param priority 优先级，默认为15（介于ElementVisitor和UnknownElementVisitor之间）
   * @param options 配置选项
   */
  constructor(
    priority: number = 15,
    options: SpecialElementVisitorOptions = {}
  ) {
    this.priority = priority;
    
    this.options = {
      processChildren: true,
      enableImageProcessing: true,
      enableLinkProcessing: true,
      enableCodeProcessing: true,
      enableTableProcessing: true,
      enableListProcessing: true,
      enableQuoteProcessing: true,
      enableMediaProcessing: true,
      ...options
    };
    
    // 初始化内置处理器
    this.handlers = {
      // 图片元素处理
      'img': this.options.enableImageProcessing 
        ? this.processImageElement.bind(this) 
        : undefined,
      
      // 链接元素处理
      'a': this.options.enableLinkProcessing 
        ? this.processLinkElement.bind(this) 
        : undefined,
      
      // 代码块元素处理
      'code': this.options.enableCodeProcessing 
        ? this.processCodeElement.bind(this) 
        : undefined,
      'pre': this.options.enableCodeProcessing 
        ? this.processPreElement.bind(this) 
        : undefined,
      
      // 表格元素处理
      'table': this.options.enableTableProcessing 
        ? this.processTableElement.bind(this) 
        : undefined,
      
      // 列表元素处理
      'ul': this.options.enableListProcessing 
        ? this.processUnorderedListElement.bind(this) 
        : undefined,
      'ol': this.options.enableListProcessing 
        ? this.processOrderedListElement.bind(this) 
        : undefined,
      
      // 引用块元素处理
      'blockquote': this.options.enableQuoteProcessing 
        ? this.processQuoteElement.bind(this) 
        : undefined,
      
      // 多媒体元素处理
      'video': this.options.enableMediaProcessing 
        ? this.processVideoElement.bind(this) 
        : undefined,
      'audio': this.options.enableMediaProcessing 
        ? this.processAudioElement.bind(this) 
        : undefined,
      'iframe': this.options.enableMediaProcessing 
        ? this.processIframeElement.bind(this) 
        : undefined
    };
    
    // 合并自定义处理器
    if (options.customHandlers) {
      this.handlers = { ...this.handlers, ...options.customHandlers };
    }
    
    // 过滤掉禁用的处理器
    for (const key in this.handlers) {
      if (this.handlers[key] === undefined) {
        delete this.handlers[key];
      }
    }
  }
  
  /**
   * 获取访问者优先级
   * @returns 优先级数值
   */
  getPriority(): number {
    return this.priority;
  }
  
  /**
   * 通用访问方法
   * @param node 要访问的节点
   * @param context 转换上下文
   * @returns 处理后的节点
   */
  visit(node: Node, context: TransformContext): Node {
    if (!node) {
      return node;
    }
    
    if (node.type === NodeType.DOCUMENT) {
      const document = node as Document;
      const result = this.visitDocument(document, context);
      // 由于visitDocument返回Promise<Document>，因此不能直接在同步方法中使用
      // 这里返回原始文档，实际使用应通过visitAsync方法
      return document;
    } else if (node.type === NodeType.ELEMENT) {
      const element = node as Element;
      // 同样，visitElement返回Promise<Element>，因此不能直接在同步方法中使用
      // 返回原始元素，实际使用应通过visitAsync方法
      return element;
    }
    
    // 其他类型节点原样返回
    return node;
  }
  
  /**
   * 异步通用访问方法
   * @param node 要访问的节点
   * @param context 转换上下文
   * @returns 处理后的节点Promise
   */
  async visitAsync(node: Node, context: TransformContext): Promise<Node> {
    if (!node) {
      return node;
    }
    
    if (node.type === NodeType.DOCUMENT) {
      const result = await this.visitDocument(node as Document, context);
      return result as Node;
    } else if (node.type === NodeType.ELEMENT) {
      const result = await this.visitElement(node as Element, context);
      return result as Node;
    }
    
    // 其他类型节点原样返回
    return node;
  }
  
  /**
   * 访问文档节点
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 处理后的文档节点
   */
  async visitDocument(document: Document, context: TransformContext): Promise<Document> {
    // 文档节点自身不需处理，但需递归处理其子节点
    if (document.children && document.children.length > 0) {
      for (let i = 0; i < document.children.length; i++) {
        const child = document.children[i];
        document.children[i] = await this.visitAsync(child, context);
      }
    }
    
    return document;
  }
  
  /**
   * 访问元素节点
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 处理后的元素节点
   */
  async visitElement(element: Element, context: TransformContext): Promise<Element> {
    // 递归处理子元素（如果启用）
    if (this.options.processChildren && element.children) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        if (child.type === NodeType.ELEMENT) {
          element.children[i] = await this.visitElement(child as Element, context);
        }
      }
    }
    
    // 处理特殊元素
    const handler = this.handlers[element.tagName];
    
    if (handler) {
      try {
        const result = handler(element, context);
        
        if (result instanceof Promise) {
          return await result;
        }
        
        return result;
      } catch (error) {
        console.error(`Error processing element ${element.tagName}:`, error);
      }
    }
    
    return element;
  }
  
  /**
   * 处理图片元素
   * @param element 图片元素
   * @returns 处理后的元素
   * @private
   */
  private processImageElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取和解析图片属性
    const src = element.attributes.src || '';
    const alt = element.attributes.alt || '';
    
    // 提取尺寸信息
    const width = parseFloat(element.attributes.width || '0');
    const height = parseFloat(element.attributes.height || '0');
    
    // 创建元数据
    const dimensions = (!isNaN(width) && !isNaN(height)) 
      ? { width, height } 
      : undefined;
    
    return {
      ...element,
      meta: {
        ...meta,
        isImage: true,
        imagePath: src,
        description: alt,
        ...(dimensions && { dimensions })
      }
    };
  }
  
  /**
   * 处理链接元素
   * @param element 链接元素
   * @returns 处理后的元素
   * @private
   */
  private processLinkElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取链接属性
    const href = element.attributes.href || '';
    const target = element.attributes.target || '';
    const title = element.attributes.title || '';
    
    // 提取链接文本
    let linkText = '';
    
    if (element.children && element.children.length > 0) {
      // 获取第一个内容节点的文本
      const contentNode = element.children.find(child => child.type === NodeType.CONTENT) as Content;
      
      if (contentNode) {
        linkText = contentNode.value;
      }
    }
    
    // 判断是否为外部链接
    const isExternal = href.startsWith('http:') || 
                       href.startsWith('https:') || 
                       href.startsWith('//') ||
                       target === '_blank';
    
    return {
      ...element,
      meta: {
        ...meta,
        isLink: true,
        url: href,
        linkText,
        title,
        isExternal
      }
    };
  }
  
  /**
   * 处理代码元素
   * @param element 代码元素
   * @returns 处理后的元素
   * @private
   */
  private processCodeElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取代码属性
    const language = element.attributes.language || '';
    const highlight = element.attributes.highlight === 'true';
    
    // 提取代码内容
    let code = '';
    
    if (element.children && element.children.length > 0) {
      // 获取第一个内容节点的文本
      const contentNode = element.children.find(child => child.type === NodeType.CONTENT) as Content;
      
      if (contentNode) {
        code = contentNode.value;
      }
    }
    
    return {
      ...element,
      meta: {
        ...meta,
        isCode: true,
        language,
        code,
        highlight
      }
    };
  }
  
  /**
   * 处理pre元素（预格式化文本）
   * @param element pre元素
   * @returns 处理后的元素
   * @private
   */
  private processPreElement(element: Element, context: TransformContext): Element {
    // 查找内部的code元素
    if (element.children && element.children.length > 0) {
      const codeElement = element.children.find(
        child => child.type === NodeType.ELEMENT && (child as Element).tagName === 'code'
      ) as Element;
      
      if (codeElement) {
        // 用处理后的code元素替换原始code元素
        const processedCode = this.processCodeElement(codeElement, context);
        
        for (let i = 0; i < element.children.length; i++) {
          if (element.children[i] === codeElement) {
            element.children[i] = processedCode;
            break;
          }
        }
        
        // 继承code元素的元数据
        const meta = element.meta || {};
        
        return {
          ...element,
          meta: {
            ...meta,
            ...processedCode.meta
          }
        };
      }
    }
    
    // 如果没有找到code元素，将整个pre元素当作代码处理
    const meta = element.meta || {};
    
    // 提取代码内容
    let code = '';
    
    if (element.children && element.children.length > 0) {
      // 收集所有内容节点的文本
      code = this.extractTextContent(element);
    }
    
    return {
      ...element,
      meta: {
        ...meta,
        isCode: true,
        language: element.attributes.language || '',
        code
      }
    };
  }
  
  /**
   * 处理表格元素
   * @param element 表格元素
   * @returns 处理后的元素
   * @private
   */
  private processTableElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取表格数据
    const tableData = this.extractTableData(element);
    
    return {
      ...element,
      meta: {
        ...meta,
        isTable: true,
        tableData
      }
    };
  }
  
  /**
   * 处理无序列表元素
   * @param element 无序列表元素
   * @returns 处理后的元素
   * @private
   */
  private processUnorderedListElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取列表项数据
    const items = this.extractListItems(element);
    
    return {
      ...element,
      meta: {
        ...meta,
        isList: true,
        listType: 'unordered',
        items
      }
    };
  }
  
  /**
   * 处理有序列表元素
   * @param element 有序列表元素
   * @returns 处理后的元素
   * @private
   */
  private processOrderedListElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取列表项数据
    const items = this.extractListItems(element);
    
    // 提取起始编号
    const startAttr = element.attributes.start || '1';
    const startNumber = parseInt(startAttr, 10);
    
    return {
      ...element,
      meta: {
        ...meta,
        isList: true,
        listType: 'ordered',
        items,
        startNumber: isNaN(startNumber) ? 1 : startNumber
      }
    };
  }
  
  /**
   * 处理引用块元素
   * @param element 引用块元素
   * @returns 处理后的元素
   * @private
   */
  private processQuoteElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取引用属性
    const cite = element.attributes.cite || '';
    const author = element.attributes.author || '';
    
    // 提取引用内容
    const content = this.extractTextContent(element);
    
    return {
      ...element,
      meta: {
        ...meta,
        isQuote: true,
        source: cite,
        author,
        content
      }
    };
  }
  
  /**
   * 处理视频元素
   * @param element 视频元素
   * @returns 处理后的元素
   * @private
   */
  private processVideoElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取视频属性
    const src = element.attributes.src || '';
    const width = parseFloat(element.attributes.width || '0');
    const height = parseFloat(element.attributes.height || '0');
    const controls = element.attributes.controls === 'true' || element.attributes.controls === '';
    const autoplay = element.attributes.autoplay === 'true';
    
    // 创建元数据
    const dimensions = (!isNaN(width) && !isNaN(height)) 
      ? { width, height } 
      : undefined;
    
    return {
      ...element,
      meta: {
        ...meta,
        isMedia: true,
        mediaType: 'video',
        src,
        ...(dimensions && { dimensions }),
        controls,
        autoplay
      }
    };
  }
  
  /**
   * 处理音频元素
   * @param element 音频元素
   * @returns 处理后的元素
   * @private
   */
  private processAudioElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取音频属性
    const src = element.attributes.src || '';
    const controls = element.attributes.controls === 'true' || element.attributes.controls === '';
    const autoplay = element.attributes.autoplay === 'true';
    
    return {
      ...element,
      meta: {
        ...meta,
        isMedia: true,
        mediaType: 'audio',
        src,
        controls,
        autoplay
      }
    };
  }
  
  /**
   * 处理iframe元素
   * @param element iframe元素
   * @returns 处理后的元素
   * @private
   */
  private processIframeElement(element: Element, context: TransformContext): Element {
    const meta = element.meta || {};
    
    // 提取iframe属性
    const src = element.attributes.src || '';
    const width = parseFloat(element.attributes.width || '0');
    const height = parseFloat(element.attributes.height || '0');
    
    // 创建元数据
    const dimensions = (!isNaN(width) && !isNaN(height)) 
      ? { width, height } 
      : undefined;
    
    return {
      ...element,
      meta: {
        ...meta,
        isMedia: true,
        mediaType: 'iframe',
        src,
        ...(dimensions && { dimensions })
      }
    };
  }
  
  /**
   * 提取元素的文本内容（包括子元素的内容）
   * @param element 元素
   * @returns 文本内容
   * @private
   */
  private extractTextContent(element: Element): string {
    if (!element.children || element.children.length === 0) {
      return '';
    }
    
    const textParts: string[] = [];
    
    const extractText = (node: Node) => {
      if (node.type === NodeType.CONTENT) {
        textParts.push((node as Content).value);
      } else if (node.type === NodeType.ELEMENT) {
        const elem = node as Element;
        
        // 如果是段落元素，则添加换行符（但前一个元素也是段落，则不重复添加）
        if (elem.tagName === 'p' && textParts.length > 0 && !textParts[textParts.length - 1].endsWith('\n')) {
          textParts.push('\n');
        }
        
        // 递归处理子元素
        if (elem.children) {
          elem.children.forEach(extractText);
        }
        
        // 段落结束后也添加换行符（如果内容不为空且没有以换行符结尾）
        if (elem.tagName === 'p' && textParts.length > 0 && !textParts[textParts.length - 1].endsWith('\n')) {
          textParts.push('\n');
        }
      }
    };
    
    element.children.forEach(extractText);
    
    // 清理多余的换行符
    return textParts.join('').replace(/\n+/g, '\n').trim();
  }
  
  /**
   * 提取表格数据
   * @param tableElement 表格元素
   * @returns 表格数据，二维数组
   * @private
   */
  private extractTableData(tableElement: Element): string[][] {
    const result: string[][] = [];
    
    if (!tableElement.children) {
      return result;
    }
    
    // 查找表头和表体
    const thead = tableElement.children.find(
      child => child.type === NodeType.ELEMENT && (child as Element).tagName === 'thead'
    ) as Element;
    
    const tbody = tableElement.children.find(
      child => child.type === NodeType.ELEMENT && (child as Element).tagName === 'tbody'
    ) as Element;
    
    // 如果找不到表头或表体，尝试直接处理表格行
    if (!thead && !tbody) {
      // 查找所有表格行
      const rows = tableElement.children.filter(
        child => child.type === NodeType.ELEMENT && (child as Element).tagName === 'tr'
      ) as Element[];
      
      rows.forEach(row => {
        result.push(this.extractRowData(row));
      });
      
      return result;
    }
    
    // 处理表头行
    if (thead && thead.children) {
      const headerRows = thead.children.filter(
        child => child.type === NodeType.ELEMENT && (child as Element).tagName === 'tr'
      ) as Element[];
      
      headerRows.forEach(row => {
        result.push(this.extractRowData(row));
      });
    }
    
    // 处理表体行
    if (tbody && tbody.children) {
      const bodyRows = tbody.children.filter(
        child => child.type === NodeType.ELEMENT && (child as Element).tagName === 'tr'
      ) as Element[];
      
      bodyRows.forEach(row => {
        result.push(this.extractRowData(row));
      });
    }
    
    return result;
  }
  
  /**
   * 提取表格行数据
   * @param rowElement 表格行元素
   * @returns 行数据，字符串数组
   * @private
   */
  private extractRowData(rowElement: Element): string[] {
    const result: string[] = [];
    
    if (!rowElement.children) {
      return result;
    }
    
    // 查找所有单元格（包括表头单元格和数据单元格）
    const cells = rowElement.children.filter(
      child => child.type === NodeType.ELEMENT && 
        ((child as Element).tagName === 'td' || (child as Element).tagName === 'th')
    ) as Element[];
    
    cells.forEach(cell => {
      result.push(this.extractTextContent(cell));
    });
    
    return result;
  }
  
  /**
   * 提取列表项数据
   * @param listElement 列表元素（ul或ol）
   * @returns 列表项数据，字符串数组
   * @private
   */
  private extractListItems(listElement: Element): string[] {
    const result: string[] = [];
    
    if (!listElement.children) {
      return result;
    }
    
    // 查找所有列表项
    const items = listElement.children.filter(
      child => child.type === NodeType.ELEMENT && (child as Element).tagName === 'li'
    ) as Element[];
    
    items.forEach(item => {
      result.push(this.extractTextContent(item));
    });
    
    return result;
  }
} 