/**
 * IdProtocolHandler
 *
 * 处理ID协议的引用
 */
import { Reference } from '../../types/node';
import { ProcessingContext, ProtocolHandler } from '../interfaces';
/**
 * ID协议处理器上下文
 */
export interface IdProtocolHandlerContext {
    /**
     * 处理上下文
     */
    processingContext: ProcessingContext;
}
/**
 * ID协议处理器
 * 处理ID协议的引用，用于引用文档内的元素
 */
export declare class IdProtocolHandler implements ProtocolHandler {
    /**
     * 上下文
     */
    private context?;
    /**
     * 设置上下文
     * @param context 上下文
     */
    setContext(context: IdProtocolHandlerContext): void;
    /**
     * 检查是否可以处理指定协议
     * @param protocol 协议名称
     * @returns 是否可以处理
     */
    canHandle(protocol: string): boolean;
    /**
     * 处理引用
     * @param reference 引用节点
     * @returns 解析后的结果
     */
    handle(reference: Reference): Promise<any>;
}
//# sourceMappingURL=idProtocolHandler.d.ts.map