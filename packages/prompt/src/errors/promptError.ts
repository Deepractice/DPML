/**
 * 提示模块错误基类
 */
import { DPMLError, ErrorLevel } from '@dpml/core';

import type { ErrorOptions, ErrorPosition } from '@dpml/core';

/**
 * 提示错误代码枚举
 */
export enum PromptErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'prompt-unknown-error',

  // 解析错误
  PARSE_ERROR = 'prompt-parse-error',
  INVALID_TAG = 'prompt-invalid-tag',
  INVALID_ATTRIBUTE = 'prompt-invalid-attribute',

  // 验证错误
  VALIDATION_ERROR = 'prompt-validation-error',
  MISSING_REQUIRED_TAG = 'prompt-missing-required-tag',
  INVALID_NESTING = 'prompt-invalid-nesting',

  // 处理错误
  PROCESSING_ERROR = 'prompt-processing-error',
  REFERENCE_ERROR = 'prompt-reference-error',
  INHERITANCE_ERROR = 'prompt-inheritance-error',

  // 转换错误
  TRANSFORM_ERROR = 'prompt-transform-error',
  FORMATTER_ERROR = 'prompt-formatter-error',
}

/**
 * 提示错误选项接口
 */
export interface PromptErrorOptions extends ErrorOptions {
  /**
   * 模块上下文
   */
  module?: string;

  /**
   * 阶段
   */
  stage?: 'parse' | 'validate' | 'process' | 'transform';
}

/**
 * 提示错误类
 */
export class PromptError extends DPMLError {
  /**
   * 模块上下文
   */
  module: string;

  /**
   * 处理阶段
   */
  stage?: string;

  /**
   * 构造函数
   */
  constructor(options: PromptErrorOptions) {
    super(options);
    this.module = options.module || 'prompt';
    this.stage = options.stage;

    // 确保正确的原型链
    Object.setPrototypeOf(this, PromptError.prototype);
  }

  /**
   * 将错误转换为字符串
   */
  toString(): string {
    let result = `[${this.code}]`;

    if (this.stage) {
      result += ` [阶段:${this.stage}]`;
    }

    result += ` ${this.message}`;

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
      ...super.toJSON(),
      module: this.module,
      stage: this.stage,
    };
  }

  /**
   * 从任意错误创建PromptError
   */
  static fromError(error: unknown, position?: ErrorPosition): PromptError {
    // 如果已经是PromptError，直接返回
    if (error instanceof PromptError) {
      return error;
    }

    // 如果是DPMLError，转换为PromptError
    if (error instanceof DPMLError) {
      return new PromptError({
        code: error.code,
        message: error.message,
        level: error.level,
        position: error.position,
        cause: error.cause,
      });
    }

    // 否则，创建一个新的PromptError
    const message =
      error instanceof Error ? error.message : String(error || '未知错误');

    return new PromptError({
      code: PromptErrorCode.UNKNOWN_ERROR,
      message,
      level: ErrorLevel.ERROR,
      position,
      cause: error instanceof Error ? error : undefined,
    });
  }
}
