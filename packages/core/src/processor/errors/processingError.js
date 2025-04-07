/**
 * 处理错误基类
 *
 * 提供处理过程中统一的错误类型
 */
/**
 * 处理错误严重级别
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    /**
     * 警告 - 不会中断处理流程
     */
    ErrorSeverity["WARNING"] = "warning";
    /**
     * 错误 - 在严格模式下会中断处理
     */
    ErrorSeverity["ERROR"] = "error";
    /**
     * 致命错误 - 总是中断处理流程
     */
    ErrorSeverity["FATAL"] = "fatal";
})(ErrorSeverity || (ErrorSeverity = {}));
/**
 * 处理错误类
 *
 * 用于统一表示处理过程中的错误，包含位置和文件路径信息
 */
export class ProcessingError extends Error {
    /**
     * 构造函数
     * @param options 错误选项
     */
    constructor(options) {
        // 构造基础错误消息
        super(options.message);
        // 设置错误名称
        this.name = 'ProcessingError';
        // 设置错误属性
        this.position = options.position;
        this.filePath = options.filePath;
        this.severity = options.severity || ErrorSeverity.ERROR;
        this.code = options.code;
        this.cause = options.cause;
        // 捕获堆栈跟踪
        // Node.js 特性，浏览器环境可能不支持
        // @ts-ignore
        if (Error.captureStackTrace) {
            // @ts-ignore
            Error.captureStackTrace(this, ProcessingError);
        }
    }
    /**
     * 获取格式化的错误信息
     * 包含位置和文件信息
     */
    getFormattedMessage() {
        // 基础错误信息
        let message = this.message;
        // 添加文件信息
        if (this.filePath) {
            message = `${message} (文件: ${this.filePath})`;
        }
        // 添加位置信息
        if (this.position) {
            message = `${message} (位置: 第${this.position.start.line}行, 第${this.position.start.column}列)`;
        }
        // 添加错误码
        if (this.code) {
            message = `[${this.code}] ${message}`;
        }
        // 添加严重级别
        message = `${this.severity.toUpperCase()}: ${message}`;
        return message;
    }
    /**
     * 判断错误是否为致命错误
     */
    isFatal() {
        return this.severity === ErrorSeverity.FATAL;
    }
    /**
     * 转换为警告级别错误
     */
    asWarning() {
        this.severity = ErrorSeverity.WARNING;
        return this;
    }
    /**
     * 转换为错误级别
     */
    asError() {
        this.severity = ErrorSeverity.ERROR;
        return this;
    }
    /**
     * 转换为致命错误级别
     */
    asFatal() {
        this.severity = ErrorSeverity.FATAL;
        return this;
    }
}
//# sourceMappingURL=processingError.js.map