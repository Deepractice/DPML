/**
 * DPML Type Definitions
 */

import type {
  Schema,
  ElementSchema,
  DocumentSchema,
  Transformer,
  TransformContext,
  DPMLDocument,
  ValidationResult,
} from '@dpml/core';

// ============================================
// Schema Types
// ============================================

/**
 * Schema 定义 - 用于 defineSchema
 */
export type SchemaDefinition = ElementSchema | DocumentSchema;

// ============================================
// Transformer Types
// ============================================

/**
 * Transformer 定义 - 用于 defineTransformer
 */
export interface TransformerDefinition<TInput = unknown, TOutput = unknown> {
  /**
   * 转换器名称
   */
  name: string;

  /**
   * 转换器描述（可选）
   */
  description?: string;

  /**
   * 转换函数
   */
  transform: (input: TInput, context: TransformContext) => TOutput;
}

// ============================================
// DPML Config Types
// ============================================

/**
 * 编译选项
 */
export interface CompileOptions {
  /**
   * 严格模式 - 验证失败时抛出错误
   * @default false
   */
  strictMode?: boolean;

  /**
   * 错误处理策略
   * @default 'throw'
   */
  errorHandling?: 'throw' | 'collect';
}

/**
 * DPML 配置
 */
export interface DPMLConfig {
  /**
   * Schema 定义
   */
  schema: Schema;

  /**
   * 转换器数组
   */
  transformers: Transformer<unknown, unknown>[];

  /**
   * 编译选项
   */
  options?: CompileOptions;
}

// ============================================
// DPML Instance Types
// ============================================

/**
 * DPML 实例接口
 */
export interface DPML {
  /**
   * 编译 DPML 内容为目标类型
   */
  compile<T>(content: string): Promise<T>;

  /**
   * 解析 DPML 内容（不执行转换）
   */
  parse(content: string): DPMLDocument;

  /**
   * 验证 DPML 内容
   */
  validate(content: string): ValidationResult;

  /**
   * 扩展配置
   */
  extend(config: Partial<DPMLConfig>): void;

  /**
   * 获取当前 Schema
   */
  getSchema(): Schema;

  /**
   * 获取当前转换器列表
   */
  getTransformers(): Transformer<unknown, unknown>[];
}
