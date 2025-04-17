/**
 * DPML文档实现类
 * 表示解析后的DPML文档结构
 */

import type { DPMLDocument, DPMLNode } from '../../types';

import { SelectorEngine } from './SelectorEngine';

/**
 * DPML文档实现类
 */
export class DPMLDocumentImpl implements DPMLDocument {
  /**
   * 文档根节点
   */
  rootNode: DPMLNode;

  /**
   * 节点ID索引，用于快速查找节点
   */
  nodesById: Map<string, DPMLNode>;

  /**
   * 源文件名
   */
  fileName?: string;

  /**
   * 构造函数
   * @param rootNode 文档根节点
   * @param fileName 源文件名（可选）
   */
  constructor(rootNode: DPMLNode, fileName?: string) {
    this.rootNode = rootNode;
    this.fileName = fileName;
    this.nodesById = new Map<string, DPMLNode>();
    this.selectorEngine = new SelectorEngine();

    // 构建节点ID索引
    this.buildNodeIndex(rootNode);
  }

  /**
   * 通过ID获取节点
   * @param id 节点ID
   * @returns 匹配的节点或null
   */
  getNodeById(id: string): DPMLNode | null {
    return this.nodesById.get(id) || null;
  }

  /**
   * 选择器引擎实例
   */
  private selectorEngine: SelectorEngine;

  /**
   * 使用CSS选择器查询单个节点
   * @param selector CSS选择器
   * @returns 第一个匹配的节点或null
   */
  querySelector(selector: string): DPMLNode | null {
    return this.selectorEngine.querySelector(this.rootNode, selector);
  }

  /**
   * 使用CSS选择器查询多个节点
   * @param selector CSS选择器
   * @returns 所有匹配的节点数组
   */
  querySelectorAll(selector: string): DPMLNode[] {
    return this.selectorEngine.querySelectorAll(this.rootNode, selector);
  }

  /**
   * 将文档转换为字符串
   * @returns 文档的字符串表示
   */
  toString(): string {
    return this.serializeNode(this.rootNode, 0);
  }

  /**
   * 构建节点ID索引
   * @param node 当前节点
   */
  private buildNodeIndex(node: DPMLNode): void {
    // 如果节点有ID，添加到索引
    if (node.hasId()) {
      const id = node.getId();

      if (id !== null) {
        this.nodesById.set(id, node);
      }
    }

    // 递归处理子节点
    for (const child of node.children) {
      this.buildNodeIndex(child);
    }
  }



  /**
   * 序列化节点为字符串
   * @param node 当前节点
   * @param indent 缩进级别
   * @returns 序列化后的字符串
   */
  private serializeNode(node: DPMLNode, indent: number): string {
    const indentStr = '  '.repeat(indent);
    let result = '';

    // 开始标签
    result += `${indentStr}<${node.tagName}`;

    // 添加属性
    if (node.attributes.size > 0) {
      for (const [name, value] of node.attributes.entries()) {
        result += ` ${name}="${this.escapeXml(value)}"`;
      }
    }

    // 如果没有内容和子节点，使用自闭合标签
    if (!node.hasContent() && !node.hasChildren()) {
      result += ' />\n';

      return result;
    }

    // 关闭开始标签
    result += '>';

    // 添加内容（如果有）
    if (node.hasContent()) {
      // 如果内容包含换行符，添加缩进
      if (node.content.includes('\n')) {
        result += '\n' + indentStr + '  ' +
          node.content.split('\n').join('\n' + indentStr + '  ') +
          '\n' + indentStr;
      } else {
        result += this.escapeXml(node.content);
      }
    }

    // 添加子节点（如果有）
    if (node.hasChildren()) {
      result += '\n';
      for (const child of node.children) {
        result += this.serializeNode(child, indent + 1);
      }

      result += indentStr;
    }

    // 结束标签
    result += `</${node.tagName}>\n`;

    return result;
  }

  /**
   * 转义XML特殊字符
   * @param text 要转义的文本
   * @returns 转义后的文本
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
