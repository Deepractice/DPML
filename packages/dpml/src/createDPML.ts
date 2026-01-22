/**
 * createDPML - 创建 DPML 实例
 */

import type { DPMLConfig, DPML } from "./types";
import type {
  Schema,
  Transformer,
  DPMLDocument,
  ValidationResult,
} from "@dpml/core";
import {
  parse,
  processSchema,
  processDocument,
  TransformContext,
} from "@dpml/core";

/**
 * 创建 DPML 实例
 *
 * @param config DPML 配置
 * @returns DPML 实例
 *
 * @example
 * ```typescript
 * const dpml = createDPML({
 *   schema: defineSchema({ element: "prompt" }),
 *   transformers: [myTransformer]
 * });
 *
 * const result = await dpml.compile<PromptConfig>(content);
 * ```
 */
export function createDPML(config: DPMLConfig): DPML {
  // 验证配置
  if (!config || typeof config !== "object") {
    throw new Error("Config must be an object");
  }

  if (!config.schema) {
    throw new Error("Config must have a schema");
  }

  if (!Array.isArray(config.transformers)) {
    throw new Error("Config must have a transformers array");
  }

  // 内部状态
  let schema = config.schema;
  let transformers = [...config.transformers];
  const options = { ...config.options };

  return {
    async compile<T>(content: string): Promise<T> {
      // 1. parse - 解析 DPML 内容
      const document = parse(content);

      // 2. processSchema - 处理 schema
      // 如果是 ElementSchema 格式，转换为 DocumentSchema 格式
      const schemaObj = schema as Record<string, unknown>;
      const normalizedSchema =
        "element" in schemaObj && !("root" in schemaObj)
          ? { root: schemaObj }
          : schemaObj;
      const processedSchema = processSchema(normalizedSchema);

      // 3. processDocument - 处理文档
      const processingResult = processDocument(document, processedSchema);

      // 4. transform - 应用 transformers
      const context = new TransformContext(processingResult);
      let result: unknown = processingResult;

      for (const transformer of transformers) {
        result = transformer.transform(result, context);
      }

      return result as T;
    },

    parse(content: string): DPMLDocument {
      return parse(content);
    },

    validate(content: string): ValidationResult {
      const document = parse(content);
      // 如果是 ElementSchema 格式，转换为 DocumentSchema 格式
      const schemaObj = schema as Record<string, unknown>;
      const normalizedSchema =
        "element" in schemaObj && !("root" in schemaObj)
          ? { root: schemaObj }
          : schemaObj;
      const processedSchema = processSchema(normalizedSchema);
      const processingResult = processDocument(document, processedSchema);
      return processingResult.validation || { isValid: processingResult.isValid, errors: [] };
    },

    extend(newConfig: Partial<DPMLConfig>): void {
      if (newConfig.schema) {
        schema = newConfig.schema;
      }
      if (newConfig.transformers) {
        transformers = [...transformers, ...newConfig.transformers];
      }
      if (newConfig.options) {
        Object.assign(options, newConfig.options);
      }
    },

    getSchema(): Schema {
      return schema;
    },

    getTransformers(): Transformer<unknown, unknown>[] {
      return [...transformers];
    },
  };
}
