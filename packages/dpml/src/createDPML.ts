/**
 * createDPML - 创建 DPML 实例
 */

import type { DPMLConfig, DPML } from './types';
import type {
  Schema,
  Transformer,
  DPMLDocument,
  ValidationResult,
} from '@dpml/core';
import {
  parse,
  processSchema,
  processDocument,
  TransformContext,
} from '@dpml/core';
import { resourceTransformer } from './intrinsics';

/**
 * Normalize schema to DocumentSchema format
 */
function normalizeSchema(schema: Schema): object {
  const schemaObj = schema as unknown as Record<string, unknown>;
  if ('element' in schemaObj && !('root' in schemaObj)) {
    return { root: schemaObj };
  }
  return schemaObj;
}

/**
 * 创建 DPML 实例
 */
export function createDPML(config: DPMLConfig): DPML {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be an object');
  }

  if (!config.schema) {
    throw new Error('Config must have a schema');
  }

  if (!Array.isArray(config.transformers)) {
    throw new Error('Config must have a transformers array');
  }

  let schema = config.schema;
  // Auto-register built-in resource transformer at the beginning
  let transformers = [resourceTransformer, ...config.transformers];
  const options = { ...config.options };

  return {
    async compile<T>(content: string): Promise<T> {
      const document = parse<DPMLDocument>(content) as DPMLDocument;
      const normalizedSchema = normalizeSchema(schema);
      const processedSchema = processSchema(normalizedSchema);
      const processingResult = processDocument(document, processedSchema);

      const context = new TransformContext(processingResult);
      let result: unknown = processingResult;

      for (const transformer of transformers) {
        result = transformer.transform(result, context);
      }

      return result as T;
    },

    parse(content: string): DPMLDocument {
      return parse<DPMLDocument>(content) as DPMLDocument;
    },

    validate(content: string): ValidationResult {
      const document = parse<DPMLDocument>(content) as DPMLDocument;
      const normalizedSchema = normalizeSchema(schema);
      const processedSchema = processSchema(normalizedSchema);
      const processingResult = processDocument(document, processedSchema);
      return (
        processingResult.validation || {
          isValid: processingResult.isValid,
          errors: [],
          warnings: [],
        }
      );
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
