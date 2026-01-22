/**
 * Cucumber World - 共享测试上下文
 */

import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { DPML, Schema, Transformer } from 'dpml';

export interface DPMLWorld extends World {
  // Schema 定义
  schemaDefinition: object | null;
  schema: Schema | null;

  // Transformers
  transformerDefinitions: Map<string, object>;
  transformers: Transformer<unknown, unknown>[];

  // DPML 实例
  dpml: DPML | null;

  // 结果
  lastResult: unknown;
  lastError: Error | null;
  lastDocument: unknown;
  lastValidation: {
    isValid: boolean;
    errors: Array<{ message: string }>;
  } | null;
}

class CustomWorld extends World implements DPMLWorld {
  schemaDefinition: object | null = null;
  schema: Schema | null = null;
  transformerDefinitions: Map<string, object> = new Map();
  transformers: Transformer<unknown, unknown>[] = [];
  dpml: DPML | null = null;
  lastResult: unknown = null;
  lastError: Error | null = null;
  lastDocument: unknown = null;
  lastValidation: {
    isValid: boolean;
    errors: Array<{ message: string }>;
  } | null = null;

  constructor(options: any) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
