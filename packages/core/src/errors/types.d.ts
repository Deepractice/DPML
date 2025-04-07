/**
 * 错误级别枚举
 */
export declare enum ErrorLevel {
    FATAL = "fatal",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}
/**
 * 错误代码枚举
 */
export declare enum ErrorCode {
    UNKNOWN_ERROR = "unknown-error",
    SYNTAX_ERROR = "syntax-error",
    INVALID_XML = "invalid-xml",
    UNCLOSED_TAG = "unclosed-tag",
    INVALID_ATTRIBUTE = "invalid-attribute",
    MISSING_REQUIRED_ATTRIBUTE = "missing-required-attribute",
    INVALID_NESTING = "invalid-nesting",
    REFERENCE_NOT_FOUND = "reference-not-found",
    INVALID_REFERENCE = "invalid-reference",
    CIRCULAR_REFERENCE = "circular-reference"
}
/**
 * 错误位置接口
 */
export interface ErrorPosition {
    line: number;
    column: number;
    offset: number;
}
/**
 * 错误选项接口
 */
export interface ErrorOptions {
    code: string;
    message: string;
    level?: ErrorLevel;
    position?: ErrorPosition;
    cause?: Error;
}
/**
 * DPML基础错误类
 */
export declare class DPMLError extends Error {
    /**
     * 错误码
     */
    code: string;
    /**
     * 错误级别
     */
    level: ErrorLevel;
    /**
     * 错误位置
     */
    position?: ErrorPosition;
    /**
     * 原始错误
     */
    cause?: Error;
    /**
     * 构造函数
     */
    constructor(options: ErrorOptions);
    /**
     * 将错误转换为字符串
     */
    toString(): string;
    /**
     * 格式化错误为对象
     */
    toJSON(): Record<string, any>;
}
/**
 * 解析错误接口
 */
export interface ParseErrorOptions extends ErrorOptions {
}
/**
 * 解析错误类
 */
export declare class ParseError extends DPMLError {
    constructor(options: ParseErrorOptions);
}
/**
 * 验证错误接口
 */
export interface ValidationErrorOptions extends ErrorOptions {
}
/**
 * 验证错误类
 */
export declare class ValidationError extends DPMLError {
    constructor(options: ValidationErrorOptions);
}
/**
 * 引用错误接口
 */
export interface ReferenceErrorOptions extends ErrorOptions {
    referenceUri?: string;
}
/**
 * 引用错误类
 */
export declare class ReferenceError extends DPMLError {
    /**
     * 引用URI
     */
    referenceUri?: string;
    constructor(options: ReferenceErrorOptions);
    /**
     * 将错误转换为字符串
     */
    toString(): string;
    /**
     * 格式化错误为对象
     */
    toJSON(): Record<string, any>;
}
//# sourceMappingURL=types.d.ts.map