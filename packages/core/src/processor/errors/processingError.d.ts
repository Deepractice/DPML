/**
 * 处理错误基类
 *
 * 提供处理过程中统一的错误类型
 */
import { SourcePosition } from '../../types/node';
/**
 * 处理错误严重级别
 */
export declare enum ErrorSeverity {
    /**
     * 警告 - 不会中断处理流程
     */
    WARNING = "warning",
    /**
     * 错误 - 在严格模式下会中断处理
     */
    ERROR = "error",
    /**
     * 致命错误 - 总是中断处理流程
     */
    FATAL = "fatal"
}
/**
 * 处理错误选项
 */
export interface ProcessingErrorOptions {
    /**
     * 错误消息
     */
    message: string;
    /**
     * 错误位置
     */
    position?: SourcePosition;
    /**
     * 文件路径
     */
    filePath?: string;
    /**
     * 错误严重级别
     */
    severity?: ErrorSeverity;
    /**
     * 错误码
     */
    code?: string;
    /**
     * 原始错误
     */
    cause?: Error;
}
/**
 * 处理错误类
 *
 * 用于统一表示处理过程中的错误，包含位置和文件路径信息
 */
export declare class ProcessingError extends Error {
    /**
     * 错误位置
     */
    position?: SourcePosition;
    /**
     * 文件路径
     */
    filePath?: string;
    /**
     * 错误严重级别
     */
    severity: ErrorSeverity;
    /**
     * 错误码
     */
    code?: string;
    /**
     * 原始错误
     */
    cause?: Error;
    /**
     * 构造函数
     * @param options 错误选项
     */
    constructor(options: ProcessingErrorOptions);
    /**
     * 获取格式化的错误信息
     * 包含位置和文件信息
     */
    getFormattedMessage(): string;
    /**
     * 判断错误是否为致命错误
     */
    isFatal(): boolean;
    /**
     * 转换为警告级别错误
     */
    asWarning(): ProcessingError;
    /**
     * 转换为错误级别
     */
    asError(): ProcessingError;
    /**
     * 转换为致命错误级别
     */
    asFatal(): ProcessingError;
}
//# sourceMappingURL=processingError.d.ts.map