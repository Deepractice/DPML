/**
 * defineSchema - 定义 DPML Schema
 */

import type { Schema } from "@dpml/core";
import type { SchemaDefinition } from "./types";

/**
 * 定义 Schema
 *
 * @param definition Schema 定义
 * @returns Schema 对象
 *
 * @example
 * ```typescript
 * const schema = defineSchema({
 *   element: "prompt",
 *   attributes: [
 *     { name: "role", required: true },
 *     { name: "name", required: false }
 *   ],
 *   children: {
 *     elements: [
 *       { element: "context" },
 *       { element: "instruction" }
 *     ]
 *   }
 * });
 * ```
 */
export function defineSchema(definition: SchemaDefinition): Schema {
  // 验证基本结构
  if (!definition || typeof definition !== "object") {
    throw new Error("Schema definition must be an object");
  }

  if (!("element" in definition) && !("root" in definition)) {
    throw new Error('Schema definition must have "element" or "root" property');
  }

  // 返回 schema（目前直接返回，后续可以添加更多验证和处理）
  return definition as Schema;
}
