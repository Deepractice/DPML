/**
 * HttpProtocolHandler
 *
 * 处理HTTP/HTTPS协议的引用
 */
import { Reference } from '../../types/node';
import { ProtocolHandler } from '../interfaces';
/**
 * HTTP协议处理器选项
 */
export interface HttpProtocolHandlerOptions {
    /**
     * 请求超时时间（毫秒）
     */
    timeout?: number;
    /**
     * 是否允许不安全的HTTPS连接
     */
    allowInsecure?: boolean;
}
/**
 * HTTP协议处理器
 * 处理HTTP和HTTPS协议的引用
 */
export declare class HttpProtocolHandler implements ProtocolHandler {
    /**
     * 请求超时时间（毫秒）
     */
    private timeout;
    /**
     * 是否允许不安全的HTTPS连接
     */
    private allowInsecure;
    /**
     * 构造函数
     * @param options 选项
     */
    constructor(options?: HttpProtocolHandlerOptions);
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
//# sourceMappingURL=httpProtocolHandler.d.ts.map