import { BaseVisitor } from './baseVisitor';
/**
 * 无操作访问者实现
 *
 * 提供一个不改变任何节点的基础实现，只返回原始节点
 * 可用作其他访问者的基类或默认访问者
 */
export class NoopVisitor extends BaseVisitor {
    /**
     * 构造函数
     * @param priority 优先级，默认为0
     */
    constructor(priority = 0) {
        super(priority);
        /**
         * 访问者名称
         */
        this.name = 'noop';
    }
    /**
     * 访问文档节点
     * @param document 文档节点
     * @param context 转换上下文
     * @returns 原始文档节点
     */
    visitDocument(document, context) {
        return document;
    }
    /**
     * 异步访问文档节点
     * @param document 文档节点
     * @param context 转换上下文
     * @returns 原始文档节点Promise
     */
    async visitDocumentAsync(document, context) {
        return document;
    }
    /**
     * 访问元素节点
     * @param element 元素节点
     * @param context 转换上下文
     * @returns 原始元素节点
     */
    visitElement(element, context) {
        return element;
    }
    /**
     * 异步访问元素节点
     * @param element 元素节点
     * @param context 转换上下文
     * @returns 原始元素节点Promise
     */
    async visitElementAsync(element, context) {
        return element;
    }
    /**
     * 访问内容节点
     * @param content 内容节点
     * @param context 转换上下文
     * @returns 原始内容节点
     */
    visitContent(content, context) {
        return content;
    }
    /**
     * 异步访问内容节点
     * @param content 内容节点
     * @param context 转换上下文
     * @returns 原始内容节点Promise
     */
    async visitContentAsync(content, context) {
        return content;
    }
    /**
     * 访问引用节点
     * @param reference 引用节点
     * @param context 转换上下文
     * @returns 原始引用节点
     */
    visitReference(reference, context) {
        return reference;
    }
    /**
     * 异步访问引用节点
     * @param reference 引用节点
     * @param context 转换上下文
     * @returns 原始引用节点Promise
     */
    async visitReferenceAsync(reference, context) {
        return reference;
    }
}
//# sourceMappingURL=noopVisitor.js.map