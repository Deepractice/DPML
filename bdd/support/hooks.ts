/**
 * Cucumber Hooks - 测试生命周期钩子
 */

import { Before, After } from '@cucumber/cucumber';
import type { DPMLWorld } from './world';

Before(function (this: DPMLWorld) {
  // 重置状态
  this.schemaDefinition = null;
  this.schema = null;
  this.transformerDefinitions = new Map();
  this.transformers = [];
  this.dpml = null;
  this.lastResult = null;
  this.lastError = null;
  this.lastDocument = null;
  this.lastValidation = null;
});

After(function (this: DPMLWorld) {
  // 清理（如果需要）
});
