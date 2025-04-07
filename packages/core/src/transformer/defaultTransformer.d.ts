import { ProcessedDocument } from '../processor/interfaces/processor';
import { OutputAdapter } from './interfaces/outputAdapter';
import { Transformer } from './interfaces/transformer';
import { TransformContext } from './interfaces/transformContext';
import { TransformOptions } from './interfaces/transformOptions';
import { TransformerVisitor } from './interfaces/transformerVisitor';
/**
 * 默认转换器实现
 */
export declare class DefaultTransformer implements Transformer {
    /**
     * 访问者数组
     * @private
     */
    private visitors;
    /**
     * 输出适配器
     * @private
     */
    private outputAdapter?;
    /**
     * 转换选项
     * @private
     */
    private options;
    /**
     * 缓存映射
     * @private
     */
    private cache;
    /**
     * 上下文管理器
     * @private
     */
    private contextManager;
    /**
     * 访问者错误计数映射
     * @private
     */
    private visitorErrorCounts;
    /**
     * 被禁用的访问者集合
     * @private
     */
    private disabledVisitors;
    /**
     * 默认错误阈值
     * @private
     */
    private static readonly DEFAULT_ERROR_THRESHOLD;
    /**
     * 默认优先级
     * @private
     */
    private static readonly DEFAULT_PRIORITY;
    /**
     * 默认构造函数
     * @param options 转换器选项
     */
    constructor(options?: TransformOptions);
    /**
     * 注册访问者
     * @param visitor 访问者
     */
    registerVisitor(visitor: TransformerVisitor): void;
    /**
     * 设置输出适配器
     * @param adapter 适配器
     */
    setOutputAdapter(adapter: OutputAdapter): void;
    /**
     * 转换文档
     * @param document 文档
     * @param options 转换选项
     * @returns 转换结果
     */
    transform(document: ProcessedDocument, options?: TransformOptions): any;
    /**
     * 配置转换器
     * @param options 转换选项
     */
    configure(options: TransformOptions): void;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 排序访问者
     * 按优先级从高到低排序，优先级相同的保持注册顺序
     * @private
     */
    private sortVisitors;
    /**
     * 转换节点
     * @param node 节点
     * @param context 上下文
     * @returns 转换结果
     */
    private transformNode;
    /**
     * 获取节点的缓存键
     * @param node 节点
     * @returns 缓存键
     * @private
     */
    private getCacheKey;
    /**
     * 生成节点内容哈希
     * @param node 节点
     * @returns 内容哈希
     * @private
     */
    private generateContentHash;
    /**
     * 从缓存获取结果
     * @param node 节点
     * @returns 缓存的结果或undefined（未命中）
     * @private
     */
    private getCachedResult;
    /**
     * 缓存转换结果
     * @param node 节点
     * @param result 转换结果
     * @private
     */
    private cacheResult;
    /**
     * 转换文档节点
     * @param document 文档节点
     * @param context 上下文
     * @returns 转换结果
     * @private
     */
    private transformDocument;
    /**
     * 合并多个访问者的返回值
     * @param results 所有返回结果数组
     * @param options 转换选项
     * @returns 合并后的结果
     * @private
     */
    private mergeResults;
    /**
     * 合并两个对象
     * @param obj1 第一个对象
     * @param obj2 第二个对象
     * @param options 转换选项
     * @returns 合并后的对象
     * @private
     */
    private mergeObjects;
    /**
     * 转换元素节点
     * @param element 元素节点
     * @param context 上下文
     * @returns 转换结果
     * @private
     */
    private transformElement;
    /**
     * 转换内容节点
     * @param content 内容节点
     * @param context 上下文
     * @returns 转换结果
     * @private
     */
    private transformContent;
    /**
     * 转换引用节点
     * @param reference 引用节点
     * @param context 上下文
     * @returns 转换结果
     * @private
     */
    private transformReference;
    /**
     * 处理节点的子节点
     * 将子节点的转换结果作为数组返回
     * @param node 包含子节点的节点
     * @param context 上下文
     * @returns 子节点转换结果数组
     * @private
     */
    processChildren(node: any, context: TransformContext): any[];
    /**
     * 增加访问者错误计数
     * @param visitor 访问者
     * @private
     */
    private incrementVisitorErrorCount;
    /**
     * 重置访问者错误计数
     * @param visitor 访问者
     * @private
     */
    private resetVisitorErrorCount;
    /**
     * 禁用访问者
     * @param visitor 访问者
     * @private
     */
    private disableVisitor;
    /**
     * 检查访问者是否被禁用
     * @param visitor 访问者
     * @returns 是否被禁用
     * @private
     */
    private isVisitorDisabled;
    /**
     * 增强错误信息，添加更多上下文
     * @param error 原始错误
     * @param visitor 访问者
     * @param nodeType 节点类型
     * @param node 节点
     * @returns 增强后的错误
     * @private
     */
    private enhanceError;
    /**
     * 获取访问者名称
     * @param visitor 访问者
     * @returns 访问者名称
     * @private
     */
    private getVisitorName;
    /**
     * 异步转换文档
     * @param document 文档
     * @param options 转换选项
     * @returns 转换结果的Promise
     */
    transformAsync(document: ProcessedDocument, options?: TransformOptions): Promise<any>;
    /**
     * 异步转换节点
     * @param node 节点
     * @param context 上下文
     * @returns 转换结果的Promise
     * @private
     */
    private transformNodeAsync;
    /**
     * 异步转换文档节点
     * @param document 文档节点
     * @param context 上下文
     * @returns 转换结果的Promise
     * @private
     */
    private transformDocumentAsync;
    /**
     * 异步转换元素节点
     * @param element 元素节点
     * @param context 上下文
     * @returns 转换结果的Promise
     * @private
     */
    private transformElementAsync;
    /**
     * 异步转换内容节点
     * @param content 内容节点
     * @param context 上下文
     * @returns Promise<转换结果>
     * @private
     */
    private transformContentAsync;
    /**
     * 异步转换引用节点
     * @param reference 引用节点
     * @param context 上下文
     * @returns Promise<转换结果>
     * @private
     */
    private transformReferenceAsync;
    /**
     * 获取按优先级排序的访问者列表
     * @param tagName 元素标签名
     * @returns 按优先级排序的访问者列表
     * @private
     */
    private getPrioritizedVisitors;
    /**
     * 获取访问者针对特定标签的优先级
     * @param visitor 访问者
     * @param tagName 标签名
     * @returns 优先级值
     * @private
     */
    private getVisitorPriority;
}
//# sourceMappingURL=defaultTransformer.d.ts.map