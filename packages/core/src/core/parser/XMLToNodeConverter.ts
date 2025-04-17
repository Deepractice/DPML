import type { DPMLNode } from '../../types/DPMLNode';
import { ParseError } from '../../types/ParseError';
import type { SourceLocation } from '../../types/SourceLocation';

import type { XMLNode, XMLPosition } from './types';

/**
 * XML节点到DPML节点转换器
 * 负责将XMLNode转换为DPMLNode
 */
export class XmlToNodeConverter {
  /**
   * 将XML节点转换为DPML节点
   * @param xmlNode XML节点
   * @returns 转换后的DPML节点
   */
  convert(xmlNode: XMLNode): DPMLNode {
    if (!xmlNode) {
      // 创建源位置信息
      const location: SourceLocation = {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 1,
        getLineSnippet: () => ''
      };

      throw new ParseError('XML节点不能为空', location);
    }

    // 创建DPML节点
    return this.createDPMLNode(xmlNode);
  }

  /**
   * 创建DPML节点
   * @param xmlNode XML节点
   * @returns DPML节点
   */
  private createDPMLNode(xmlNode: XMLNode): DPMLNode {
    // 创建源位置信息
    const sourceLocation = this.createSourceLocation(xmlNode.position);

    // 创建节点
    const node: DPMLNode = {
      tagName: xmlNode.name,
      id: null,
      attributes: new Map<string, string>(),
      children: [],
      content: xmlNode.textContent || '',
      parent: null,
      sourceLocation,

      // 实现DPMLNode接口的方法
      setId(id: string): void {
        this.id = id;
      },

      getId(): string | null {
        return this.id;
      },

      hasId(): boolean {
        return this.id !== null;
      },

      getAttributeValue(name: string): string | null {
        return this.attributes.get(name) || null;
      },

      hasAttribute(name: string): boolean {
        return this.attributes.has(name);
      },

      setAttribute(name: string, value: string): void {
        this.attributes.set(name, value);
      },

      appendChild(childNode: DPMLNode): void {
        this.children.push(childNode);
        childNode.parent = this;
      },

      removeChild(childNode: DPMLNode): void {
        const index = this.children.indexOf(childNode);

        if (index !== -1) {
          this.children.splice(index, 1);
          childNode.parent = null;
        }
      },

      hasChildren(): boolean {
        return this.children.length > 0;
      },

      hasContent(): boolean {
        return this.content !== '';
      }
    };

    // 处理属性
    if (xmlNode.attributes) {
      for (const [key, value] of Object.entries(xmlNode.attributes)) {
        node.attributes.set(key, String(value));
      }
    }

    // 处理子节点
    if (xmlNode.children && xmlNode.children.length > 0) {
      for (const childXmlNode of xmlNode.children) {
        const childNode = this.createDPMLNode(childXmlNode);

        node.appendChild(childNode);
      }
    }

    return node;
  }

  /**
   * 创建源位置信息
   * @param position XML位置信息
   * @returns 源位置信息
   */
  private createSourceLocation(position?: XMLPosition): SourceLocation {
    if (!position) {
      return {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 1,
        getLineSnippet: () => ''
      };
    }

    return {
      startLine: position.start.line,
      startColumn: position.start.column,
      endLine: position.end.line,
      endColumn: position.end.column,
      getLineSnippet: () => ''
    };
  }
}
