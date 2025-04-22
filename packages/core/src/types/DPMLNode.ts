/**
 * 表示DPML文档中的单个节点
 * 使用不可变设计，所有属性只读
 */
export interface DPMLNode {
  /** 节点标签名 */
  readonly tagName: string;

  /** 节点属性集合 */
  readonly attributes: Map<string, string>;

  /** 子节点集合 */
  readonly children: DPMLNode[];

  /** 节点文本内容 */
  readonly content: string;

  /** 父节点引用 */
  readonly parent: DPMLNode | null;

  /** 源代码位置信息 */
  readonly sourceLocation?: SourceLocation;
}

/**
 * 源码定位信息
 */
export interface SourceLocation {
  /** 开始行号 */
  startLine: number;

  /** 开始列号 */
  startColumn: number;

  /** 结束行号 */
  endLine: number;

  /** 结束列号 */
  endColumn: number;

  /** 源文件名 */
  fileName?: string;
}
