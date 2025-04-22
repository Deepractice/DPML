/**
 * DPML类型工具函数
 * 提供格式化和其他辅助函数
 */
import type { DPMLDocument } from './DPMLDocument';
import type { DPMLNode } from './DPMLNode';

/**
 * 格式化DPMLNode为可读字符串
 * 安全处理循环引用
 *
 * @param node 要格式化的节点
 * @param maxDepth 最大递归深度，默认为2
 * @param indent 当前缩进级别，默认为0
 * @param visited 已访问节点集合，用于防止循环引用
 * @returns 格式化后的字符串
 */
export function formatDPMLNode(
  node: DPMLNode,
  maxDepth = 2,
  indent = 0,
  visited = new WeakSet()
): string {
  if (!node) return 'null';

  // 检查循环引用
  if (visited.has(node)) {
    return `[循环引用 - ${node.tagName}]`;
  }

  visited.add(node);

  // 创建缩进
  const indentStr = '  '.repeat(indent);
  let result = '';

  // 基本信息
  result += `${indentStr}<${node.tagName}`;

  // 添加属性
  if (node.attributes && node.attributes.size > 0) {
    const attrs: string[] = [];

    node.attributes.forEach((value, key) => {
      attrs.push(`${key}="${value}"`);
    });
    result += ` ${attrs.join(' ')}`;
  }

  result += '>\n';

  // 添加内容（如果有）
  if (node.content?.trim()) {
    result += `${indentStr}  ${node.content.trim()}\n`;
  }

  // 递归添加子节点（如果深度允许）
  if (maxDepth > 0 && node.children && node.children.length > 0) {
    node.children.forEach(child => {
      result += formatDPMLNode(child, maxDepth - 1, indent + 1, visited);
    });
  } else if (node.children && node.children.length > 0) {
    result += `${indentStr}  [子节点数量: ${node.children.length}]\n`;
  }

  // 闭合标签
  result += `${indentStr}</${node.tagName}>\n`;

  return result;
}

/**
 * 格式化DPMLDocument为可读字符串
 * 安全处理循环引用
 *
 * @param doc 要格式化的文档
 * @param maxDepth 最大递归深度，默认为3
 * @returns 格式化后的字符串
 */
export function formatDPMLDocument(doc: DPMLDocument, maxDepth = 3): string {
  if (!doc) return 'null';

  let result = '--- DPML文档 ---\n';

  // 添加元数据
  result += '元数据:\n';
  if (doc.metadata) {
    for (const [key, value] of Object.entries(doc.metadata)) {
      if (value !== undefined) {
        result += `  ${key}: ${formatMetadataValue(value)}\n`;
      }
    }
  } else {
    result += '  (无元数据)\n';
  }

  // 添加节点ID映射摘要
  if (doc.nodesById && doc.nodesById.size > 0) {
    result += `ID映射: ${doc.nodesById.size}个节点ID映射\n`;
    // 可选：列出前几个ID作为示例
    let count = 0;

    result += '  示例ID: ';
    doc.nodesById.forEach((_, id) => {
      if (count < 3) {
        result += `${id}, `;
        count++;
      }
    });
    if (count > 0) {
      result = result.slice(0, -2) + '\n'; // 移除最后的逗号和空格
    }
  }

  // 添加文档结构
  result += '\n文档结构:\n';
  result += formatDPMLNode(doc.rootNode, maxDepth);

  return result;
}

/**
 * 格式化元数据值，处理特殊类型
 * @param value 元数据值
 * @returns 格式化后的字符串
 */
function formatMetadataValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    try {
      // 尝试简单JSON序列化，避免过于详细
      const json = JSON.stringify(value);
      const shortened = json.slice(0, 50);

      return shortened + (json.length > 50 ? '...' : '');
    } catch {
      return '[复杂对象]';
    }
  }

  return String(value);
}

/**
 * 搜索DPML文档中的节点
 * @param doc DPML文档
 * @param predicate 查找条件
 * @returns 匹配的节点数组
 */
export function findNodes(
  doc: DPMLDocument,
  predicate: (node: DPMLNode) => boolean
): DPMLNode[] {
  const results: DPMLNode[] = [];

  function traverse(node: DPMLNode) {
    if (predicate(node)) {
      results.push(node);
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(doc.rootNode);

  return results;
}

/**
 * 根据标签名查找节点
 * @param doc DPML文档
 * @param tagName 要查找的标签名
 * @returns 匹配的节点数组
 */
export function findNodesByTag(doc: DPMLDocument, tagName: string): DPMLNode[] {
  return findNodes(doc, node => node.tagName === tagName);
}

/**
 * 根据属性查找节点
 * @param doc DPML文档
 * @param attrName 属性名
 * @param attrValue 属性值 (可选)
 * @returns 匹配的节点数组
 */
export function findNodesByAttr(
  doc: DPMLDocument,
  attrName: string,
  attrValue?: string
): DPMLNode[] {
  return findNodes(doc, node => {
    if (!node.attributes) return false;
    const value = node.attributes.get(attrName);

    return value !== undefined && (attrValue === undefined || value === attrValue);
  });
}
