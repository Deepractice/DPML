import type { DPMLDocument, DPMLNode, ProcessingResult, ProcessedSchema, ValidationResult, ReferenceMap } from '../../types';

import { DocumentValidator } from './DocumentValidator';
import { ValidatorFactory } from './ValidatorFactory';

/**
 * 构建ID到节点的映射
 * 使用深度优先遍历，收集所有带ID的节点
 *
 * @param document - 要处理的DPML文档
 * @returns 只读的ID到节点映射
 */
export function buildIdMap(document: DPMLDocument): ReadonlyMap<string, DPMLNode> {
  // 如果文档已经包含构建好的nodesById映射，直接返回
  if (document.nodesById && document.nodesById.size > 0) {
    return document.nodesById;
  }

  // 创建新映射
  const idMap = new Map<string, DPMLNode>();

  // 递归处理节点树，收集所有带ID的节点
  collectNodesWithId(document.rootNode, idMap);

  return idMap;
}

/**
 * 收集具有ID属性的节点
 * 使用深度优先遍历算法
 *
 * @param node - 当前处理的节点
 * @param idMap - ID到节点的映射
 */
function collectNodesWithId(node: DPMLNode, idMap: Map<string, DPMLNode>): void {
  // 检查节点是否有ID属性
  if (node.attributes.has('id')) {
    const id = node.attributes.get('id')!;

    // 检查ID是否已存在
    if (idMap.has(id)) {
      // 处理重复ID情况 - 忽略后续出现的节点
      console.warn(`发现重复ID: ${id}，忽略后续出现的节点`);
    } else {
      // 添加ID到映射
      idMap.set(id, node);
    }
  }

  // 递归处理子节点
  for (const child of node.children) {
    collectNodesWithId(child, idMap);
  }
}

/**
 * 处理文档
 * 基于提供的Schema验证文档，并提供验证结果和引用信息
 *
 * @param document - 要处理的DPML文档
 * @param schema - 用于验证的已处理Schema
 * @returns 处理结果，包含验证信息和引用映射
 */
export function processDocument<T extends ProcessingResult = ProcessingResult>(
  document: DPMLDocument,
  schema: ProcessedSchema<any>
): T {
  // 创建验证器
  const validatorFactory = new ValidatorFactory();
  const validator = validatorFactory.createValidator();

  // 验证文档
  const validationResult = validator.validateDocument(document, schema);

  // 构建ID引用映射
  const idMap = buildIdMap(document);

  // 创建引用映射
  const referenceMap: ReferenceMap = {
    idMap
  };

  // 创建处理结果
  const result: ProcessingResult = {
    context: {
      document,
      schema
    },
    validation: validationResult as ValidationResult,
    references: referenceMap
  };

  return result as T;
}
