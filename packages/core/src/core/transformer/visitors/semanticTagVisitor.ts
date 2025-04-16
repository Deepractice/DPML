import { NodeType } from '../../types/node';
import { TagProcessor } from '../interfaces/tagProcessor';

import type { Element } from '../../types/node';
import type { TagProcessorRegistry } from '../interfaces/tagProcessorRegistry';
import type { TransformContext } from '../interfaces/transformContext';
import type { TransformerVisitor } from '../interfaces/transformerVisitor';

/**
 * 语义标记处理访问者配置选项
 */
export interface SemanticTagVisitorOptions {
  /**
   * 是否忽略处理器错误
   * 当设置为true时，处理器抛出的错误会被捕获并记录，但不会中断处理流程
   * 默认为true
   */
  ignoreErrors?: boolean;

  /**
   * 是否向元素添加错误信息
   * 当设置为true时，处理器错误会被添加到元素的meta.errors中
   * 默认为true
   */
  addErrorsToMeta?: boolean;

  /**
   * 是否递归处理子元素
   * 默认为true
   */
  processChildren?: boolean;
}

/**
 * 语义标记处理访问者
 *
 * 负责处理元素节点的语义标记，通过应用标签处理器增强元素的语义信息
 */
export class SemanticTagVisitor implements TransformerVisitor {
  /**
   * 访问者名称
   */
  readonly name: string = 'semantic-tag';

  /**
   * 访问者优先级
   */
  priority: number;

  /**
   * 标签处理器注册表
   */
  private registry: TagProcessorRegistry;

  /**
   * 配置选项
   */
  private options: SemanticTagVisitorOptions;

  /**
   * 构造函数
   * @param registry 标签处理器注册表
   * @param priority 优先级，默认为40
   * @param options 配置选项
   */
  constructor(
    registry: TagProcessorRegistry,
    priority: number = 40,
    options: SemanticTagVisitorOptions = {}
  ) {
    this.priority = priority;
    this.registry = registry;
    this.options = {
      ignoreErrors: true,
      addErrorsToMeta: true,
      processChildren: true,
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
  visit(node: any, context: TransformContext): any {
    if (!node) {
      return null;
    }

    if (node.type === NodeType.DOCUMENT) {
      // 文档节点，返回Promise
      return this.visitDocument(node, context);
    } else if (node.type === NodeType.ELEMENT) {
      // 元素节点，返回Promise
      return this.visitElement(node, context);
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
  async visitAsync(node: any, context: TransformContext): Promise<any> {
    return this.visit(node, context);
  }

  /**
   * 访问文档节点
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 处理后的文档节点
   */
  async visitDocument(document: any, context: TransformContext): Promise<any> {
    // 文档节点自身不需处理，但需递归处理其子节点
    if (document.children && document.children.length > 0) {
      for (let i = 0; i < document.children.length; i++) {
        const child = document.children[i];

        // 对每个子节点应用适当的访问方法
        document.children[i] = await this.visit(child, context);
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
  async visitElement(
    element: Element,
    context: TransformContext
  ): Promise<Element> {
    // 始终检查是否有处理器，确保调用 getProcessors
    const processors = this.registry.getProcessors(element.tagName);

    // 跳过没有处理器的元素
    if (!processors.length || !this.registry.hasProcessors(element.tagName)) {
      return this.processChildrenIfNeeded(element, context);
    }

    try {
      // 按优先级排序处理器（高到低）
      const sortedProcessors = [...processors].sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      );

      // 依次应用处理器 - 从高优先级到低优先级
      let processedElement = element;

      for (const processor of sortedProcessors) {
        if (processor.canProcess(processedElement)) {
          try {
            // 处理器可能返回Promise或直接返回元素
            const result = processor.process(processedElement, context);

            processedElement =
              result instanceof Promise ? await result : result;
          } catch (error) {
            if (!this.options.ignoreErrors) {
              throw error;
            }

            // 记录错误但继续处理
            console.error(
              `Error in tag processor for ${element.tagName}:`,
              error
            );

            // 向元素添加错误信息
            if (this.options.addErrorsToMeta) {
              this.addErrorToElementMeta(
                processedElement,
                error instanceof Error ? error.message : String(error)
              );
            }
          }
        }
      }

      // 递归处理子元素
      return this.processChildrenIfNeeded(processedElement, context);
    } catch (error) {
      // 捕获整体处理过程中的错误
      console.error(`Error processing element ${element.tagName}:`, error);

      if (this.options.addErrorsToMeta) {
        this.addErrorToElementMeta(
          element,
          error instanceof Error ? error.message : String(error)
        );
      }

      // 返回原始元素
      return element;
    }
  }

  /**
   * 如果配置允许，递归处理子元素
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 处理后的元素
   * @private
   */
  private async processChildrenIfNeeded(
    element: Element,
    context: TransformContext
  ): Promise<Element> {
    if (
      this.options.processChildren &&
      element.children &&
      element.children.length > 0
    ) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];

        if (child.type === NodeType.ELEMENT) {
          // 递归处理子元素
          const processedChild = await this.visitElement(
            child as Element,
            context
          );

          element.children[i] = processedChild;
        }
      }
    }

    return element;
  }

  /**
   * 向元素的meta添加错误信息
   * @param element 元素
   * @param errorMessage 错误信息
   * @private
   */
  private addErrorToElementMeta(element: Element, errorMessage: string): void {
    if (!element.meta) {
      element.meta = {};
    }

    if (!element.meta.errors) {
      element.meta.errors = [];
    }

    element.meta.errors.push(errorMessage);
  }
}
