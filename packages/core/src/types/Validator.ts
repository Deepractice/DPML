/**
 * 验证器接口
 */

import type { DPMLDocument, DPMLNode, ValidationResult } from '.';

/**
 * 验证器接口
 * 定义验证DPML文档和节点的方法
 */
export interface Validator {
  /**
   * 验证整个文档
   * @param document DPML文档
   * @returns 验证结果
   */
  validateDocument(document: DPMLDocument): ValidationResult;

  /**
   * 验证单个节点
   * @param node DPML节点
   * @returns 验证结果
   */
  validateNode(node: DPMLNode): ValidationResult;

  /**
   * 验证ID唯一性
   * @param document DPML文档
   * @returns 验证结果
   */
  validateIdUniqueness(document: DPMLDocument): ValidationResult;
}
