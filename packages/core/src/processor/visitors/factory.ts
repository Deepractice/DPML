/**
 * 访问者工厂函数
 *
 * 提供创建各类访问者的工厂方法
 */

import { TagRegistry } from '@core/parser/tag-registry';

import type { ReferenceResolver } from '@core/processor/interfaces';

import { AttributeValidationVisitor } from './attributeValidationVisitor';
import { DocumentMetadataVisitor } from './documentMetadataVisitor';
import { IdValidationVisitor } from './idValidationVisitor';
import { InheritanceVisitor } from './inheritanceVisitor';
import { MarkdownContentVisitor } from './markdownContentVisitor';
import { ReferenceVisitor } from './referenceVisitor';

import type { AttributeValidationOptions } from './attributeValidationVisitor';
import type { DocumentMode } from './documentMetadataVisitor';
import type { IdValidationVisitorOptions } from './idValidationVisitor';
import type { MarkdownContentVisitorOptions } from './markdownContentVisitor';

import type { ReferenceVisitorOptions } from './referenceVisitor';

/**
 * 创建继承处理访问者
 */
export function createInheritanceVisitor(
  referenceResolver?: ReferenceResolver
): InheritanceVisitor {
  return new InheritanceVisitor(referenceResolver);
}

/**
 * 创建文档元数据访问者
 * @param options 选项
 * @returns 文档元数据访问者实例
 */
export function createDocumentMetadataVisitor(options?: {
  defaultMode?: DocumentMode;
}): DocumentMetadataVisitor {
  return new DocumentMetadataVisitor(options);
}

/**
 * 创建ID验证访问者
 * @param options 选项
 * @returns ID验证访问者实例
 */
export function createIdValidationVisitor(
  options?: IdValidationVisitorOptions
): IdValidationVisitor {
  return new IdValidationVisitor(options);
}

/**
 * 创建属性验证访问者
 * @param options 选项
 * @returns 属性验证访问者实例
 */
export function createAttributeValidationVisitor(
  options: AttributeValidationOptions
): AttributeValidationVisitor {
  return new AttributeValidationVisitor(options);
}

/**
 * 创建引用处理访问者
 * @param options 选项
 * @returns 引用处理访问者实例
 */
export function createReferenceVisitor(
  options: ReferenceVisitorOptions
): ReferenceVisitor {
  return new ReferenceVisitor(options);
}

/**
 * 创建Markdown内容处理访问者
 * @param options 选项
 * @returns Markdown内容处理访问者实例
 */
export function createMarkdownContentVisitor(
  options?: MarkdownContentVisitorOptions
): MarkdownContentVisitor {
  return new MarkdownContentVisitor(options);
}
