/**
 * AttributeValidationVisitor
 *
 * 用于验证元素属性
 */
import { Element } from '../../types/node';
import { NodeVisitor, ProcessingContext } from '../interfaces';
import { TagRegistry } from '../../parser/tag-registry';
/**
 * 属性验证访问者选项
 */
export interface AttributeValidationOptions {
    /**
     * 标签注册表
     */
    tagRegistry: TagRegistry;
    /**
     * 是否启用严格模式
     * 在严格模式下，任何验证错误都会导致抛出错误
     * 在非严格模式下，会遵循文档的mode属性决定严格级别
     */
    strictMode?: boolean;
    /**
     * 是否验证未知标签
     * 默认为false，忽略未在标签注册表中定义的标签
     */
    validateUnknownTags?: boolean;
}
/**
 * 属性验证访问者
 * 验证元素属性的有效性
 */
export declare class AttributeValidationVisitor implements NodeVisitor {
    /**
     * 访问者优先级
     * 在元数据处理后执行
     */
    priority: number;
    /**
     * 标签注册表
     */
    private tagRegistry;
    /**
     * 是否启用严格模式
     */
    private strictMode;
    /**
     * 是否验证未知标签
     */
    private validateUnknownTags;
    /**
     * 构造函数
     * @param options 选项
     */
    constructor(options: AttributeValidationOptions);
    /**
     * 处理元素节点
     * 验证属性
     * @param element 元素节点
     * @param context 处理上下文
     * @returns 处理后的元素节点
     */
    visitElement(element: Element, context: ProcessingContext): Promise<Element>;
    /**
     * 确定是否在严格模式下运行
     * @param context 处理上下文
     * @returns 是否严格模式
     */
    private isStrictMode;
    /**
     * 获取元素位置信息
     * @param element 元素节点
     * @returns 位置信息
     */
    private getPosition;
    /**
     * 处理验证错误
     * @param error 验证错误
     * @param context 处理上下文
     * @param element 元素节点（可选）
     * @returns 处理后的元素节点
     */
    private handleValidationError;
}
//# sourceMappingURL=attributeValidationVisitor.d.ts.map