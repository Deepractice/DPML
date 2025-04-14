/**
 * 错误级别枚举
 */
export enum ErrorLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'unknown-error',

  // 解析错误
  SYNTAX_ERROR = 'syntax-error',
  INVALID_XML = 'invalid-xml',
  UNCLOSED_TAG = 'unclosed-tag',

  // 验证错误
  INVALID_ATTRIBUTE = 'invalid-attribute',
  MISSING_REQUIRED_ATTRIBUTE = 'missing-required-attribute',
  INVALID_NESTING = 'invalid-nesting',

  // 引用错误
  REFERENCE_NOT_FOUND = 'reference-not-found',
  INVALID_REFERENCE = 'invalid-reference',
  CIRCULAR_REFERENCE = 'circular-reference'
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
export class DPMLError extends Error {
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
  constructor(options: ErrorOptions) {
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
  toString(): string {
    let result = `[${this.code}] ${this.message}`;

    if (this.position) {
      result += ` (at line ${this.position.line}, column ${this.position.column})`;
    }

    return result;
  }

  /**
   * 格式化错误为对象
   */
  toJSON(): Record<string, any> {
    return {
      code: this.code,
      message: this.message,
      level: this.level,
      position: this.position
    };
  }
}

/**
 * 解析错误接口
 */
export interface ParseErrorOptions extends ErrorOptions {
  // 解析特定属性可以在这里扩展
}

/**
 * 解析错误类
 */
export class ParseError extends DPMLError {
  constructor(options: ParseErrorOptions) {
    super(options);
  }
}

/**
 * 验证错误数据接口
 * 定义验证错误的标准数据结构，用于在验证和处理过程中传递错误信息
 */
export interface ValidationError {
  /**
   * 错误码
   */
  code: string;

  /**
   * 错误消息
   */
  message: string;

  /**
   * 错误位置
   */
  position?: any;
}

/**
 * 验证错误选项接口
 * 用于创建验证错误实例
 */
export interface ValidationErrorOptions extends ErrorOptions {
  // 验证特定属性可以在这里扩展
}

/**
 * 验证错误实现类
 * 实现了可抛出的错误类，同时支持转换为ValidationError接口格式
 */
export class ValidationErrorImpl extends DPMLError {
  constructor(options: ValidationErrorOptions) {
    super(options);
  }

  /**
   * 转换为ValidationError接口格式
   */
  toValidationData(): ValidationError {
    return {
      code: this.code,
      message: this.message,
      position: this.position
    };
  }

  /**
   * 从ValidationError创建ValidationErrorImpl实例
   */
  static fromValidationData(data: ValidationError, level: ErrorLevel = ErrorLevel.ERROR): ValidationErrorImpl {
    return new ValidationErrorImpl({
      code: data.code,
      message: data.message,
      level,
      position: data.position
    });
  }
}

// 为了保持向后兼容，导出类型别名和类别名
/**
 * @deprecated 使用 ValidationErrorImpl 替代
 */
export const DefaultValidationError = ValidationErrorImpl;

/**
 * @deprecated 使用 ValidationErrorImpl 替代
 */
export const ValidationError = ValidationErrorImpl;

/**
 * 验证警告接口
 * 用于在验证过程中传递警告信息
 */
export interface ValidationWarning {
  /**
   * 警告码
   */
  code: string;

  /**
   * 警告消息
   */
  message: string;

  /**
   * 警告位置
   */
  position?: any;
}



/**
 * 验证警告实现类
 */
export class ValidationWarningImpl implements ValidationWarning {
  code: string;
  message: string;
  position?: any;

  constructor(warning: ValidationWarning) {
    this.code = warning.code;
    this.message = warning.message;
    this.position = warning.position;
  }
}

// 为了保持向后兼容，导出类型别名
export const ValidationWarningClass = ValidationWarningImpl;

/**
 * 验证结果接口
 * 用于表示验证的最终结果，包含错误和警告
 */
export interface ValidationResult {
  /**
   * 验证是否通过
   */
  valid: boolean;

  /**
   * 验证错误信息
   */
  errors?: ValidationError[];

  /**
   * 验证警告信息
   */
  warnings?: ValidationWarning[];
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
export class ReferenceError extends DPMLError {
  /**
   * 引用URI
   */
  referenceUri?: string;

  constructor(options: ReferenceErrorOptions) {
    super(options);
    this.referenceUri = options.referenceUri;
  }

  /**
   * 将错误转换为字符串
   */
  toString(): string {
    let result = super.toString();

    if (this.referenceUri) {
      result += ` [Reference: ${this.referenceUri}]`;
    }

    return result;
  }

  /**
   * 格式化错误为对象
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      referenceUri: this.referenceUri
    };
  }
}