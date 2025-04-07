/**
 * 继承访问者实现
 *
 * 处理元素的继承(extends属性)功能
 */
import { Element } from '../../types/node';
import { NodeVisitor, ProcessingContext, ReferenceResolver } from '../interfaces';
/**
 * 处理元素继承的访问者
 * 处理元素extends属性，实现基于ID、文件和HTTP资源的继承
 */
export declare class InheritanceVisitor implements NodeVisitor {
    /**
     * 访问者优先级，继承处理应该最先执行
     */
    priority: number;
    /**
     * 引用解析器，用于解析外部继承
     */
    private referenceResolver?;
    /**
     * 创建继承访问者
     * @param referenceResolver 引用解析器
     */
    constructor(referenceResolver?: ReferenceResolver);
    /**
     * 处理元素节点
     * @param element 元素节点
     * @param context 处理上下文
     * @returns 处理后的元素节点
     */
    visitElement(element: Element, context: ProcessingContext): Promise<Element>;
    /**
     * 解析基础元素
     * @param extendsValue extends属性值
     * @param context 处理上下文
     * @returns 解析后的基础元素
     */
    private resolveBaseElement;
    /**
     * 解析ID引用
     * @param id 元素ID
     * @param context 处理上下文
     * @returns 解析后的元素
     */
    private resolveIdReference;
    /**
     * 解析外部引用
     * @param reference 引用字符串
     * @param context 处理上下文
     * @returns 解析后的元素
     */
    private resolveExternalReference;
    /**
     * 解析外部引用字符串，分离URL和ID
     * @param reference 引用字符串
     * @returns [URL, ID]
     */
    private parseExternalReference;
    /**
     * 在文档中查找指定ID的元素
     * @param document 文档对象
     * @param id 元素ID
     * @returns 找到的元素或undefined
     */
    private findElementById;
    /**
     * 合并两个元素
     * @param baseElement 基础元素
     * @param childElement 子元素
     * @returns 合并后的元素
     */
    private mergeElements;
}
//# sourceMappingURL=inheritanceVisitor.d.ts.map