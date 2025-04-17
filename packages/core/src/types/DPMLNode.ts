import type { SourceLocation } from './SourceLocation';

/**
 * DPML文档节点接口
 * 表示DPML文档中的单个节点（元素）
 */
export interface DPMLNode {
  /**
   * 标签名
   */
  tagName: string;

  /**
   * 节点ID，用于快速查找
   */
  id: string | null;

  /**
   * 节点属性集合
   */
  attributes: Map<string, string>;

  /**
   * 子节点列表
   */
  children: DPMLNode[];

  /**
   * 文本内容
   */
  content: string;

  /**
   * 父节点引用
   */
  parent: DPMLNode | null;

  /**
   * 源码位置信息
   */
  sourceLocation: SourceLocation;

  /**
   * 设置节点ID
   * @param id - 节点ID
   */
  setId(id: string): void;

  /**
   * 获取节点ID
   * @returns 节点ID或null
   */
  getId(): string | null;

  /**
   * 检查节点是否有ID
   * @returns 是否有ID
   */
  hasId(): boolean;

  /**
   * 获取属性值
   * @param name - 属性名
   * @returns 属性值或null
   */
  getAttributeValue(name: string): string | null;

  /**
   * 检查是否有指定属性
   * @param name - 属性名
   * @returns 是否存在属性
   */
  hasAttribute(name: string): boolean;

  /**
   * 设置属性值
   * @param name - 属性名
   * @param value - 属性值
   */
  setAttribute(name: string, value: string): void;

  /**
   * 添加子节点
   * @param node - 要添加的子节点
   */
  appendChild(node: DPMLNode): void;

  /**
   * 移除子节点
   * @param node - 要移除的子节点
   */
  removeChild(node: DPMLNode): void;

  /**
   * 检查是否有子节点
   * @returns 是否有子节点
   */
  hasChildren(): boolean;

  /**
   * 检查是否有文本内容
   * @returns 是否有文本内容
   */
  hasContent(): boolean;
}
