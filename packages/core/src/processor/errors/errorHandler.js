/**
 * 错误处理工具类
 *
 * 提供处理各种错误的统一接口
 */
import { ProcessingError, ErrorSeverity } from './processingError';
/**
 * 错误处理程序
 */
export class ErrorHandler {
    /**
     * 构造函数
     * @param options 错误处理选项
     */
    constructor(options) {
        this.strictMode = options?.strictMode ?? false;
        this.errorRecovery = options?.errorRecovery ?? false;
        this.onError = options?.onError;
        this.onWarning = options?.onWarning;
        // 如果没有提供回调，使用默认处理
        if (!this.onWarning) {
            this.onWarning = (warning) => {
                console.warn(warning.getFormattedMessage());
            };
        }
        if (!this.onError) {
            this.onError = (error) => {
                console.error(error.getFormattedMessage());
            };
        }
    }
    /**
     * 设置当前处理的文件路径
     * @param filePath 文件路径
     */
    setCurrentFilePath(filePath) {
        this.currentFilePath = filePath;
    }
    /**
     * 设置严格模式
     * @param strict 是否启用严格模式
     */
    setStrictMode(strict) {
        this.strictMode = strict;
    }
    /**
     * 获取严格模式状态
     */
    isStrictMode() {
        return this.strictMode;
    }
    /**
     * 设置错误恢复模式
     * @param recovery 是否启用错误恢复
     */
    setErrorRecovery(recovery) {
        this.errorRecovery = recovery;
    }
    /**
     * 是否启用错误恢复
     */
    isErrorRecoveryEnabled() {
        return this.errorRecovery;
    }
    /**
     * 处理错误
     * @param error 错误对象或消息
     * @param node 相关节点
     * @param context 处理上下文
     * @param severity 错误严重级别
     * @param code 错误码
     */
    handleError(error, node, context, severity, code) {
        // 确定错误严重级别
        const effectiveSeverity = severity || ErrorSeverity.ERROR;
        // 获取节点位置
        let position;
        if (node && 'position' in node) {
            position = node.position;
        }
        // 获取错误消息
        const message = typeof error === 'string' ? error : error.message;
        // 创建处理错误
        const processingError = new ProcessingError({
            message,
            position,
            filePath: this.currentFilePath || context?.filePath,
            severity: effectiveSeverity,
            code,
            cause: typeof error === 'string' ? undefined : error
        });
        // 根据严格模式和错误级别决定如何处理
        if (this.strictMode && effectiveSeverity === ErrorSeverity.ERROR) {
            // 严格模式下，将错误级别的错误升级为致命错误
            processingError.asFatal();
        }
        // 根据错误级别处理
        if (processingError.severity === ErrorSeverity.WARNING) {
            // 如果是警告，调用警告回调
            this.onWarning?.(processingError);
        }
        else if (processingError.severity === ErrorSeverity.ERROR) {
            // 如果是错误，调用错误回调
            this.onError?.(processingError);
            // 如果未启用错误恢复，抛出错误
            if (!this.errorRecovery) {
                throw processingError;
            }
        }
        else {
            // 如果是致命错误，总是抛出
            this.onError?.(processingError);
            throw processingError;
        }
    }
    /**
     * 从上下文中获取当前模式
     * @param context 处理上下文
     * @param element
     * @returns 是否为严格模式
     */
    getModeFromContext(context, element) {
        // 如果提供了元素，检查元素的mode属性
        if (element && element.attributes && element.attributes.mode) {
            return element.attributes.mode === 'strict';
        }
        // 检查上下文中记录的模式
        if (context.documentMode !== undefined) {
            return context.documentMode === 'strict';
        }
        // 默认使用处理器的严格模式设置
        return this.strictMode;
    }
    /**
     * 根据上下文处理错误
     * @param error 错误对象或消息
     * @param node 相关节点
     * @param context 处理上下文
     * @param code 错误码
     */
    handleErrorWithContext(error, node, context, code) {
        // 获取当前模式
        const isStrict = this.getModeFromContext(context, node.type === 'element' ? node : undefined);
        // 根据当前模式决定错误严重级别
        const severity = isStrict ? ErrorSeverity.ERROR : ErrorSeverity.WARNING;
        // 处理错误
        this.handleError(error, node, context, severity, code);
    }
    /**
     * 处理警告
     * @param warning 警告消息
     * @param node 相关节点
     * @param context 处理上下文
     * @param code 警告码
     */
    handleWarning(warning, node, context, code) {
        // 调用handleError但指定警告级别
        this.handleError(warning, node, context, ErrorSeverity.WARNING, code);
    }
    /**
     * 处理致命错误
     * @param error 错误对象或消息
     * @param node 相关节点
     * @param context 处理上下文
     * @param code 错误码
     */
    handleFatalError(error, node, context, code) {
        // 调用handleError但指定致命级别，此函数总是抛出错误
        this.handleError(error, node, context, ErrorSeverity.FATAL, code);
        // 这行代码永远不会执行，但TypeScript需要它
        throw new Error('Fatal error');
    }
}
//# sourceMappingURL=errorHandler.js.map