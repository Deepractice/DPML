/**
 * 验证错误类
 */
import { ErrorLevel } from '@dpml/core';
import { PromptError, PromptErrorCode, PromptErrorOptions } from './promptError';

/**
 * 验证错误选项接口
 */
export interface ValidationErrorOptions extends PromptErrorOptions {
  // 验证特定选项可以在这里扩展
  tagName?: string;
  attributeName?: string;
  expectedValue?: string | string[];
  actualValue?: string;
}

/**
 * 验证错误类
 */
export class ValidationError extends PromptError {
  /**
   * 标签名
   */
  tagName?: string;
  
  /**
   * 属性名
   */
  attributeName?: string;
  
  /**
   * 预期值
   */
  expectedValue?: string | string[];
  
  /**
   * 实际值
   */
  actualValue?: string;
  
  /**
   * 构造函数
   */
  constructor(options: ValidationErrorOptions) {
    super({
      ...options,
      stage: 'validate',
      // 如果没有指定代码，使用默认验证错误代码
      code: options.code || PromptErrorCode.VALIDATION_ERROR
    });
    
    this.tagName = options.tagName;
    this.attributeName = options.attributeName;
    this.expectedValue = options.expectedValue;
    this.actualValue = options.actualValue;
    
    // 确保正确的原型链
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  /**
   * 将错误转换为字符串
   */
  toString(): string {
    let result = super.toString();
    
    // 添加验证特定信息
    if (this.tagName) {
      result += ` | 标签: ${this.tagName}`;
    }
    
    if (this.attributeName) {
      result += ` | 属性: ${this.attributeName}`;
    }
    
    if (this.expectedValue !== undefined) {
      const expected = Array.isArray(this.expectedValue) 
        ? this.expectedValue.join(', ') 
        : this.expectedValue;
      result += ` | 预期: ${expected}`;
    }
    
    if (this.actualValue !== undefined) {
      result += ` | 实际: ${this.actualValue}`;
    }
    
    return result;
  }
  
  /**
   * 格式化错误为对象
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      tagName: this.tagName,
      attributeName: this.attributeName,
      expectedValue: this.expectedValue,
      actualValue: this.actualValue
    };
  }
  
  /**
   * 创建属性无效错误
   */
  static createInvalidAttributeError(
    attributeName: string,
    tagName?: string,
    position?: { line: number; column: number; offset: number }
  ): ValidationError {
    return new ValidationError({
      code: PromptErrorCode.INVALID_ATTRIBUTE,
      message: `无效的属性: ${attributeName}${tagName ? ` 在 ${tagName} 标签上` : ''}`,
      level: ErrorLevel.ERROR,
      position,
      tagName,
      attributeName
    });
  }
  
  /**
   * 创建缺少必需标签错误
   */
  static createMissingRequiredTagError(
    tagName: string,
    parentTagName?: string,
    position?: { line: number; column: number; offset: number }
  ): ValidationError {
    return new ValidationError({
      code: PromptErrorCode.MISSING_REQUIRED_TAG,
      message: `缺少必需的标签: ${tagName}${parentTagName ? ` 在 ${parentTagName} 内` : ''}`,
      level: ErrorLevel.ERROR,
      position,
      tagName
    });
  }
  
  /**
   * 创建无效嵌套错误
   */
  static createInvalidNestingError(
    childTagName: string,
    parentTagName: string,
    position?: { line: number; column: number; offset: number }
  ): ValidationError {
    return new ValidationError({
      code: PromptErrorCode.INVALID_NESTING,
      message: `无效的嵌套: ${childTagName} 不能嵌套在 ${parentTagName} 内`,
      level: ErrorLevel.ERROR,
      position,
      tagName: childTagName
    });
  }
} 