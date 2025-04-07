/**
 * 访问者工厂函数
 *
 * 提供创建各类访问者的工厂方法
 */
import { ReferenceResolver } from '../interfaces';
import { InheritanceVisitor } from './inheritanceVisitor';
import { DocumentMetadataVisitor, DocumentMode } from './documentMetadataVisitor';
import { ReferenceVisitor, ReferenceVisitorOptions } from './referenceVisitor';
import { IdValidationVisitor, IdValidationVisitorOptions } from './idValidationVisitor';
import { MarkdownContentVisitor, MarkdownContentVisitorOptions } from './markdownContentVisitor';
import { AttributeValidationVisitor, AttributeValidationOptions } from './attributeValidationVisitor';
/**
 * 创建继承处理访问者
 */
export declare function createInheritanceVisitor(referenceResolver?: ReferenceResolver): InheritanceVisitor;
/**
 * 创建文档元数据访问者
 * @param options 选项
 * @returns 文档元数据访问者实例
 */
export declare function createDocumentMetadataVisitor(options?: {
    defaultMode?: DocumentMode;
}): DocumentMetadataVisitor;
/**
 * 创建ID验证访问者
 * @param options 选项
 * @returns ID验证访问者实例
 */
export declare function createIdValidationVisitor(options?: IdValidationVisitorOptions): IdValidationVisitor;
/**
 * 创建属性验证访问者
 * @param options 选项
 * @returns 属性验证访问者实例
 */
export declare function createAttributeValidationVisitor(options: AttributeValidationOptions): AttributeValidationVisitor;
/**
 * 创建引用处理访问者
 * @param options 选项
 * @returns 引用处理访问者实例
 */
export declare function createReferenceVisitor(options: ReferenceVisitorOptions): ReferenceVisitor;
/**
 * 创建Markdown内容处理访问者
 * @param options 选项
 * @returns Markdown内容处理访问者实例
 */
export declare function createMarkdownContentVisitor(options?: MarkdownContentVisitorOptions): MarkdownContentVisitor;
//# sourceMappingURL=factory.d.ts.map