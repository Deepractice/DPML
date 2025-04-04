/**
 * XML节点位置信息
 */
export interface XMLPosition {
  start: {
    line: number;
    column: number;
    offset: number;
  };
  end: {
    line: number;
    column: number;
    offset: number;
  };
}

/**
 * XML节点基础接口
 */
export interface XMLNode {
  name: string;
  textContent?: string;
  attributes?: Record<string, any>;
  children: XMLNode[];
  position?: XMLPosition;
}

/**
 * XML解析适配器选项
 */
export interface XMLParserOptions {
  /**
   * 是否保持XML内容的原始顺序
   * @default true
   */
  preserveOrder?: boolean;

  /**
   * 是否忽略属性
   * @default false
   */
  ignoreAttributes?: boolean;

  /**
   * 是否解析属性值（数字、布尔等）
   * @default false
   */
  parseAttributeValue?: boolean;

  /**
   * 是否跟踪节点位置信息
   * @default false
   */
  trackPosition?: boolean;

  /**
   * 是否停止在第一个错误
   * @default false
   */
  stopOnError?: boolean;

  /**
   * 是否解析CDATA为文本
   * @default true
   */
  cdataAsText?: boolean;
} 