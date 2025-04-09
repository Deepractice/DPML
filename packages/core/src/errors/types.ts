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
 * 用于定义验证错误的标准数据结构
 * 
 * 注意：这是一个数据接口，不是错误类。
 * DefaultValidationError类是一个可抛出的错误对象。
 * 这个接口用于Tag验证等场景中传递验证错误信息。
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
 * 验证错误接口
 */
export interface ValidationErrorOptions extends ErrorOptions {
  // 验证特定属性可以在这里扩展
}

/**
 * 验证错误类
 */
export class DefaultValidationError extends DPMLError {
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
   * 从ValidationError创建DefaultValidationError实例
   */
  static fromValidationData(data: ValidationError, level: ErrorLevel = ErrorLevel.ERROR): DefaultValidationError {
    return new DefaultValidationError({
      code: data.code,
      message: data.message,
      level,
      position: data.position
    });
  }
}

// 为了保持向后兼容，导出旧的类名
/**
 * @deprecated 使用 DefaultValidationError 替代
 */
export const ValidationError = DefaultValidationError;

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