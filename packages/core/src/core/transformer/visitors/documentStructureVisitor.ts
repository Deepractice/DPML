import { NodeType } from '../../types/node';

import { BaseVisitor } from './baseVisitor';

import type { ProcessedDocument } from '../../processor/interfaces/processor';
import type { Element, Content, Reference } from '../../types/node';
import type { TransformContext } from '../interfaces/transformContext';

/**
 * 文档结构访问者
 *
 * 负责将DPML文档结构转换为适合输出的结构化数据
 */
export class DocumentStructureVisitor extends BaseVisitor {
  /**
   * 访问者名称
   */
  name: string = 'document-structure';

  /**
   * 构造函数
   * @param priority 优先级，默认为10
   */
  constructor(priority: number = 10) {
    super(priority);
  }

  /**
   * 访问文档节点，转换为结构化数据
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 结构化的文档数据
   */
  visitDocument(document: ProcessedDocument, context: TransformContext): any {
    // 创建文档基础结构
    const result: any = {
      type: 'document',
      sections: [],
      elements: [],
    };

    // 复制文档元数据
    if (document.metadata) {
      result.metadata = { ...document.metadata };
    }

    // 复制文档meta数据
    if (document.meta) {
      if (!result.metadata) {
        result.metadata = {};
      }

      // 合并meta到metadata，避免重复
      Object.keys(document.meta).forEach(key => {
        if (!result.metadata[key]) {
          result.metadata[key] = document.meta![key];
        }
      });
    }

    // 处理文档子节点
    if (document.children && document.children.length > 0) {
      for (const child of document.children) {
        const childResult = this.visit(child, context);

        if (childResult) {
          // 根据节点类型和标签名分类处理
          if (child.type === NodeType.ELEMENT) {
            const element = child as Element;

            if (element.tagName === 'section') {
              result.sections.push(childResult);
            } else {
              result.elements.push(childResult);
            }
          } else {
            // 其他类型的节点直接添加到elements
            result.elements.push(childResult);
          }
        }
      }
    }

    // 如果没有元素，则移除空数组
    if (result.elements.length === 0) {
      delete result.elements;
    }

    return result;
  }

  /**
   * 访问元素节点，根据标签类型进行适当转换
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 转换后的元素结构
   */
  visitElement(element: Element, context: TransformContext): any {
    // 根据元素标签类型选择不同的处理方法
    switch (element.tagName) {
      case 'section':
        return this.processSection(element, context);
      case 'subsection':
        return this.processSubsection(element, context);
      case 'paragraph':
        return this.processParagraph(element, context);
      default:
        return this.processGenericElement(element, context);
    }
  }

  /**
   * 处理section元素
   * @param element section元素
   * @param context 转换上下文
   * @returns 处理后的section对象
   * @private
   */
  private processSection(element: Element, context: TransformContext): any {
    const result: any = {
      type: 'section',
      paragraphs: [],
      subsections: [],
    };

    // 复制属性
    if (element.attributes) {
      Object.assign(result, element.attributes);
    }

    // 处理子节点
    if (element.children && element.children.length > 0) {
      for (const child of element.children) {
        const childResult = this.visit(child, context);

        if (childResult) {
          if (child.type === NodeType.ELEMENT) {
            const childElement = child as Element;

            if (childElement.tagName === 'paragraph') {
              result.paragraphs.push(childResult);
            } else if (childElement.tagName === 'subsection') {
              result.subsections.push(childResult);
            } else {
              // 其他元素类型
              if (!result.elements) {
                result.elements = [];
              }

              result.elements.push(childResult);
            }
          } else if (child.type === NodeType.CONTENT) {
            // 直接内容
            if (!result.content) {
              result.content = childResult;
            } else if (Array.isArray(result.content)) {
              result.content.push(childResult);
            } else {
              result.content = [result.content, childResult];
            }
          }
        }
      }
    }

    // 移除空数组
    if (result.paragraphs.length === 0) {
      delete result.paragraphs;
    }

    if (result.subsections.length === 0) {
      delete result.subsections;
    }

    return result;
  }

