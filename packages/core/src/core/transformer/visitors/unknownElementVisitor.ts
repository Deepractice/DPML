import { NodeType } from '../../types/node';

import type { Element, Node, Document } from '../../types/node';
import type { TransformContext } from '../interfaces/transformContext';
import type { TransformerVisitor } from '../interfaces/transformerVisitor';

/**
 * 自定义未知标签判断函数类型
 */
export type UnknownTagPredicate = (tagName: string) => boolean;

/**
 * 自定义未知标签替换处理器类型
 */
export type UnknownTagReplacer = (
  element: Element,
  context: TransformContext
) => Element | null;

/**
 * 未知元素访问者配置选项
 */
export interface UnknownElementVisitorOptions {
  /**
   * 已知标签名列表
   * 任何不在此列表中的标签将被视为未知标签
   */
  knownTags?: string[];

  /**
   * 自定义判断函数，用于确定一个标签是否为未知标签
   * 如果提供此函数，它将覆盖knownTags列表的判断逻辑
   */
  isUnknownTag?: UnknownTagPredicate;

  /**
   * 是否标记未知标签（在meta中添加标记）
   * 默认为true
   */
  markUnknownTags?: boolean;

  /**
   * 是否替换未知标签为通用标签
   * 默认为false
   */
  replaceUnknownTags?: boolean;

  /**
   * 替换未知标签时使用的标签名
   * 默认为'div'
   */
  replacementTag?: string;

  /**
   * 自定义替换处理器
   * 允许针对特定标签提供自定义替换逻辑
   * 如果函数返回null，则使用默认替换逻辑
   */
  customReplacer?: UnknownTagReplacer;

  /**
   * 是否为未知标签添加警告信息
   * 默认为false
   */
  addWarning?: boolean;
}

/**
 * 未知元素访问者
 *
 * 处理文档中的未知元素标签，可以标记、替换或添加警告信息
 */
export class UnknownElementVisitor implements TransformerVisitor {
  /**
   * 访问者名称
   */
  readonly name: string = 'unknownElement';

  /**
   * 访问者优先级
   */
  priority: number;

  /**
   * 配置选项
   */
  private options: UnknownElementVisitorOptions;

  /**
   * 构造函数
   * @param priority 优先级，默认为10（比ElementVisitor的优先级低）
   * @param options 配置选项
   */
  constructor(
    priority: number = 10,
    options: UnknownElementVisitorOptions = {}
  ) {
    this.priority = priority;
    this.options = {
      knownTags: [],
      markUnknownTags: true,
      replaceUnknownTags: false,
      replacementTag: 'div',
      addWarning: false,
      ...options,
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
      return node; // 返回原始节点而不是null
    }

    if (node.type === NodeType.DOCUMENT) {
      return this.visitDocument(node as Document, context);
    } else if (node.type === NodeType.ELEMENT) {
      return this.visitElement(node as Element, context);
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
    return this.visit(node, context);
  }

  /**
   * 访问文档节点
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 处理后的文档节点
   */
  visitDocument(document: Document, context: TransformContext): Document {
    // 文档节点自身不需处理，但需递归处理其子节点
    if (document.children && document.children.length > 0) {
      for (let i = 0; i < document.children.length; i++) {
        const child = document.children[i];

        document.children[i] = this.visit(child, context);
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
    // 先判断是否为未知标签
    if (!this.isUnknownTag(element.tagName)) {
      // 如果不是未知标签，直接返回原元素，但仍然递归处理子元素
      this.processChildren(element, context);

      return element;
    }

    // 处理未知标签
    let processedElement = { ...element };

    // 标记未知标签
    if (this.options.markUnknownTags) {
      processedElement = this.markUnknownElement(processedElement);
    }

    // 添加警告信息
    if (this.options.addWarning) {
      processedElement = this.addWarningToElement(processedElement);
    }

    // 替换未知标签
    if (this.options.replaceUnknownTags) {
      processedElement = this.replaceUnknownElement(processedElement, context);
    }

    // 递归处理子元素
    this.processChildren(processedElement, context);

    return processedElement;
  }

  /**
   * 判断一个标签是否为未知标签
   * @param tagName 标签名
   * @returns 是否为未知标签
   * @private
   */
  private isUnknownTag(tagName: string): boolean {
    // 如果提供了自定义判断函数，使用它
    if (this.options.isUnknownTag) {
      return this.options.isUnknownTag(tagName);
    }

    // 否则使用knownTags列表进行判断
    if (this.options.knownTags && this.options.knownTags.length > 0) {
      return !this.options.knownTags.includes(tagName);
    }

    // 默认情况下不认为任何标签是未知的
    return false;
  }

  /**
   * 标记未知元素
   * @param element 元素
   * @returns 标记后的元素
   * @private
   */
  private markUnknownElement(element: Element): Element {
    const meta = element.meta || {};

    return {
      ...element,
      meta: {
        ...meta,
        isUnknown: true,
        originalTag: element.tagName,
      },
    };
  }

  /**
   * 添加警告信息到元素
   * @param element 元素
   * @returns 添加警告后的元素
   * @private
   */
  private addWarningToElement(element: Element): Element {
    const meta = element.meta || {};

    return {
      ...element,
      meta: {
        ...meta,
        warning: `未知标签: ${element.tagName}`,
      },
    };
  }

  /**
   * 替换未知元素
   * @param element 元素
   * @param context 转换上下文
   * @returns 替换后的元素
   * @private
   */
  private replaceUnknownElement(
    element: Element,
    context: TransformContext
  ): Element {
    // 先尝试使用自定义替换处理器
    if (this.options.customReplacer) {
      const result = this.options.customReplacer(element, context);

      if (result !== null) {
        return result;
      }
    }

    // 使用默认替换逻辑
    return {
      ...element,
      tagName: this.options.replacementTag || 'div',
      meta: {
        ...(element.meta || {}),
        isUnknown: true,
        originalTag: element.tagName,
      },
    };
  }

  /**
   * 处理元素的子节点
   * @param element 元素
   * @param context 转换上下文
   * @private
   */
  private processChildren(element: Element, context: TransformContext): void {
    if (element.children && element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];

        if (child.type === NodeType.ELEMENT) {
          element.children[i] = this.visitElement(child as Element, context);
        }
      }
    }
  }
}
