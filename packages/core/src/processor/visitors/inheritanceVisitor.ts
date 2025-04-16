/**
 * 继承访问者实现
 *
 * 处理元素的继承(extends属性)功能
 */

import { DPMLError, ErrorCode } from '@core/errors';
import { NodeType, isElement } from '@core/types/node';

import type {
  NodeVisitor,
  ProcessingContext,
  ReferenceResolver,
} from '@core/processor/interfaces';
import type { Element, Reference } from '@core/types/node';

/**
 * 处理元素继承的访问者
 * 处理元素extends属性，实现基于ID、文件和HTTP资源的继承
 */
export class InheritanceVisitor implements NodeVisitor {
  /**
   * 访问者优先级，继承处理应该最先执行
   */
  priority = 100;

  /**
   * 引用解析器，用于解析外部继承
   */
  private referenceResolver?: ReferenceResolver;

  /**
   * 创建继承访问者
   * @param referenceResolver 引用解析器
   */
  constructor(referenceResolver?: ReferenceResolver) {
    this.referenceResolver = referenceResolver;
  }

  /**
   * 处理元素节点
   * @param element 元素节点
   * @param context 处理上下文
   * @returns 处理后的元素节点
   */
  async visitElement(
    element: Element,
    context: ProcessingContext
  ): Promise<Element> {
    // 如果元素没有extends属性，不做处理
    if (!element.attributes.extends) {
      return element;
    }

    // 记录当前处理的继承路径，用于检测循环继承
    context.variables.inheritanceChain =
      context.variables.inheritanceChain || [];
    const extendsValue = element.attributes.extends;

    // 检测循环继承
    if (context.variables.inheritanceChain.includes(extendsValue)) {
      throw new DPMLError({
        code: ErrorCode.CIRCULAR_REFERENCE,
        message: `检测到循环继承: ${context.variables.inheritanceChain.join(' -> ')} -> ${extendsValue}`,
        position: element.position.start,
      });
    }

    // 将当前extends值添加到继承链中
    context.variables.inheritanceChain.push(extendsValue);

    try {
      // 解析基础元素
      const baseElement = await this.resolveBaseElement(extendsValue, context);

      // 合并属性和内容
      return this.mergeElements(baseElement, element);
    } finally {
      // 从继承链中移除当前extends值
      context.variables.inheritanceChain.pop();
    }
  }

  /**
   * 解析基础元素
   * @param extendsValue extends属性值
   * @param context 处理上下文
   * @returns 解析后的基础元素
   */
  private async resolveBaseElement(
    extendsValue: string,
    context: ProcessingContext
  ): Promise<Element> {
    // ID引用格式: id:elementId
    if (extendsValue.startsWith('id:')) {
      return this.resolveIdReference(extendsValue.substring(3), context);
    }

    // 文件引用格式: file:path/to/file.dpml#elementId
    if (
      extendsValue.startsWith('file:') ||
      extendsValue.startsWith('http:') ||
      extendsValue.startsWith('https:')
    ) {
      return this.resolveExternalReference(extendsValue, context);
    }

    // 未知引用格式
    throw new DPMLError({
      code: ErrorCode.INVALID_REFERENCE,
      message: `不支持的继承格式: ${extendsValue}`,
    });
  }

  /**
   * 解析ID引用
   * @param id 元素ID
   * @param context 处理上下文
   * @returns 解析后的元素
   */
  private resolveIdReference(id: string, context: ProcessingContext): Element {
    // 查找ID映射表
    const idMap = (context as any).idMap;

    if (!idMap || !idMap.has(id)) {
      throw new DPMLError({
        code: ErrorCode.REFERENCE_NOT_FOUND,
        message: `继承引用的元素ID未找到: ${id}`,
      });
    }

    return idMap.get(id);
  }

  /**
   * 解析外部引用
   * @param reference 引用字符串
   * @param context 处理上下文
   * @returns 解析后的元素
   */
  private async resolveExternalReference(
    reference: string,
    context: ProcessingContext
  ): Promise<Element> {
    if (!this.referenceResolver) {
      throw new DPMLError({
        code: ErrorCode.INVALID_REFERENCE,
        message: '未配置引用解析器，无法解析外部继承引用',
      });
    }

    // 创建引用对象
    const [url, id] = this.parseExternalReference(reference);
    const refObj: Reference = {
      type: NodeType.REFERENCE,
      protocol:
        url.startsWith('http:') || url.startsWith('https:') ? 'http' : 'file',
      path: url,
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    // 解析引用
    const resolved = await this.referenceResolver.resolve(refObj, context);

    // 处理解析结果
    if (!resolved || !resolved.value) {
      throw new DPMLError({
        code: ErrorCode.REFERENCE_NOT_FOUND,
        message: `无法解析继承引用: ${reference}`,
      });
    }

    // 如果有ID部分，需要从解析结果中查找指定ID的元素
    if (id) {
      const document = resolved.value;
      const targetElement = this.findElementById(document, id);

      if (!targetElement) {
        throw new DPMLError({
          code: ErrorCode.REFERENCE_NOT_FOUND,
          message: `在引用的文档中未找到指定ID的元素: ${id}`,
        });
      }

      return targetElement;
    }

    // 如果解析结果直接是元素，直接返回
    if (isElement(resolved.value)) {
      return resolved.value;
    }

    throw new DPMLError({
      code: ErrorCode.INVALID_REFERENCE,
      message: `继承引用解析结果不是有效的元素: ${reference}`,
    });
  }

  /**
   * 解析外部引用字符串，分离URL和ID
   * @param reference 引用字符串
   * @returns [URL, ID]
   */
  private parseExternalReference(
    reference: string
  ): [string, string | undefined] {
    const hashIndex = reference.indexOf('#');

    if (hashIndex === -1) {
      return [reference, undefined];
    }

    const url = reference.substring(0, hashIndex);
    const id = reference.substring(hashIndex + 1);

    return [url, id];
  }

  /**
   * 在文档中查找指定ID的元素
   * @param document 文档对象
   * @param id 元素ID
   * @returns 找到的元素或undefined
   */
  private findElementById(document: any, id: string): Element | undefined {
    // 如果文档是元素集合，遍历查找
    if (Array.isArray(document)) {
      for (const child of document) {
        if (isElement(child) && child.attributes.id === id) {
          return child;
        }

        // 递归查找子元素
        if (isElement(child) && Array.isArray(child.children)) {
          const found = this.findElementById(child.children, id);

          if (found) return found;
        }
      }

      return undefined;
    }

    // 如果文档是对象，检查它是否包含children
    if (
      document &&
      typeof document === 'object' &&
      Array.isArray(document.children)
    ) {
      return this.findElementById(document.children, id);
    }

    return undefined;
  }

  /**
   * 合并两个元素
   * @param baseElement 基础元素
   * @param childElement 子元素
   * @returns 合并后的元素
   */
  private mergeElements(baseElement: Element, childElement: Element): Element {
    // 创建结果元素，基于子元素
    const result: Element = {
      ...childElement,
      attributes: { ...childElement.attributes },
      children: [...childElement.children],
    };

    // 合并属性: 先继承基础元素的属性，然后用子元素的属性覆盖
    for (const [key, value] of Object.entries(baseElement.attributes)) {
      // 跳过id属性和已在子元素中定义的属性
      if (key === 'id' || key in childElement.attributes) {
        continue;
      }

      result.attributes[key] = value;
    }

    // 如果子元素没有内容，继承基础元素的内容
    if (childElement.children.length === 0 && baseElement.children.length > 0) {
      result.children = [...baseElement.children];
    }

    return result;
  }
}
