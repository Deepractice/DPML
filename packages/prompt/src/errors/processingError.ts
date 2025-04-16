/**
 * 处理错误类
 */
import { ErrorLevel } from '@dpml/core';

import { PromptError, PromptErrorCode } from './promptError';

import type { PromptErrorOptions } from './promptError';

/**
 * 处理错误选项接口
 */
export interface ProcessingErrorOptions extends PromptErrorOptions {
  // 处理特定选项可以在这里扩展
  referencePath?: string;
  processorName?: string;
}

/**
 * 处理错误类
 */
export class ProcessingError extends PromptError {
  /**
   * 引用路径
   */
  referencePath?: string;

  /**
   * 处理器名称
   */
  processorName?: string;

  /**
   * 构造函数
   */
  constructor(options: ProcessingErrorOptions) {
    super({
      ...options,
      stage: 'process',
      // 如果没有指定代码，使用默认处理错误代码
      code: options.code || PromptErrorCode.PROCESSING_ERROR,
    });

    this.referencePath = options.referencePath;
    this.processorName = options.processorName;

    // 确保正确的原型链
    Object.setPrototypeOf(this, ProcessingError.prototype);
  }

  /**
   * 将错误转换为字符串
   */
  toString(): string {
    let result = super.toString();

    // 添加处理特定信息
    if (this.processorName) {
      result += ` | 处理器: ${this.processorName}`;
    }

    if (this.referencePath) {
      result += ` | 引用路径: ${this.referencePath}`;
    }

    return result;
  }

  /**
   * 格式化错误为对象
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      referencePath: this.referencePath,
      processorName: this.processorName,
    };
  }

  /**
   * 创建引用错误
   */
  static createReferenceError(
    referencePath: string,
    message?: string,
    position?: { line: number; column: number; offset: number }
  ): ProcessingError {
    return new ProcessingError({
      code: PromptErrorCode.REFERENCE_ERROR,
      message: message || `无法解析引用: ${referencePath}`,
      level: ErrorLevel.ERROR,
      position,
      referencePath,
    });
  }

  /**
   * 创建继承错误
   */
  static createInheritanceError(
    message: string,
    referencePath?: string,
    position?: { line: number; column: number; offset: number }
  ): ProcessingError {
    return new ProcessingError({
      code: PromptErrorCode.INHERITANCE_ERROR,
      message,
      level: ErrorLevel.ERROR,
      position,
      referencePath,
    });
  }

  /**
   * 创建处理器错误
   */
  static createProcessorError(
    processorName: string,
    error: Error,
    position?: { line: number; column: number; offset: number }
  ): ProcessingError {
    return new ProcessingError({
      code: PromptErrorCode.PROCESSING_ERROR,
      message: `处理器错误 ${processorName}: ${error.message}`,
      level: ErrorLevel.ERROR,
      position,
      cause: error,
      processorName,
    });
  }
}
