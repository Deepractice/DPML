import type { SourceLocation } from '../types';

/**
 * 处理错误接口
 * 表示文档处理过程中的错误信息
 */
export interface ProcessingError {
  /**
   * 错误代码
   */
  readonly code: string;

  /**
   * 错误消息
   */
  readonly message: string;

  /**
   * 文档路径
   */
  readonly path: string;

  /**
   * 源代码位置信息
   */
  readonly source: SourceLocation;

  /**
   * 错误的严重程度
   */
  readonly severity: 'error';
}
