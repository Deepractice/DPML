/**
 * DomainTagVisitor
 *
 * 用于处理领域特定的标签语义
 */
import { Element } from '../../types/node';
import { NodeVisitor, ProcessingContext, TagProcessorRegistry } from '../interfaces';
/**
 * 领域标签访问者
 *
 * 根据标签名查找相应的处理器，应用语义处理
 * 是实现领域特定语义处理的核心组件
 */
export declare class DomainTagVisitor implements NodeVisitor {
    /**
     * 访问者优先级
     * 应该在基础处理（如继承、引用）之后执行，但在其他后处理之前
     */
    priority: number;
    /**
     * 标签处理器注册表
     */
    private registry;
    /**
     * 构造函数
     * @param registry 标签处理器注册表
     */
    constructor(registry: TagProcessorRegistry);
    /**
     * 处理元素节点
     * @param element 元素节点
     * @param context 处理上下文
     * @returns 处理后的元素节点
     */
    visitElement(element: Element, context: ProcessingContext): Promise<Element>;
}
//# sourceMappingURL=domainTagVisitor.d.ts.map