/**
 * MarkdownContentVisitor
 *
 * 用于处理内容节点中的Markdown格式
 */

import { marked } from 'marked';

import type {
  NodeVisitor,
  ProcessingContext,
} from '@core/processor/interfaces';
import type { Content, Node } from '@core/types';

import type { MarkedOptions } from 'marked';

/**
 * MarkdownContentVisitor配置选项
 */
export interface MarkdownContentVisitorOptions {
  /**
   * 是否清除HTML标签
   */
  sanitize?: boolean;
  /**
   * 是否将换行转换为<br>
   */
  breaks?: boolean;
  /**
   * 是否启用GFM（GitHub Flavored Markdown）
   */
  gfm?: boolean;
}

/**
 * 带有Markdown内容的Content节点
 */
export interface ContentWithMarkdown extends Content {
  /** 原始Markdown内容 */
  markdown?: string;
}

/**
 * Markdown内容访问者
 * 处理节点中的Markdown内容，将其转换为HTML
 */
export class MarkdownContentVisitor implements NodeVisitor {
  /**
   * 访问者优先级
   */
  priority = 70;

  /**
   * Markdown选项
   */
  private options: MarkdownContentVisitorOptions;

  /**
   * 需要完全移除的危险标签列表
   */
  private readonly dangerousTags = [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
  ];

  /**
   * 构造函数
   * @param options Markdown选项
   */
  constructor(options: MarkdownContentVisitorOptions = {}) {
    this.options = {
      sanitize: false,
      breaks: false,
      gfm: true,
      ...options,
    };
  }

  /**
   * 处理节点
   * @param node 要处理的节点
   */
  visit(node: Node): void {
    if (node.type === 'Content' && this.hasMarkdown(node as Content)) {
      this.processMarkdown(node as Content);
    }
  }

