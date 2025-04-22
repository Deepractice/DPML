import type { DPMLDocument, ProcessedSchema } from '../types';

/**
 * 处理上下文接口
 * 提供处理过程中的核心上下文信息
 */
export interface ProcessingContext {
  /**
   * 正在处理的DPML文档
   */
  readonly document: DPMLDocument;

  /**
   * 用于验证的已处理Schema
   */
  readonly schema: ProcessedSchema<any>;
}
