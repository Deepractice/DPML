/**
 * 转换错误类
 */
import { ErrorLevel } from '@dpml/core';

import { PromptError, PromptErrorCode } from './promptError';

import type { PromptErrorOptions } from './promptError';

/**
 * 转换错误选项接口
 */
export interface TransformErrorOptions extends PromptErrorOptions {
  // 转换特定选项可以在这里扩展
  formatter?: string;
  tagName?: string;
}

/**
 * 转换错误类
 */
export class TransformError extends PromptError {
  /**
   * 格式化器名称
   */
  formatter?: string;

  /**
   * 标签名称
   */
  tagName?: string;

  /**
   * 构造函数
   */
  constructor(options: TransformErrorOptions) {
    super({
      ...options,
      stage: 'transform',
      // 如果没有指定代码，使用默认转换错误代码
      code: options.code || PromptErrorCode.TRANSFORM_ERROR,
    });

    this.formatter = options.formatter;
    this.tagName = options.tagName;

    // 确保正确的原型链
    Object.setPrototypeOf(this, TransformError.prototype);
  }

  /**
   * 将错误转换为字符串
   */
  toString(): string {
    let result = super.toString();

    // 添加转换特定信息
    if (this.formatter) {
      result += ` | 格式化器: ${this.formatter}`;
    }

    if (this.tagName) {
      result += ` | 标签: ${this.tagName}`;
    }

    return result;
  }

  /**
   * 格式化错误为对象
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      formatter: this.formatter,
      tagName: this.tagName,
    };
  }

  /**
   * 创建格式化器错误
   */
  static createFormatterError(
    formatter: string,
    error: Error,
    position?: { line: number; column: number; offset: number }
  ): TransformError {
    return new TransformError({
      code: PromptErrorCode.FORMATTER_ERROR,
      message: `格式化器错误 ${formatter}: ${error.message}`,
      level: ErrorLevel.ERROR,
      position,
      cause: error,
      formatter,
    });
  }

  /**
   * 创建无效输入错误
   */
  static createInvalidInputError(
    message: string = '无效的转换输入',
    position?: { line: number; column: number; offset: number }
  ): TransformError {
    return new TransformError({
      code: PromptErrorCode.TRANSFORM_ERROR,
      message,
      level: ErrorLevel.ERROR,
      position,
    });
  }
}
