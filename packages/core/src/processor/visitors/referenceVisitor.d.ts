/**
 * ReferenceVisitor
 *
 * 用于处理引用节点和内容中的引用
 */
import { Content, Reference } from '../../types/node';
import { NodeVisitor, ProcessingContext, ReferenceResolver } from '../interfaces';
/**
 * 引用访问者选项
 */
export interface ReferenceVisitorOptions {
    /**
     * 引用解析器
     */
    referenceResolver: ReferenceResolver;
    /**
     * 是否在内容中解析引用
     */
    resolveInContent?: boolean;
}
/**
 * 引用访问者
 * 处理引用节点和内容中的引用
 */
export declare class ReferenceVisitor implements NodeVisitor {
    /**
     * 访问者优先级
     */
    priority: number;
    /**
     * 引用解析器
     */
    private referenceResolver;
    /**
     * 是否在内容中解析引用
     */
    private resolveInContent;
    /**
     * 引用正则表达式
     * 匹配@开头的引用，支持以下格式：
     * - @id:some-id
     * - @file:./path/to/file.dpml
     * - @http://example.com/resource.dpml
     * - @https://example.com/resource.dpml
     */
    private readonly referenceRegex;
    /**
     * 构造函数
     * @param options 选项
     */
    constructor(options: ReferenceVisitorOptions);
    /**
     * 处理引用节点
     * @param reference 引用节点
     * @param context 处理上下文
     * @returns 处理后的引用节点
     */
    visitReference(reference: Reference, context: ProcessingContext): Promise<Reference>;
    /**
     * 处理内容节点
     * @param content 内容节点
     * @param context 处理上下文
     * @returns 处理后的内容节点
     */
    visitContent(content: Content, context: ProcessingContext): Promise<Content>;
    /**
     * 格式化解析后的值
     * @param value 解析后的值
     * @returns 格式化后的字符串
     */
    private formatResolvedValue;
}
//# sourceMappingURL=referenceVisitor.d.ts.map