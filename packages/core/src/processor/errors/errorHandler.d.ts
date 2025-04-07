/**
 * 错误处理工具类
 *
 * 提供处理各种错误的统一接口
 */
import { Node, Element } from '../../types/node';
import { ProcessingError, ErrorSeverity } from './processingError';
import { ProcessingContext } from '../processingContext';
/**
 * 错误处理配置选项
 */
export interface ErrorHandlerOptions {
    /**
     * 是否启用严格模式
     * 默认: false
     */
    strictMode?: boolean;
    /**
     * 是否启用错误恢复
     * 默认: false
     */
    errorRecovery?: boolean;
    /**
     * 错误回调函数
     */
    onError?: (error: ProcessingError) => void;
    /**
     * 警告回调函数
     */
    onWarning?: (warning: ProcessingError) => void;
}
/**
 * 错误处理程序
 */
export declare class ErrorHandler {
    /**
     * 是否启用严格模式
     */
    private strictMode;
    /**
     * 是否启用错误恢复
     */
    private errorRecovery;
    /**
     * 错误回调函数
     */
    private onError?;
    /**
     * 警告回调函数
     */
    private onWarning?;
    /**
     * 当前处理的文件路径
     */
    private currentFilePath?;
    /**
     * 构造函数
     * @param options 错误处理选项
     */
    constructor(options?: ErrorHandlerOptions);
    /**
     * 设置当前处理的文件路径
     * @param filePath 文件路径
     */
    setCurrentFilePath(filePath: string): void;
    /**
     * 设置严格模式
     * @param strict 是否启用严格模式
     */
    setStrictMode(strict: boolean): void;
    /**
     * 获取严格模式状态
     */
    isStrictMode(): boolean;
    /**
     * 设置错误恢复模式
     * @param recovery 是否启用错误恢复
     */
    setErrorRecovery(recovery: boolean): void;
    /**
     * 是否启用错误恢复
     */
    isErrorRecoveryEnabled(): boolean;
    /**
     * 处理错误
     * @param error 错误对象或消息
     * @param node 相关节点
     * @param context 处理上下文
     * @param severity 错误严重级别
     * @param code 错误码
     */
    handleError(error: Error | string, node?: Node, context?: ProcessingContext, severity?: ErrorSeverity, code?: string): void;
    /**
     * 从上下文中获取当前模式
     * @param context 处理上下文
     * @param element
     * @returns 是否为严格模式
     */
    getModeFromContext(context: ProcessingContext, element?: Element): boolean;
    /**
     * 根据上下文处理错误
     * @param error 错误对象或消息
     * @param node 相关节点
     * @param context 处理上下文
     * @param code 错误码
     */
    handleErrorWithContext(error: Error | string, node: Node, context: ProcessingContext, code?: string): void;
    /**
     * 处理警告
     * @param warning 警告消息
     * @param node 相关节点
     * @param context 处理上下文
     * @param code 警告码
     */
    handleWarning(warning: string, node?: Node, context?: ProcessingContext, code?: string): void;
    /**
     * 处理致命错误
     * @param error 错误对象或消息
     * @param node 相关节点
     * @param context 处理上下文
     * @param code 错误码
     */
    handleFatalError(error: Error | string, node?: Node, context?: ProcessingContext, code?: string): never;
}
//# sourceMappingURL=errorHandler.d.ts.map