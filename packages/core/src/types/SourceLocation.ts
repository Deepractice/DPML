/**
 * 源代码位置信息接口
 * 用于记录文档中元素的精确位置，便于错误定位
 */
export interface SourceLocation {
  /**
   * 开始行号（1-indexed）
   */
  startLine: number;

  /**
   * 开始列号（1-indexed）
   */
  startColumn: number;

  /**
   * 结束行号（1-indexed）
   */
  endLine: number;

  /**
   * 结束列号（1-indexed）
   */
  endColumn: number;

  /**
   * 源文件名
   */
  fileName?: string;

  /**
   * 源代码文本
   */
  sourceText?: string;

  /**
   * 获取源代码行片段
   * @returns 包含错误的源代码行
   */
  getLineSnippet(): string;
}
