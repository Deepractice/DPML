/**
 * 处理上下文实现
 */
import { Document, Element } from '../types/node';
import { ProcessingContext as ProcessingContextInterface, ResolvedReference } from './interfaces';
/**
 * 处理上下文类
 *
 * 提供处理过程中所需的状态和上下文信息
 */
export declare class ProcessingContext implements ProcessingContextInterface {
    /** 当前正在处理的文档 */
    document: Document;
    /** 当前文档的路径 */
    currentPath: string;
    /** 当前文件路径（与currentPath相同，为了保持API一致性） */
    filePath: string;
    /** 文档处理模式 */
    documentMode?: 'strict' | 'loose';
    /** 已解析的引用缓存 */
    resolvedReferences: Map<string, ResolvedReference>;
    /** 元素处理过程中的父元素栈 */
    parentElements: Element[];
    /** 处理过程中的变量存储 */
    variables: Record<string, any>;
    /** ID到元素的映射 */
    idMap: Map<string, Element>;
    /**
     * 创建新的处理上下文
     *
     * @param document 要处理的文档
     * @param currentPath 文档的路径
     */
    constructor(document: Document, currentPath: string);
}
//# sourceMappingURL=processingContext.d.ts.map