/**
 * 访问者类型定义
 */

/**
 * 文档模式枚举
 */
export enum DocumentMode {
  /**
   * 严格模式，所有错误都会中断处理
   */
  STRICT = 'strict',
  
  /**
   * 宽松模式，非致命错误可以继续处理
   */
  LOOSE = 'loose',
}

/**
 * 文档元数据
 */
export interface DocumentMetadata {
  /**
   * 文档模式
   */
  mode: DocumentMode;

  /**
   * 文档语言
   */
  lang?: string;

  /**
   * 文档验证模式
   */
  schema?: string;

  /**
   * 文档版本
   */
  version?: string;
}

/**
 * 引用访问者选项
 */
export interface ReferenceVisitorOptions {
  /**
   * 引用解析器
   */
  referenceResolver: any;

  /**
   * 是否在内容中解析引用
   */
  resolveInContent?: boolean;
} 