/**
 * 访问者工厂函数
 * 
 * 提供创建各种访问者实例的工厂函数
 */

import { IdValidationVisitor, IdValidationVisitorOptions } from './idValidationVisitor';
import { ReferenceVisitor, ReferenceVisitorOptions } from './referenceVisitor';
import { DocumentMetadataVisitor, DocumentMetadataVisitorOptions } from './documentMetadataVisitor';

/**
 * 创建ID验证访问者
 * @param options ID验证访问者选项
 * @returns ID验证访问者实例
 */
export function createIdValidationVisitor(options?: IdValidationVisitorOptions): IdValidationVisitor {
  return new IdValidationVisitor(options);
}

/**
 * 创建引用访问者
 * @param options 引用访问者选项
 * @returns 引用访问者实例
 */
export function createReferenceVisitor(options: ReferenceVisitorOptions): ReferenceVisitor {
  return new ReferenceVisitor(options);
}

/**
 * 创建文档元数据访问者
 * @param options 文档元数据访问者选项
 * @returns 文档元数据访问者实例
 */
export function createDocumentMetadataVisitor(options?: DocumentMetadataVisitorOptions): DocumentMetadataVisitor {
  return new DocumentMetadataVisitor(options);
} 