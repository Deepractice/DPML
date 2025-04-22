/**
 * 解析模块内部类型定义
 * 这些类型仅在parsing模块内部使用，不对外暴露
 */

/**
 * XML解析器接口
 * 底层XML解析器的契约接口
 */
export interface IXMLParser {
  /**
   * 解析XML内容字符串
   * @param content XML内容
   * @returns 解析结果
   */
  parse(content: string): XMLNode;

  /**
   * 异步解析XML内容
   * @param content XML内容
   * @returns 解析结果Promise
   */
  parseAsync(content: string): Promise<XMLNode>;

  /**
   * 配置解析器行为
   * @param options 配置选项
   */
  configure(options: Record<string, unknown>): void;
}

/**
 * XML节点内部表示
 */
export interface XMLNode {
  /** 节点类型 */
  type: string;

  /** 节点名称 */
  name: string;

  /** 节点属性 */
  attributes: Record<string, string>;

  /** 子节点 */
  children: XMLNode[];

  /** 文本内容 */
  text?: string;

  /** 位置信息 */
  position?: XMLPosition;
}

/**
 * XML节点位置信息
 */
export interface XMLPosition {
  /** 开始位置 */
  start: {
    line: number;
    column: number;
    offset: number;
  };

  /** 结束位置 */
  end: {
    line: number;
    column: number;
    offset: number;
  };
}
