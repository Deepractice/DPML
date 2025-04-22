import type { DPMLNode } from '../types';

/**
 * 引用映射接口
 * 提供文档中ID到节点的映射关系
 */
export interface ReferenceMap {
  /**
   * ID到节点的映射
   */
  readonly idMap: ReadonlyMap<string, DPMLNode>;
}
