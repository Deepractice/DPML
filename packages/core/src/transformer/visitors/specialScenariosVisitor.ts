import { NodeType } from '../../types/node';

import type { Document, Element, Content } from '../../types/node';
import type { TransformContext } from '../interfaces/transformContext';
import type { TransformerVisitor } from '../interfaces/transformerVisitor';

/**
 * 特殊场景访问者
 *
 * 用于处理各种特殊情况：
 * - 空文档处理
 * - 特殊字符处理
 * - 混合格式内容处理
 * - 变量替换
 */
export class SpecialScenariosVisitor implements TransformerVisitor {
  name = 'SpecialScenariosVisitor';
  priority = 800; // 高优先级，确保在其他访问者之前处理

  /**
   * 访问文档节点
   *
   * @param document 文档节点
   * @param context 转换上下文
   * @returns 处理后的结果
   */
  visitDocument(document: Document, context: TransformContext): any {
    // 处理空文档
    if (!document.children || document.children.length === 0) {
      return {
        type: 'document',
        children: [],
        isEmpty: true,
      };
    }

    // 普通处理，让其他访问者继续处理
    return {
      type: 'document',
      children: document.children,
    };
  }

  /**
   * 访问元素节点
   *
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 处理后的结果
   */
  visitElement(element: Element, context: TransformContext): any {
    // 构建基本元素结构
    const result: any = {
      type: 'element',
      tagName: element.tagName,
      attributes: { ...element.attributes },
      children: [...(element.children || [])], // 确保复制所有子节点
    };

    // 处理自闭合元素
    if (element.attributes && element.attributes.selfClosing) {
      result.selfClosing = true;
    }

    // 处理特殊格式属性
    if (element.attributes && element.attributes.format === 'mixed') {
      result.format = 'mixed';
    }

    return result;
  }

  /**
   * 访问内容节点
   *
   * @param content 内容节点
   * @param context 转换上下文
   * @returns 处理后的结果
   */
  visitContent(content: Content, context: TransformContext): any {
    let value = content.value;

    // 处理特殊字符
    if (value.includes('<') || value.includes('>') || value.includes('&')) {
      value = this.escapeSpecialChars(value);
    }

    // 处理变量替换
    if (value.includes('${') && context.variables) {
      value = this.replaceVariables(value, context.variables);
    }

    return {
      type: 'content',
      value: value,
    };
  }

  /**
   * 转义特殊字符
   *
   * @param text 文本内容
   * @returns 转义后的文本
   * @private
   */
  private escapeSpecialChars(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 替换变量
   *
   * @param text 文本内容
   * @param variables 变量对象
   * @returns 替换后的文本
   * @private
   */
  private replaceVariables(
    text: string,
    variables: Record<string, any>
  ): string {
    return text.replace(/\${([^}]+)}/g, (match, varName) => {
      // 处理简单变量
      if (variables[varName] !== undefined) {
        return String(variables[varName]);
      }

      // 处理嵌套变量 (user.name 格式)
      if (varName.includes('.')) {
        const parts = varName.split('.');
        let value = variables;

        for (const part of parts) {
          if (
            value === undefined ||
            value === null ||
            typeof value !== 'object'
          ) {
            return match; // 保持原样
          }

          value = value[part];
        }

        if (value !== undefined) {
          return String(value);
        }
      }

      return match; // 保持原样
    });
  }
}
