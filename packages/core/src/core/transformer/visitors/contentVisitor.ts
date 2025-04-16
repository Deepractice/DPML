import { NodeType } from '../../types/node';

import type {
  ContentFormat,
  ContentLink,
  ContentImage,
  ContentMetaExtensions,
} from './contentTypes';
import type { Content, Document, Element, Node } from '../../types/node';
import type { TransformContext } from '../interfaces/transformContext';
import type { TransformerVisitor } from '../interfaces/transformerVisitor';

/**
 * 内容格式处理函数匹配类型
 */
type FormatMatch = {
  [key: number]: string;
  index: number;
  input: string;
  groups?: {
    [key: string]: string;
  };
};

/**
 * 内容格式处理函数类型
 */
export type ContentFormatProcessor = (
  match: FormatMatch,
  content: Content,
  context: TransformContext
) => ContentFormat;

/**
 * 内容格式处理器配置
 */
export interface ContentFormatHandler {
  /**
   * 正则表达式匹配模式
   */
  pattern: RegExp;

  /**
   * 处理函数
   */
  process: ContentFormatProcessor;
}

/**
 * 内容访问者配置选项
 */
export interface ContentVisitorOptions {
  /**
   * 是否启用Markdown格式化
   * 默认为true
   */
  enableMarkdownFormatting?: boolean;

  /**
   * 是否启用HTML实体解码
   * 默认为true
   */
  decodeHtmlEntities?: boolean;

  /**
   * 自定义格式处理器列表
   */
  customFormatters?: ContentFormatHandler[];
}

/**
 * 内容访问者
 *
 * 处理文档中的内容节点，如文本内容的格式化、链接提取、特殊字符处理等
 */
export class ContentVisitor implements TransformerVisitor {
  /**
   * 访问者名称
   */
  readonly name: string = 'content';

  /**
   * 访问者优先级
   */
  priority: number;

  /**
   * 配置选项
   */
  private options: ContentVisitorOptions;

  /**
   * Markdown格式处理器
   */
  private markdownFormatHandlers: ContentFormatHandler[];

  /**
   * HTML实体映射表
   */
  private htmlEntities: Record<string, string>;