  /**
   * 处理内容节点
   * @param content 内容节点
   * @param context 处理上下文
   * @returns 处理后的内容节点
   */
  async visitContent(
    content: Content,
    context: ProcessingContext
  ): Promise<ContentWithMarkdown> {
    // 如果内容为空，直接返回
    if (!content.value || typeof content.value !== 'string') {
      return content as ContentWithMarkdown;
    }

    // 检查内容是否包含Markdown
    if (!this.hasMarkdown(content)) {
      return content as ContentWithMarkdown;
    }

    // 保存原始Markdown内容
    const result: ContentWithMarkdown = {
      ...content,
      markdown: content.value,
    };

    try {
      // 处理内容
      let processedContent = content.value;

      // 如果需要清理HTML标签，预处理内容
      if (this.options.sanitize) {
        // 对于script标签特殊处理，先移除
        processedContent = this.sanitizeContent(processedContent);
      } else {
        // 处理HTML标签内的Markdown (仅在非sanitize模式下)
        const htmlTagPattern = /<([a-z][a-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/gi;

        processedContent = processedContent.replace(
          htmlTagPattern,
          (match, tag, innerContent) => {
            // 处理标签内的Markdown内容
            const processedInner = marked.parse(innerContent);
            const innerHtml =
              typeof processedInner === 'string'
                ? processedInner
                : processedInner.toString();
            const cleanedInner = innerHtml
              .trim()
              .replace(/^<p>([\s\S]*)<\/p>$/, '$1');

            return `<${tag}>${cleanedInner}</${tag}>`;
          }
        );
      }

      // 配置marked选项
      const markedOptions: MarkedOptions = {
        breaks: this.options.breaks,
        gfm: this.options.gfm,
      };

      // 创建渲染器
      const renderer = new marked.Renderer();

      markedOptions.renderer = renderer;

      // 设置marked选项
      marked.setOptions(markedOptions);

      // 转换Markdown为HTML
      const html = marked.parse(processedContent);
      const htmlString = typeof html === 'string' ? html : html.toString();

      // 如果需要清理HTML标签，对结果再次处理
      if (this.options.sanitize) {
        result.value = this.sanitizeContent(htmlString);
      } else {
        result.value = htmlString;
      }
    } catch (error) {
      console.warn('Markdown解析错误:', error);

      // 解析失败时返回原始内容，但仍按要求处理sanitize和breaks
      if (this.options.sanitize) {
        result.value = this.sanitizeContent(content.value);
      }
    }

    return result;
  }

  /**
   * 检查节点是否包含Markdown内容
   * @param node Content节点
   * @returns 是否有Markdown内容
   */
  private hasMarkdown(node: Content): boolean {
    if (!node.value) return false;

    // 检查是否包含常见的Markdown语法
    const markdownPatterns = [
      /#{1,6}\s+.+/, // 标题
      /\*\*.+\*\*/, // 粗体
      /\*.+\*/, // 斜体
      /\[.+\]\(.+\)/, // 链接
      /!\[.+\]\(.+\)/, // 图片
      /^\s*[-*+]\s+.+/m, // 无序列表
      /^\s*\d+\.\s+.+/m, // 有序列表
      /```[\s\S]+?```/, // 代码块
      /`[^`]+`/, // 行内代码
      /\|.+\|.+\|/, // 表格
      /^\s*>\s+.+/m, // 引用
    ];

    return markdownPatterns.some(pattern => pattern.test(node.value as string));
  }

  /**
   * 处理Markdown内容
   * @param node Content节点
   */
  private processMarkdown(node: Content): void {
    if (typeof node.value !== 'string') return;

    // 保存原始Markdown内容
    (node as ContentWithMarkdown).markdown = node.value;

    // 如果需要清理HTML标签，预处理内容
    let inputContent = node.value;

    if (this.options.sanitize) {
      // 预处理移除危险标签
      inputContent = this.sanitizeContent(inputContent);
    }

    // 配置marked选项
    const markedOptions: MarkedOptions = {
      breaks: this.options.breaks,
      gfm: this.options.gfm,
    };

    // 创建自定义渲染器
    const renderer = new marked.Renderer();

    markedOptions.renderer = renderer;

    // 设置marked选项
    marked.setOptions(markedOptions);

    try {
      // 处理HTML标签内的Markdown
      let processedContent = inputContent;

      if (!this.options.sanitize) {
        // 特殊处理HTML内的Markdown
        const htmlTagPattern = /<([a-z][a-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/gi;

        processedContent = processedContent.replace(
          htmlTagPattern,
          (match, tag, innerContent) => {
            // 处理标签内的Markdown内容
            const processedInner = marked.parse(innerContent);

            // 确保处理后的内容是字符串
            const innerHtml =
              typeof processedInner === 'string'
                ? processedInner
                : processedInner.toString();

            // 提取处理后内容（去掉可能被添加的<p>和</p>标签）
            const cleanedInner = innerHtml
              .trim()
              .replace(/^<p>([\s\S]*)<\/p>$/, '$1');

            return `<${tag}>${cleanedInner}</${tag}>`;
          }
        );
      }

      // 转换Markdown
      const html = marked.parse(processedContent);

      // 确保HTML是字符串
      let htmlString = typeof html === 'string' ? html : html.toString();

      // 如果需要清理HTML标签
      if (this.options.sanitize) {
        htmlString = this.sanitizeContent(htmlString);
      }

      node.value = htmlString;
    } catch (error) {
      console.warn('Markdown解析错误:', error);
      // 保持原始内容，但仍按要求处理sanitize
      if (this.options.sanitize) {
        node.value = this.sanitizeContent(node.value);
      }
    }
  }

  /**
   * 清理内容中的HTML标签
   * @param content 要清理的内容
   * @returns 清理后的内容
   */
  private sanitizeContent(content: string): string {
    if (!content) return content;

    let result = content;

    // 移除危险标签及其内容（多次应用以确保完全清除嵌套标签）
    const sanitizePass = (text: string): string => {
      let sanitized = text;

      // 对每个危险标签进行处理
      this.dangerousTags.forEach(tag => {
        // 匹配带内容的标签 <script>...</script>
        const fullTagPattern = new RegExp(
          `<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`,
          'gi'
        );

        sanitized = sanitized.replace(fullTagPattern, '');

        // 匹配自闭合标签 <script/>
        const selfClosingPattern = new RegExp(`<${tag}[^>]*\\/>`, 'gi');

        sanitized = sanitized.replace(selfClosingPattern, '');

        // 匹配开始标签 <script>
        const openTagPattern = new RegExp(`<${tag}[^>]*>`, 'gi');

        sanitized = sanitized.replace(openTagPattern, '');

        // 匹配结束标签 </script>
        const closeTagPattern = new RegExp(`</${tag}>`, 'gi');

        sanitized = sanitized.replace(closeTagPattern, '');
      });

      return sanitized;
    };

    // 多次应用清理过程，确保嵌套标签也被处理
    const iterations = 3; // 通常2-3次足够处理大多数嵌套情况

    for (let i = 0; i < iterations; i++) {
      const previousResult = result;

      result = sanitizePass(result);

      // 如果没有变化，说明已经清理干净，可以提前退出
      if (previousResult === result) break;
    }

    // 如果需要将换行转换为<br>
    if (this.options.breaks && result.includes('\n')) {
      result = result.replace(/\n/g, '<br>');
    }

    return result;
  }
}
