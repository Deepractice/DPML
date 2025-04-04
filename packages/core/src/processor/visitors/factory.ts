/**
 * 访问者工厂函数
 * 
 * 提供创建各类访问者的工厂方法
 */

import { ReferenceResolver } from '../interfaces';
import { InheritanceVisitor } from './inheritanceVisitor';
import { DocumentMetadataVisitor } from './documentMetadataVisitor';
import { ReferenceVisitor, ReferenceVisitorOptions } from './referenceVisitor';
import { IdValidationVisitor } from './idValidationVisitor';
import { MarkdownContentVisitor, MarkdownContentVisitorOptions } from './markdownContentVisitor';

/**
 * 创建继承处理访问者
 */
export function createInheritanceVisitor(referenceResolver?: ReferenceResolver): InheritanceVisitor {
  return new InheritanceVisitor(referenceResolver);
}

/**
 * 创建文档元数据访问者
 */
export function createDocumentMetadataVisitor(): DocumentMetadataVisitor {
  return new DocumentMetadataVisitor();
}

/**
 * 创建引用访问者
 */
export function createReferenceVisitor(referenceResolver: ReferenceResolver): ReferenceVisitor {
  const options: ReferenceVisitorOptions = {
    referenceResolver,
    resolveInContent: true  // 默认启用内容中的引用解析
  };
  return new ReferenceVisitor(options);
}

/**
 * 创建ID验证访问者
 */
export function createIdValidationVisitor(): IdValidationVisitor {
  return new IdValidationVisitor();
}

/**
 * 创建Markdown内容访问者
 */
export function createMarkdownContentVisitor(options?: MarkdownContentVisitorOptions): MarkdownContentVisitor {
  return new MarkdownContentVisitor(options);
} 