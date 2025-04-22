import type { SourceLocation } from '../types';

/**
 * 处理警告接口
 * 表示文档处理过程中的警告信息
 */
export interface ProcessingWarning {
  /**
   * 警告代码
   */
  readonly code: string;

  /**
   * 警告消息
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
   * 警告的严重程度
   */
  readonly severity: 'warning';
}
