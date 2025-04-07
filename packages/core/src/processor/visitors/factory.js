/**
 * 访问者工厂函数
 *
 * 提供创建各类访问者的工厂方法
 */
import { InheritanceVisitor } from './inheritanceVisitor';
import { DocumentMetadataVisitor } from './documentMetadataVisitor';
import { ReferenceVisitor } from './referenceVisitor';
import { IdValidationVisitor } from './idValidationVisitor';
import { MarkdownContentVisitor } from './markdownContentVisitor';
import { AttributeValidationVisitor } from './attributeValidationVisitor';
/**
 * 创建继承处理访问者
 */
export function createInheritanceVisitor(referenceResolver) {
    return new InheritanceVisitor(referenceResolver);
}
/**
 * 创建文档元数据访问者
 * @param options 选项
 * @returns 文档元数据访问者实例
 */
export function createDocumentMetadataVisitor(options) {
    return new DocumentMetadataVisitor(options);
}
/**
 * 创建ID验证访问者
 * @param options 选项
 * @returns ID验证访问者实例
 */
export function createIdValidationVisitor(options) {
    return new IdValidationVisitor(options);
}
/**
 * 创建属性验证访问者
 * @param options 选项
 * @returns 属性验证访问者实例
 */
export function createAttributeValidationVisitor(options) {
    return new AttributeValidationVisitor(options);
}
/**
 * 创建引用处理访问者
 * @param options 选项
 * @returns 引用处理访问者实例
 */
export function createReferenceVisitor(options) {
    return new ReferenceVisitor(options);
}
/**
 * 创建Markdown内容处理访问者
 * @param options 选项
 * @returns Markdown内容处理访问者实例
 */
export function createMarkdownContentVisitor(options) {
    return new MarkdownContentVisitor(options);
}
//# sourceMappingURL=factory.js.map