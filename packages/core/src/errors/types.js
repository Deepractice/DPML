/**
 * 错误级别枚举
 */
export var ErrorLevel;
(function (ErrorLevel) {
    ErrorLevel["FATAL"] = "fatal";
    ErrorLevel["ERROR"] = "error";
    ErrorLevel["WARNING"] = "warning";
    ErrorLevel["INFO"] = "info";
})(ErrorLevel || (ErrorLevel = {}));
/**
 * 错误代码枚举
 */
export var ErrorCode;
(function (ErrorCode) {
    // 通用错误
    ErrorCode["UNKNOWN_ERROR"] = "unknown-error";
    // 解析错误
    ErrorCode["SYNTAX_ERROR"] = "syntax-error";
    ErrorCode["INVALID_XML"] = "invalid-xml";
    ErrorCode["UNCLOSED_TAG"] = "unclosed-tag";
    // 验证错误
    ErrorCode["INVALID_ATTRIBUTE"] = "invalid-attribute";
    ErrorCode["MISSING_REQUIRED_ATTRIBUTE"] = "missing-required-attribute";
    ErrorCode["INVALID_NESTING"] = "invalid-nesting";
    // 引用错误
    ErrorCode["REFERENCE_NOT_FOUND"] = "reference-not-found";
    ErrorCode["INVALID_REFERENCE"] = "invalid-reference";
    ErrorCode["CIRCULAR_REFERENCE"] = "circular-reference";
})(ErrorCode || (ErrorCode = {}));
/**
 * DPML基础错误类
 */
export class DPMLError extends Error {
    /**
     * 构造函数
     */
    constructor(options) {
        super(options.message);
        this.name = this.constructor.name;
        this.code = options.code;
        this.level = options.level || ErrorLevel.ERROR;
        this.position = options.position;
        this.cause = options.cause;
        // 确保正确的原型链，因为TypeScript的类继承在转换为ES5时可能出现问题
        Object.setPrototypeOf(this, new.target.prototype);
    }
    /**
     * 将错误转换为字符串
     */
    toString() {
        let result = `[${this.code}] ${this.message}`;
        if (this.position) {
            result += ` (at line ${this.position.line}, column ${this.position.column})`;
        }
        return result;
    }
    /**
     * 格式化错误为对象
     */
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            level: this.level,
            position: this.position
        };
    }
}
/**
 * 解析错误类
 */
export class ParseError extends DPMLError {
    constructor(options) {
        super(options);
    }
}
/**
 * 验证错误类
 */
export class ValidationError extends DPMLError {
    constructor(options) {
        super(options);
    }
}
/**
 * 引用错误类
 */
export class ReferenceError extends DPMLError {
    constructor(options) {
        super(options);
        this.referenceUri = options.referenceUri;
    }
    /**
     * 将错误转换为字符串
     */
    toString() {
        let result = super.toString();
        if (this.referenceUri) {
            result += ` [Reference: ${this.referenceUri}]`;
        }
        return result;
    }
    /**
     * 格式化错误为对象
     */
    toJSON() {
        return {
            ...super.toJSON(),
            referenceUri: this.referenceUri
        };
    }
}
//# sourceMappingURL=types.js.map