  /**
   * 处理subsection元素
   * @param element subsection元素
   * @param context 转换上下文
   * @returns 处理后的subsection对象
   * @private
   */
  private processSubsection(element: Element, context: TransformContext): any {
    const result: any = {
      type: 'subsection',
      paragraphs: [],
    };

    // 复制属性
    if (element.attributes) {
      Object.assign(result, element.attributes);
    }

    // 处理子节点
    if (element.children && element.children.length > 0) {
      for (const child of element.children) {
        const childResult = this.visit(child, context);

        if (childResult) {
          if (child.type === NodeType.ELEMENT) {
            const childElement = child as Element;

            if (childElement.tagName === 'paragraph') {
              result.paragraphs.push(childResult);
            } else {
              // 其他元素类型
              if (!result.elements) {
                result.elements = [];
              }

              result.elements.push(childResult);
            }
          } else if (child.type === NodeType.CONTENT) {
            // 直接内容
            if (!result.content) {
              result.content = childResult;
            } else if (Array.isArray(result.content)) {
              result.content.push(childResult);
            } else {
              result.content = [result.content, childResult];
            }
          }
        }
      }
    }

    // 移除空数组
    if (result.paragraphs.length === 0) {
      delete result.paragraphs;
    }

    return result;
  }

  /**
   * 处理paragraph元素
   * @param element paragraph元素
   * @param context 转换上下文
   * @returns 处理后的paragraph对象
   * @private
   */
  private processParagraph(element: Element, context: TransformContext): any {
    const result: any = {
      type: 'paragraph',
    };

    // 复制属性
    if (element.attributes) {
      Object.assign(result, element.attributes);
    }

    // 处理子节点
    if (element.children && element.children.length > 0) {
      let contentText = '';

      for (const child of element.children) {
        if (child.type === NodeType.CONTENT) {
          const content = child as Content;

          contentText += content.value;
        } else {
          const childResult = this.visit(child, context);

          if (childResult) {
            if (!result.elements) {
              result.elements = [];
            }

            result.elements.push(childResult);
          }
        }
      }

      if (contentText) {
        result.content = contentText;
      }
    }

    return result;
  }

  /**
   * 处理通用元素
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 处理后的通用元素对象
   * @private
   */
  private processGenericElement(
    element: Element,
    context: TransformContext
  ): any {
    const result: any = {
      type: element.tagName,
    };

    // 复制属性
    if (element.attributes) {
      result.attributes = { ...element.attributes };
    }

    // 处理子节点
    if (element.children && element.children.length > 0) {
      let contentText = '';
      const childElements = [];

      for (const child of element.children) {
        if (child.type === NodeType.CONTENT) {
          const content = child as Content;

          contentText += content.value;
        } else {
          const childResult = this.visit(child, context);

          if (childResult) {
            childElements.push(childResult);
          }
        }
      }

      if (contentText) {
        result.content = contentText;
      }

      if (childElements.length > 0) {
        result.children = childElements;
      }
    }

    return result;
  }

  /**
   * 访问内容节点
   * @param content 内容节点
   * @param context 转换上下文
   * @returns 内容值
   */
  visitContent(content: Content, context: TransformContext): any {
    return content.value;
  }

  /**
   * 访问引用节点
   * @param reference 引用节点
   * @param context 转换上下文
   * @returns 引用信息对象
   */
  visitReference(reference: Reference, context: TransformContext): any {
    // 如果引用已解析，返回解析后的内容
    if (reference.resolved !== undefined) {
      // 如果解析后的内容是一个节点，递归处理
      if (
        reference.resolved &&
        typeof reference.resolved === 'object' &&
        reference.resolved.type
      ) {
        return this.visit(reference.resolved, context);
      }

      return reference.resolved;
    }

    // 返回引用信息
    return {
      type: 'reference',
      protocol: reference.protocol,
      path: reference.path,
    };
  }
}
