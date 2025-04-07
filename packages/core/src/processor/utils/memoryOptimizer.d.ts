/**
 * 内存优化工具类
 *
 * 提供处理大型文档时的内存优化功能
 */
import { Document, Node, NodeType } from '../../types/node';
/**
 * 声明global.gc类型
 */
declare global {
    var gc: (() => void) | undefined;
}
/**
 * 内存优化器配置选项
 */
export interface MemoryOptimizerOptions {
    /**
     * 是否启用节点池复用
     * 默认: true
     */
    enableNodePooling?: boolean;
    /**
     * 是否启用引用缓存
     * 默认: true
     */
    enableReferenceCache?: boolean;
    /**
     * 是否使用迭代代替递归进行文档遍历
     * 对大型深度嵌套文档很重要，避免栈溢出
     * 默认: true
     */
    useIterativeTraversal?: boolean;
    /**
     * 最大缓存引用数量
     * 一旦超过此数量，最早的缓存将被清除
     * 默认: 10000
     */
    maxCachedReferences?: number;
}
/**
 * 内存优化器
 *
 * 提供处理大型文档时的内存优化功能
 */
export declare class MemoryOptimizer {
    /**
     * 配置选项
     */
    private options;
    /**
     * 节点池
     */
    private nodePool;
    /**
     * 池中节点数量
     */
    private poolSize;
    /**
     * 最大池大小
     */
    private readonly MAX_POOL_SIZE;
    /**
     * 引用缓存计数
     */
    private referenceCount;
    /**
     * 构造函数
     * @param options 配置选项
     */
    constructor(options?: MemoryOptimizerOptions);
    /**
     * 检查并清理内存
     *
     * 此方法可以在处理大型文档的关键点调用，帮助减少内存占用
     */
    cleanupMemory(): void;
    /**
     * 获取一个节点实例，优先从池中获取
     * @param type 节点类型
     * @returns 节点实例
     */
    acquireNode(type: NodeType): Node;
    /**
     * 释放一个节点，将其返回到池中
     * @param node 要释放的节点
     */
    releaseNode(node: Node): void;
    /**
     * 迭代遍历文档树
     *
     * 使用迭代而非递归，避免深度嵌套导致的栈溢出
     *
     * @param document 文档
     * @param visitor 访问函数
     */
    traverseDocument(document: Document, visitor: (node: Node) => void): void;
    /**
     * 记录引用缓存使用
     * 如果超过最大缓存数，返回true表示应清理缓存
     */
    recordReferenceCache(): boolean;
    /**
     * 重置引用缓存计数
     */
    resetReferenceCount(): void;
    /**
     * 递归遍历节点及其子节点（内部使用）
     * @param node 节点
     * @param visitor 访问函数
     */
    private traverseNode;
    /**
     * 创建一个新节点
     * @param type 节点类型
     * @returns 节点实例
     */
    private createNode;
    /**
     * 清理节点属性，准备复用
     * @param node 要清理的节点
     */
    private clearNodeProperties;
}
//# sourceMappingURL=memoryOptimizer.d.ts.map