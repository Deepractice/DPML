import { TagRegistry } from './tag-registry';
import { ValidationResult } from './tag-definition';
import { Element, Document } from '../types/node';
/**
 * 验证器类
 * 负责验证DPML文档的结构和属性
 */
export declare class Validator {
    /**
     * 标签注册表
     */
    private tagRegistry;
    /**
     * 构造函数
     * @param tagRegistry 标签注册表
     */
    constructor(tagRegistry: TagRegistry);
    /**
     * 验证整个文档
     * @param document DPML文档
     * @returns 验证结果
     */
    validateDocument(document: Document): ValidationResult;
    /**
     * 验证单个元素
     * @param element 元素节点
     * @returns 验证结果
     */
    validateElement(element: Element): ValidationResult;
    /**
     * 验证元素的属性
     * @param element 元素节点
     * @param tagDefinition 标签定义
     * @returns 验证结果
     */
    validateAttributes(element: Element, tagDefinition: any): ValidationResult;
    /**
     * 验证元素的子节点
     * @param element 元素节点
     * @returns 验证结果
     */
    validateChildren(element: Element): ValidationResult;
    /**
     * 创建验证错误
     * @param code 错误码
     * @param message 错误消息
     * @param position 位置信息
     * @returns 验证错误对象
     */
    private createError;
    /**
     * 创建验证警告
     * @param code 警告码
     * @param message 警告消息
     * @param position 位置信息
     * @returns 验证警告对象
     */
    private createWarning;
}
//# sourceMappingURL=validator.d.ts.map