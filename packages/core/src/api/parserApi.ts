/**
 * 解析器API
 * 提供DPML文档解析和验证功能
 */

import { TagRegistry, Validator } from '../core/parser';
import { DPMLAdapter } from '../core/parser/DPMLAdapter';

import type { ValidationResult } from '../errors/types';
import type { Document } from '../types/node';
import type { ParseOptions, ParseResult } from '../types/parser';

/**
 * 解析 DPML 字符串为节点树
 * @param input DPML 文本
 * @param options 解析选项
 * @returns 解析结果
 */
export async function parse(input: string, options?: ParseOptions): Promise<ParseResult> {
  const adapter = new DPMLAdapter(options);

  return adapter.parse(input, options);
}

/**
 * 验证 DPML 文档
 * @param document DPML 文档对象
 * @returns 验证结果
 */
export function validate(document: Document): ValidationResult {
  const registry = new TagRegistry();
  const validator = new Validator(registry);

  return validator.validateDocument(document);
}

/**
 * 创建标签注册表实例
 * @returns 标签注册表实例
 */
export function createTagRegistry(): TagRegistry {
  return new TagRegistry();
} 