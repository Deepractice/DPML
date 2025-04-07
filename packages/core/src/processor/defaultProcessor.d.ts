/**
 * DefaultProcessor实现
 *
 * 提供处理器的默认实现
 */
import { Document } from '../types/node';
import { NodeVisitor, Processor, ProcessorOptions, ProtocolHandler, ReferenceResolver, TagProcessor, TagProcessorRegistry } from './interfaces';
/**
 * 默认处理器实现
 *
 * 负责协调所有访问者的执行，以及文档处理流程
 */
export declare class DefaultProcessor implements Processor {
    /**
     * 注册的访问者列表
     */
    private visitors;
    /**
     * 注册的协议处理器列表
     */
    private protocolHandlers;
    /**
     * 引用解析器
     */
    private referenceResolver;
    /**
     * 处理上下文
     */
    private context;
    /**
     * 处理选项
     */
    private options;
    /**
     * 标签处理器注册表
     */
    private tagProcessorRegistry;
    /**
     * 错误处理器
     */
    private errorHandler;
    /**
     * 构造函数
     * @param options 处理器选项
     */
    constructor(options?: ProcessorOptions);
    /**
     * 注册节点访问者
     * @param visitor 节点访问者
     */
    registerVisitor(visitor: NodeVisitor): void;
    /**
     * 注册协议处理器
     * @param handler 协议处理器
     */
    registerProtocolHandler(handler: ProtocolHandler): void;
    /**
     * 注册标签处理器
     * @param tagName 标签名
     * @param processor 标签处理器
     */
    registerTagProcessor(tagName: string, processor: TagProcessor): void;
    /**
     * 获取标签处理器注册表
     * @returns 标签处理器注册表
     */
    getTagProcessorRegistry(): TagProcessorRegistry;
    /**
     * 设置引用解析器
     * @param resolver 引用解析器
     */
    setReferenceResolver(resolver: ReferenceResolver): void;
    /**
     * 配置处理器
     * @param options 配置选项
     */
    configure(options: ProcessorOptions): void;
    /**
     * 处理文档
     * @param document 待处理的文档
     * @param path 文档路径
     * @returns 处理后的文档
     */
    process(document: Document, path: string): Promise<Document>;
    /**
     * 对访问者进行排序（按优先级从高到低）
     */
    private sortVisitors;
    /**
     * 使用所有访问者访问文档
     * @param document 要处理的文档
     * @param context 处理上下文
     * @returns 处理后的文档
     */
    private visitDocument;
    /**
     * 处理元素
     * @param element 要处理的元素
     * @param context 处理上下文
     * @returns 处理后的元素
     */
    private visitElement;
    /**
     * 处理内容节点
     * @param content 要处理的内容节点
     * @param context 处理上下文
     * @returns 处理后的内容节点
     */
    private visitContent;
    /**
     * 处理引用节点
     * @param reference 要处理的引用节点
     * @param context 处理上下文
     * @returns 处理后的引用节点
     */
    private visitReference;
    /**
     * 根据节点类型分发到对应的访问方法
     * @param node 要处理的节点
     * @param context 处理上下文
     * @returns 处理后的节点
     */
    private visitNode;
}
//# sourceMappingURL=defaultProcessor.d.ts.map