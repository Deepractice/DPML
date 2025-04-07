/**
 * ProcessingContext接口
 *
 * 定义处理过程中需要的上下文信息
 */
import { Document, Element } from '../../types/node';
import { ResolvedReference } from './referenceResolver';
/**
 * 处理上下文接口
 * 在处理过程中传递信息和状态
 */
export interface ProcessingContext {
    /**
     * 当前处理的文档
     */
    document: Document;
    /**
     * 当前文档的路径
     * 用于解析相对路径引用
     */
    currentPath: string;
    /**
     * 当前文件路径
     * 与currentPath保持一致，为了API一致性
     */
    filePath: string;
    /**
     * 文档处理模式
     * 可以是严格模式或宽松模式
     */
    documentMode?: 'strict' | 'loose';
    /**
     * 已解析的引用缓存
     * 用于避免重复解析相同的引用
     */
    resolvedReferences: Map<string, ResolvedReference>;
    /**
     * 祖先元素栈
     * 保存当前处理节点的所有祖先元素
     */
    parentElements: Element[];
    /**
     * 上下文变量
     * 用于在处理过程中存储临时数据
     */
    variables: Record<string, any>;
    /**
     * ID到元素的映射
     * 用于快速查找元素
     */
    idMap?: Map<string, Element>;
}
//# sourceMappingURL=processingContext.d.ts.map