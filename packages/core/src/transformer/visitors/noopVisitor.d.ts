import { BaseVisitor } from './baseVisitor';
import { ProcessedDocument } from '../../processor/interfaces/processor';
import { Element, Content, Reference } from '../../types/node';
import { TransformContext } from '../interfaces/transformContext';
/**
 * 无操作访问者实现
 *
 * 提供一个不改变任何节点的基础实现，只返回原始节点
 * 可用作其他访问者的基类或默认访问者
 */
export declare class NoopVisitor extends BaseVisitor {
    /**
     * 访问者名称
     */
    name: string;
    /**
     * 构造函数
     * @param priority 优先级，默认为0
     */
    constructor(priority?: number);
    /**
     * 访问文档节点
     * @param document 文档节点
     * @param context 转换上下文
     * @returns 原始文档节点
     */
    visitDocument(document: ProcessedDocument, context: TransformContext): ProcessedDocument;
    /**
     * 异步访问文档节点
     * @param document 文档节点
     * @param context 转换上下文
     * @returns 原始文档节点Promise
     */
    visitDocumentAsync(document: ProcessedDocument, context: TransformContext): Promise<ProcessedDocument>;
    /**
     * 访问元素节点
     * @param element 元素节点
     * @param context 转换上下文
     * @returns 原始元素节点
     */
    visitElement(element: Element, context: TransformContext): Element;
    /**
     * 异步访问元素节点
     * @param element 元素节点
     * @param context 转换上下文
     * @returns 原始元素节点Promise
     */
    visitElementAsync(element: Element, context: TransformContext): Promise<Element>;
    /**
     * 访问内容节点
     * @param content 内容节点
     * @param context 转换上下文
     * @returns 原始内容节点
     */
    visitContent(content: Content, context: TransformContext): Content;
    /**
     * 异步访问内容节点
     * @param content 内容节点
     * @param context 转换上下文
     * @returns 原始内容节点Promise
     */
    visitContentAsync(content: Content, context: TransformContext): Promise<Content>;
    /**
     * 访问引用节点
     * @param reference 引用节点
     * @param context 转换上下文
     * @returns 原始引用节点
     */
    visitReference(reference: Reference, context: TransformContext): Reference;
    /**
     * 异步访问引用节点
     * @param reference 引用节点
     * @param context 转换上下文
     * @returns 原始引用节点Promise
     */
    visitReferenceAsync(reference: Reference, context: TransformContext): Promise<Reference>;
}
//# sourceMappingURL=noopVisitor.d.ts.map