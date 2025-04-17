import type { DPMLNode } from './DPMLNode';

/**
 * DPML文档接口
 * 表示整个DPML文档及其操作方法
 */
export interface DPMLDocument {
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
   * 通过ID获取节点
   * @param id - 节点ID
   * @returns 匹配的节点或null
   */
  getNodeById(id: string): DPMLNode | null;

  /**
   * 使用CSS选择器查询单个节点
   * @param selector - CSS选择器
   * @returns 第一个匹配的节点或null
   */
  querySelector(selector: string): DPMLNode | null;

  /**
   * 使用CSS选择器查询多个节点
   * @param selector - CSS选择器
   * @returns 所有匹配的节点数组
   */
  querySelectorAll(selector: string): DPMLNode[];

  /**
   * 将文档转换为字符串
   * @returns 文档的字符串表示
   */
  toString(): string;
}
