import type { DPMLDocument } from './DPMLDocument';
import type { ReferenceMap } from './Reference';

/**
 * 处理结果接口，包含解析和处理后的数据
 */
export interface ProcessingResult {
  /**
   * DPML文档对象
   */
  document: DPMLDocument;

  /**
   * 文档有效性标志
   */
  isValid: boolean;

  /**
   * 文档引用关系映射
   */
  references?: ReferenceMap;

  /**
   * 文档schema信息
   */
  schema?: unknown;
}
