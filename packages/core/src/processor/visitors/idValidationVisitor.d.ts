/**
 * IdValidationVisitor
 *
 * 用于验证元素ID的唯一性
 */
import { Document, Element } from '../../types/node';
import { NodeVisitor, ProcessingContext } from '../interfaces';
/**
 * ID验证访问者选项
 */
export interface IdValidationVisitorOptions {
    /**
     * 是否启用严格模式
     * 在严格模式下，任何ID重复都会导致抛出错误
     * 在非严格模式下，只会发出警告
     */
    strictMode?: boolean;
}
/**
 * ID验证访问者
 * 验证文档中所有元素ID的唯一性
 */
export declare class IdValidationVisitor implements NodeVisitor {
    /**
     * 访问者优先级
     * 在继承处理后但在引用处理前执行
     */
    priority: number;
    /**
     * 是否启用严格模式
     */
    private strictMode;
    /**
     * 构造函数
     * @param options 选项
     */
    constructor(options?: IdValidationVisitorOptions);
    /**
     * 处理文档节点
     * 初始化ID映射
     * @param document 文档节点
     * @param context 处理上下文
     * @returns 处理后的文档节点
     */
    visitDocument(document: Document, context: ProcessingContext): Promise<Document>;
    /**
     * 处理元素节点
     * 收集并验证ID
     * @param element 元素节点
     * @param context 处理上下文
     * @returns 处理后的元素节点
     */
    visitElement(element: Element, context: ProcessingContext): Promise<Element>;
}
//# sourceMappingURL=idValidationVisitor.d.ts.map