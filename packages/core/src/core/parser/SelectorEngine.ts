/**
 * 选择器引擎
 * 用于实现CSS选择器查询功能
 */

import type { DPMLNode } from '../../types';

/**
 * 选择器类型枚举
 */
enum SelectorType {
  TAG,
  ID,
  CLASS,
  ATTRIBUTE,
  WILDCARD,
  COMPOUND
}

/**
 * 选择器接口
 */
interface Selector {
  type: SelectorType;
  value: string;
  match(node: DPMLNode): boolean;
}

/**
 * 标签选择器
 */
class TagSelector implements Selector {
  type = SelectorType.TAG;

  constructor(public value: string) {}

  match(node: DPMLNode): boolean {
    return node.tagName === this.value;
  }
}

/**
 * ID选择器
 */
class IdSelector implements Selector {
  type = SelectorType.ID;

  constructor(public value: string) {}

  match(node: DPMLNode): boolean {
    return node.hasId() && node.getId() === this.value;
  }
}

/**
 * 类选择器
 */
class ClassSelector implements Selector {
  type = SelectorType.CLASS;

  constructor(public value: string) {}

  match(node: DPMLNode): boolean {
    const classAttr = node.getAttributeValue('class');

    if (!classAttr) return false;

    const classes = classAttr.split(/\s+/);

    return classes.includes(this.value);
  }
}

/**
 * 属性选择器
 */
class AttributeSelector implements Selector {
  type = SelectorType.ATTRIBUTE;

  constructor(
    public value: string,
    public operator: string = '',
    public attrValue: string = ''
  ) {}

  match(node: DPMLNode): boolean {
    // 简单的存在性检查
    if (!this.operator) {
      return node.hasAttribute(this.value);
    }

    // 值比较
    const attrValue = node.getAttributeValue(this.value);

    if (attrValue === null) return false;

    switch (this.operator) {
      case '=': // 精确匹配
        return attrValue === this.attrValue;
      case '^=': // 前缀匹配
        return attrValue.startsWith(this.attrValue);
      case '$=': // 后缀匹配
        return attrValue.endsWith(this.attrValue);
      case '*=': // 包含匹配
        return attrValue.includes(this.attrValue);
      case '~=': // 单词匹配
        return attrValue.split(/\s+/).includes(this.attrValue);
      default:
        // 如果操作符不识别，默认使用精确匹配
        return attrValue === this.attrValue;
    }
  }
}

/**
 * 通配符选择器
 */
class WildcardSelector implements Selector {
  type = SelectorType.WILDCARD;
  value = '*';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match(_node: DPMLNode): boolean {
    return true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CompoundSelector implements Selector {
  type = SelectorType.COMPOUND;

  constructor(
    public value: string,
    private selectors: Selector[]
  ) {}

  match(node: DPMLNode): boolean {
    return this.selectors.every(selector => selector.match(node));
  }
}

/**
 * 选择器引擎类
 */
export class SelectorEngine {
  /**
   * 解析选择器字符串
   * @param selector 选择器字符串
   * @returns 解析后的选择器对象
   */
  parseSelector(selector: string): Selector {
    // 通配符选择器
    if (selector === '*') {
      return new WildcardSelector();
    }

    // ID选择器
    if (selector.startsWith('#')) {
      return new IdSelector(selector.substring(1));
    }

    // 类选择器
    if (selector.startsWith('.')) {
      return new ClassSelector(selector.substring(1));
    }

    // 属性选择器 - 处理各种属性选择器格式
    if (selector.includes('[') && selector.includes(']')) {
      // 处理前缀匹配 [attr^=value]
      const prefixMatch = selector.match(/\[([^\]=~$*]+)\^=["']?([^"'\]]*?)["']?\]/);

      if (prefixMatch) {
        const [, name, value] = prefixMatch;

        return new AttributeSelector(name.trim(), '^=', value);
      }

      // 处理后缀匹配 [attr$=value]
      const suffixMatch = selector.match(/\[([^\]=~$*]+)\$=["']?([^"'\]]*?)["']?\]/);

      if (suffixMatch) {
        const [, name, value] = suffixMatch;

        return new AttributeSelector(name.trim(), '$=', value);
      }

      // 处理包含匹配 [attr*=value]
      const containsMatch = selector.match(/\[([^\]=~$*]+)\*=["']?([^"'\]]*?)["']?\]/);

      if (containsMatch) {
        const [, name, value] = containsMatch;

        return new AttributeSelector(name.trim(), '*=', value);
      }

      // 处理精确匹配 [attr=value]
      const exactMatch = selector.match(/\[([^\]=~$*]+)=["']?([^"'\]]*?)["']?\]/);

      if (exactMatch) {
        const [, name, value] = exactMatch;

        return new AttributeSelector(name.trim(), '=', value);
      }

      // 处理存在性检查 [attr]
      const existsMatch = selector.match(/\[([^\]=~$*[\]]+)\]/);

      if (existsMatch) {
        const [, name] = existsMatch;

        return new AttributeSelector(name.trim(), '', '');
      }
    }

    // 标签选择器
    return new TagSelector(selector);
  }

  /**
   * 查询匹配选择器的所有节点
   * @param root 根节点
   * @param selectorStr 选择器字符串
   * @returns 匹配的节点数组
   */
  querySelectorAll(root: DPMLNode, selectorStr: string): DPMLNode[] {
    const selector = this.parseSelector(selectorStr);

    return this.findMatchingNodes(root, selector);
  }

  /**
   * 查询匹配选择器的第一个节点
   * @param root 根节点
   * @param selectorStr 选择器字符串
   * @returns 匹配的第一个节点或null
   */
  querySelector(root: DPMLNode, selectorStr: string): DPMLNode | null {
    const nodes = this.querySelectorAll(root, selectorStr);

    return nodes.length > 0 ? nodes[0] : null;
  }

  /**
   * 查找匹配选择器的所有节点
   * @param node 当前节点
   * @param selector 选择器对象
   * @returns 匹配的节点数组
   */
  private findMatchingNodes(node: DPMLNode, selector: Selector): DPMLNode[] {
    const results: DPMLNode[] = [];

    // 检查当前节点是否匹配
    if (selector.match(node)) {
      results.push(node);
    }

    // 递归检查子节点
    for (const child of node.children) {
      results.push(...this.findMatchingNodes(child, selector));
    }

    return results;
  }
}
