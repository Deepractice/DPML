/**
 * 解析错误类
 */
import { ErrorLevel } from '@dpml/core';
import { PromptError, PromptErrorCode, PromptErrorOptions } from './promptError';

/**
 * 解析错误选项接口
 */
export interface ParseErrorOptions extends PromptErrorOptions {
  // 解析特定选项可以在这里扩展
}

/**
 * 解析错误类
 */
export class ParseError extends PromptError {
  /**
   * 构造函数
   */
  constructor(options: ParseErrorOptions) {
    super({
      ...options,
      stage: 'parse',
      // 如果没有指定代码，使用默认解析错误代码
      code: options.code || PromptErrorCode.PARSE_ERROR
    });
    
    // 确保正确的原型链
    Object.setPrototypeOf(this, ParseError.prototype);
  }
  
  /**
   * 从语法错误创建解析错误
   */
  static fromSyntaxError(error: Error, position?: { line: number; column: number; offset: number }): ParseError {
    return new ParseError({
      code: PromptErrorCode.PARSE_ERROR,
      message: error.message,
      level: ErrorLevel.ERROR,
      position,
      cause: error
    });
  }
  
  /**
   * 创建标签无效错误
   */
  static createInvalidTagError(tagName: string, position?: { line: number; column: number; offset: number }): ParseError {
    return new ParseError({
      code: PromptErrorCode.INVALID_TAG,
      message: `无效的标签: ${tagName}`,
      level: ErrorLevel.ERROR,
      position
    });
  }
  
  /**
   * 创建属性无效错误
   */
  static createInvalidAttributeError(
    attribute: string,
    tagName?: string,
    position?: { line: number; column: number; offset: number }
  ): ParseError {
    const tagInfo = tagName ? `在 ${tagName} 标签上` : '';
    return new ParseError({
      code: PromptErrorCode.INVALID_ATTRIBUTE,
      message: `无效的属性: ${attribute} ${tagInfo}`,
      level: ErrorLevel.ERROR,
      position
    });
  }
} 