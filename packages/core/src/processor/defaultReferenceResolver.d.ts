/**
 * DefaultReferenceResolver实现
 *
 * 提供引用解析的默认实现
 */
import { Reference } from '../types/node';
import { ProcessingContext, ProtocolHandler, ReferenceResolver, ResolvedReference } from './interfaces';
/**
 * 默认引用解析器选项
 */
export interface DefaultReferenceResolverOptions {
    /**
     * 默认协议处理器
     */
    defaultProtocolHandlers?: ProtocolHandler[];
    /**
     * 是否使用缓存
     */
    useCache?: boolean;
}
/**
 * 默认引用解析器实现
 */
export declare class DefaultReferenceResolver implements ReferenceResolver {
    /**
     * 协议处理器列表
     */
    private protocolHandlers;
    /**
     * 是否使用缓存
     */
    private useCache;
    /**
     * 构造函数
     * @param options 配置选项
     */
    constructor(options?: DefaultReferenceResolverOptions);
    /**
     * 注册协议处理器
     * @param handler 协议处理器
     */
    registerProtocolHandler(handler: ProtocolHandler): void;
    /**
     * 获取指定协议的处理器
     * @param protocol 协议名称
     * @returns 协议处理器，未找到则返回undefined
     */
    getProtocolHandler(protocol: string): ProtocolHandler | undefined;
    /**
     * 解析引用
     * @param reference 引用节点
     * @param context 处理上下文
     * @returns 解析后的引用
     */
    resolve(reference: Reference, context: ProcessingContext): Promise<ResolvedReference>;
}
//# sourceMappingURL=defaultReferenceResolver.d.ts.map