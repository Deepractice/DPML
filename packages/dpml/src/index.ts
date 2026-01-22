/**
 * DPML - Deepractice Prompt Markup Language
 *
 * @example
 * ```typescript
 * import { createDPML, defineSchema, defineTransformer } from "dpml";
 *
 * const schema = defineSchema({
 *   element: "prompt",
 *   attributes: [{ name: "role", required: true }]
 * });
 *
 * const transformer = defineTransformer({
 *   name: "prompt-transformer",
 *   transform: (input) => ({ role: input.document.rootNode.attributes?.role })
 * });
 *
 * const dpml = createDPML({ schema, transformers: [transformer] });
 * const result = await dpml.compile<MyType>(content);
 * ```
 *
 * @packageDocumentation
 */

// ============================================
// Types
// ============================================
export type {
  DPMLConfig,
  DPML,
  CompileOptions,
  SchemaDefinition,
  TransformerDefinition,
} from './types';

// Re-export core types for convenience
export type {
  Schema,
  ElementSchema,
  DocumentSchema,
  AttributeSchema,
  Transformer,
  TransformContext,
  DPMLDocument,
  DPMLNode,
  ValidationResult,
} from '@dpml/core';

// ============================================
// Core API
// ============================================
export { createDPML } from './createDPML';
export { defineSchema } from './defineSchema';
export { defineTransformer } from './defineTransformer';

// ============================================
// Version
// ============================================
declare const __VERSION__: string | undefined;
export const VERSION: string =
  typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0-dev';