  /**
   * 构造函数
   * @param priority 优先级，默认为30（较高优先级）
   * @param options 配置选项
   */
  constructor(priority: number = 30, options: ContentVisitorOptions = {}) {
    this.priority = priority;

    this.options = {
      enableMarkdownFormatting: true,
      decodeHtmlEntities: true,
      ...options,
    };

    // 初始化Markdown格式处理器
    this.markdownFormatHandlers = [
      // 加粗
      {
        pattern: /\*\*([^*]+)\*\*/g,
        process: (match, content, context) => ({
          type: 'bold',
          text: match[1],
          start: match.index + 2,
          end: match.index + 2 + match[1].length - 1,
        }),
      },
      // 斜体 - 修改正则表达式避免与加粗标记冲突
      {
        pattern: /(?<!\*)\*([^*]+)\*(?!\*)/g,
        process: (match, content, context) => ({
          type: 'italic',
          text: match[1],
          start: match.index + 1,
          end: match.index + 1 + match[1].length - 1,
        }),
      },
      // 行内代码
      {
        pattern: /`([^`]+)`/g,
        process: (match, content, context) => ({
          type: 'code',
          text: match[1],
          start: match.index + 1,
          end: match.index + 1 + match[1].length - 1,
        }),
      },
      // 链接
      {
        pattern: /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
        process: (match, content, context) => ({
          type: 'link',
          text: match[1],
          url: match[2],
          title: match[3],
          start: match.index + 1,
          end: match.index + 1 + match[1].length,
        }),
      },
      // 图片
      {
        pattern: /!\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
        process: (match, content, context) => ({
          type: 'image',
          text: match[1],
          alt: match[1],
          src: match[2],
          title: match[3],
          start: match.index + 2,
          end: match.index + 2 + match[1].length - 1,
        }),
      },
    ];

    // 初始化HTML实体映射表
    this.htmlEntities = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': "'",
      '&nbsp;': ' ',
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™',
      '&mdash;': '—',
      '&ndash;': '–',
      '&lsquo;': "'",
      '&rsquo;': "'",
      '&ldquo;': '"',
      '&rdquo;': '"',
      '&hellip;': '...',
    };
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
      return this.visitDocument(node as Document, context);
    } else if (node.type === NodeType.ELEMENT) {
      return this.visitElement(node as Element, context);
    } else if (node.type === NodeType.CONTENT) {
      return this.visitContent(node as Content, context);
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
      const result = await this.visitDocumentAsync(node as Document, context);

      return result as Node;
    } else if (node.type === NodeType.ELEMENT) {
      const result = await this.visitElementAsync(node as Element, context);

      return result as Node;
    } else if (node.type === NodeType.CONTENT) {
      const result = await this.visitContentAsync(node as Content, context);

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
  visitDocument(document: Document, context: TransformContext): Document {
    // 递归处理子节点
    if (document.children && document.children.length > 0) {
      for (let i = 0; i < document.children.length; i++) {
        document.children[i] = this.visit(document.children[i], context);
      }
    }

    return document;
  }

  /**
   * 异步访问文档节点
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 处理后的文档节点Promise
   */
  async visitDocumentAsync(
    document: Document,
    context: TransformContext
  ): Promise<Document> {
    // 递归处理子节点
    if (document.children && document.children.length > 0) {
      for (let i = 0; i < document.children.length; i++) {
        document.children[i] = await this.visitAsync(
          document.children[i],
          context
        );
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
  visitElement(element: Element, context: TransformContext): Element {
    // 递归处理子节点
    if (element.children && element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        element.children[i] = this.visit(element.children[i], context);
      }
    }

    return element;
  }

  /**
   * 异步访问元素节点
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 处理后的元素节点Promise
   */
  async visitElementAsync(
    element: Element,
    context: TransformContext
  ): Promise<Element> {
    // 递归处理子节点
    if (element.children && element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        element.children[i] = await this.visitAsync(
          element.children[i],
          context
        );
      }
    }

    return element;
  }

  /**
   * 访问内容节点
   * @param content 内容节点
   * @param context 转换上下文
   * @returns 处理后的内容节点
   */
  visitContent(content: Content, context: TransformContext): Content {
    const meta = content.meta || ({} as ContentMetaExtensions);
    const value = content.value || '';

    // 处理空内容
    if (!value.trim()) {
      return {
        ...content,
        meta: {
          ...meta,
          isEmpty: true,
          isProcessed: true,
        },
      };
    }

    // 初始化元数据
    let processedMeta = {
      ...meta,
      isProcessed: true,
    } as ContentMetaExtensions;

    let enableMarkdownFormatting = this.options.enableMarkdownFormatting;
    let decodeHtmlEntities = this.options.decodeHtmlEntities;

    // 检查上下文变量覆盖
    if (context.variables) {
      if (context.variables.enableMarkdownFormatting !== undefined) {
        enableMarkdownFormatting = !!context.variables.enableMarkdownFormatting;
      }

      if (context.variables.decodeHtmlEntities !== undefined) {
        decodeHtmlEntities = !!context.variables.decodeHtmlEntities;
      }
    }

    // 处理Markdown格式
    if (enableMarkdownFormatting) {
      processedMeta = {
        ...processedMeta,
        ...this.processMarkdownFormats(content, context),
      };
    }

    // 处理HTML实体
    if (decodeHtmlEntities) {
      const decodedResult = this.decodeEntities(value);

      if (decodedResult.decoded) {
        processedMeta = {
          ...processedMeta,
          containsEntities: true,
          decodedValue: decodedResult.value,
        } as ContentMetaExtensions;
      }
    }

    // 处理自定义格式
    if (
      this.options.customFormatters &&
      this.options.customFormatters.length > 0
    ) {
      const customFormats = this.processCustomFormats(content, context);

      if (customFormats.length > 0) {
        processedMeta = {
          ...processedMeta,
          customFormats,
        } as ContentMetaExtensions;
      }
    }

    return {
      ...content,
      meta: processedMeta,
    };
  }

  /**
   * 异步访问内容节点
   * @param content 内容节点
   * @param context 转换上下文
   * @returns 处理后的内容节点Promise
   */
  async visitContentAsync(
    content: Content,
    context: TransformContext
  ): Promise<Content> {
    return this.visitContent(content, context);
  }

  /**
   * 处理Markdown格式
   * @param content 内容节点
   * @param context 转换上下文
   * @returns 包含格式信息的元数据
   * @private
   */
  private processMarkdownFormats(
    content: Content,
    context: TransformContext
  ): Record<string, any> {
    const value = content.value || '';
    const formats: ContentFormat[] = [];
    const links: ContentLink[] = [];
    const images: ContentImage[] = [];

    let containsMarkdown = false;
    let containsLinks = false;
    let containsImages = false;

    // 处理所有Markdown格式
    for (const handler of this.markdownFormatHandlers) {
      const pattern = handler.pattern;

      pattern.lastIndex = 0; // 重置正则表达式游标

      let match;

      while ((match = pattern.exec(value)) !== null) {
        const result = handler.process(
          match as unknown as FormatMatch,
          content,
          context
        );

        if (result.type === 'link') {
          containsLinks = true;
          links.push(result as ContentLink);
        } else if (result.type === 'image') {
          containsImages = true;
          images.push(result as ContentImage);
        } else {
          containsMarkdown = true;
          formats.push(result);
        }
      }
    }

    // 构建元数据
    const meta: ContentMetaExtensions = {};

    if (containsMarkdown) {
      meta.containsMarkdown = true;
      meta.formats = formats;
    }

    if (containsLinks) {
      meta.containsLinks = true;
      meta.links = links;
    }

    if (containsImages) {
      meta.containsImages = true;
      meta.images = images;
    }

    return meta;
  }

  /**
   * 处理自定义格式
   * @param content 内容节点
   * @param context 转换上下文
   * @returns 自定义格式列表
   * @private
   */
  private processCustomFormats(
    content: Content,
    context: TransformContext
  ): ContentFormat[] {
    if (
      !this.options.customFormatters ||
      this.options.customFormatters.length === 0
    ) {
      return [];
    }

    const value = content.value || '';
    const formats: ContentFormat[] = [];

    // 处理所有自定义格式
    for (const handler of this.options.customFormatters) {
      const pattern = handler.pattern;

      pattern.lastIndex = 0; // 重置正则表达式游标

      let match;

      while ((match = pattern.exec(value)) !== null) {
        const result = handler.process(
          match as unknown as FormatMatch,
          content,
          context
        );

        formats.push(result);
      }
    }

    return formats;
  }

  /**
   * 解码HTML实体
   * @param value 包含HTML实体的字符串
   * @returns 解码结果，包含是否解码和解码后的值
   * @private
   */
  private decodeEntities(value: string): { decoded: boolean; value: string } {
    if (!value) {
      return { decoded: false, value };
    }

    let hasEntities = false;
    let result = value;

    // 替换所有已知的HTML实体
    for (const entity in this.htmlEntities) {
      if (result.includes(entity)) {
        hasEntities = true;
        result = result.replace(
          new RegExp(entity, 'g'),
          this.htmlEntities[entity]
        );
      }
    }

    // 处理数字HTML实体 (&#123;)
    const numericEntityPattern = /&#(\d+);/g;

    if (numericEntityPattern.test(result)) {
      hasEntities = true;
      result = result.replace(numericEntityPattern, (match, numStr) => {
        const num = parseInt(numStr, 10);

        return String.fromCharCode(num);
      });
    }

    // 处理十六进制HTML实体 (&#x1F4A9;)
    const hexEntityPattern = /&#x([0-9a-f]+);/gi;

    if (hexEntityPattern.test(result)) {
      hasEntities = true;
      result = result.replace(hexEntityPattern, (match, hexStr) => {
        const num = parseInt(hexStr, 16);

        return String.fromCharCode(num);
      });
    }

    return { decoded: hasEntities, value: result };
  }
}
