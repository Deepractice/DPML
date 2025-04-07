/**
 * FileProtocolHandler
 *
 * 处理文件协议的引用
 */
import { Reference } from '../../types/node';
import { ProtocolHandler } from '../interfaces';
/**
 * 文件协议处理器选项
 */
export interface FileProtocolHandlerOptions {
    /**
     * 基础目录，用于解析相对路径
     */
    baseDir?: string;
}
/**
 * 文件协议处理器
 * 处理file协议的引用，用于读取文件系统中的文件
 */
export declare class FileProtocolHandler implements ProtocolHandler {
    /**
     * 基础目录，用于解析相对路径
     */
    private baseDir;
    /**
     * 当前上下文路径，用于解析相对引用
     */
    private contextPath?;
    /**
     * 构造函数
     * @param options 选项
     */
    constructor(options?: FileProtocolHandlerOptions);
    /**
     * 设置上下文路径
     * @param contextPath 上下文路径
     */
    setContextPath(contextPath: string): void;
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
    /**
     * 解析文件路径
     * @param filePath 文件路径
     * @returns 解析后的完整路径
     */
    private resolvePath;
}
//# sourceMappingURL=fileProtocolHandler.d.ts.map