/**
 * 错误处理工具类
 *
 * 提供处理各种错误的统一接口
 */

import type { Node, Element, SourcePosition } from '@core/types/node';

import { ProcessingError, ErrorSeverity } from './processingError';

import type { ProcessingContext } from '../processingContext';

/**
 * 错误处理配置选项
 */
export interface ErrorHandlerOptions {
  /**
   * 是否启用严格模式
   * 默认: false
   */
  strictMode?: boolean;

  /**
   * 是否启用错误恢复
   * 默认: false
   */
  errorRecovery?: boolean;

  /**
   * 错误回调函数
   */
  onError?: (error: ProcessingError) => void;

  /**
   * 警告回调函数
   */
  onWarning?: (warning: ProcessingError) => void;
}

/**
 * 错误处理程序
 */
export class ErrorHandler {
  /**
   * 是否启用严格模式
   */
  private strictMode: boolean;

  /**
   * 是否启用错误恢复
   */
  private errorRecovery: boolean;

  /**
   * 错误回调函数
   */
  private onError?: (error: ProcessingError) => void;

  /**
   * 警告回调函数
   */
  private onWarning?: (warning: ProcessingError) => void;

  /**
   * 当前处理的文件路径
   */
  private currentFilePath?: string;

  /**
   * 构造函数
   * @param options 错误处理选项
   */
  constructor(options?: ErrorHandlerOptions) {
    this.strictMode = options?.strictMode ?? false;
    this.errorRecovery = options?.errorRecovery ?? false;
    this.onError = options?.onError;
    this.onWarning = options?.onWarning;

    // 如果没有提供回调，使用默认处理
    if (!this.onWarning) {
      this.onWarning = warning => {
        console.warn(warning.getFormattedMessage());
      };
    }

    if (!this.onError) {
      this.onError = error => {
        console.error(error.getFormattedMessage());
      };
    }
  }

  /**
   * 设置当前处理的文件路径
   * @param filePath 文件路径
   */
  public setCurrentFilePath(filePath: string): void {
    this.currentFilePath = filePath;
  }

  /**
   * 设置严格模式
   * @param strict 是否启用严格模式
   */
  public setStrictMode(strict: boolean): void {
    this.strictMode = strict;
  }

  /**
   * 获取严格模式状态
   */
  public isStrictMode(): boolean {
    return this.strictMode;
  }

  /**
   * 设置错误恢复模式
   * @param recovery 是否启用错误恢复
   */
  public setErrorRecovery(recovery: boolean): void {
    this.errorRecovery = recovery;
  }

  /**
   * 是否启用错误恢复
   */
  public isErrorRecoveryEnabled(): boolean {
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
  public handleError(
    error: Error | string,
    node?: Node,
    context?: ProcessingContext,
    severity?: ErrorSeverity,
    code?: string
  ): void {
    // 获取节点位置
    let position: SourcePosition | undefined;

    if (node && 'position' in node) {
      position = node.position;
    }

    // 如果已经是ProcessingError且是致命错误，立即抛出
    if (
      error instanceof ProcessingError &&
      error.severity === ErrorSeverity.FATAL
    ) {
      // 如果是致命错误，首先调用onError回调，然后总是抛出
      this.onError?.(error);
      throw error;
    }

    // 如果已经是ProcessingError，保留其严重级别
    if (error instanceof ProcessingError) {
      const processingError = error;

      // 如果明确提供了严重级别，则覆盖
      if (severity) {
        processingError.severity = severity;
      }

      // 更新其他属性
      if (position && !processingError.position) {
        processingError.position = position;
      }

      if (this.currentFilePath && !processingError.filePath) {
        processingError.filePath = this.currentFilePath;
      }

      if (code && !processingError.code) {
        processingError.code = code;
      }

      // 根据严格模式和错误级别决定如何处理
      if (this.strictMode && processingError.severity === ErrorSeverity.ERROR) {
        // 严格模式下，将错误级别的错误升级为致命错误
        processingError.asFatal();
      }

      // 根据错误级别处理
      if (processingError.severity === ErrorSeverity.WARNING) {
        // 如果是警告，调用警告回调
        this.onWarning?.(processingError);
      } else if (processingError.severity === ErrorSeverity.ERROR) {
        // 如果是错误，调用错误回调
        this.onError?.(processingError);

        // 如果未启用错误恢复，抛出错误
        if (!this.errorRecovery) {
          throw processingError;
        }
      } else if (processingError.severity === ErrorSeverity.FATAL) {
        // 如果是致命错误，无论是否错误恢复都抛出
        this.onError?.(processingError);
        throw processingError;
      }

      return;
    }

    // 确定错误严重级别
    const effectiveSeverity = severity || ErrorSeverity.ERROR;

    // 获取错误消息
    const message = typeof error === 'string' ? error : error.message;

    // 创建处理错误
    const processingError = new ProcessingError({
      message,
      position,
      filePath: this.currentFilePath || context?.filePath,
      severity: effectiveSeverity,
      code,
      cause: typeof error === 'string' ? undefined : error,
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
    } else if (processingError.severity === ErrorSeverity.ERROR) {
      // 如果是错误，调用错误回调
      this.onError?.(processingError);

      // 如果未启用错误恢复，抛出错误
      if (!this.errorRecovery) {
        throw processingError;
      }
    } else if (processingError.severity === ErrorSeverity.FATAL) {
      // 如果是致命错误，无论是否错误恢复都抛出
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
  public getModeFromContext(
    context: ProcessingContext,
    element?: Element
  ): boolean {
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
  public handleErrorWithContext(
    error: Error | string,
    node: Node,
    context: ProcessingContext,
    code?: string
  ): void {
    // 获取当前模式
    const isStrict = this.getModeFromContext(
      context,
      node.type === 'element' ? (node as Element) : undefined
    );

    // 如果是ProcessingError并且已经有严重性设置，使用它
    let severity: ErrorSeverity;

    if (error instanceof ProcessingError) {
      severity = error.severity;
    } else {
      // 根据当前模式决定错误严重级别
      severity = isStrict ? ErrorSeverity.ERROR : ErrorSeverity.WARNING;
    }

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
  public handleWarning(
    warning: string,
    node?: Node,
    context?: ProcessingContext,
    code?: string
  ): void {
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
  public handleFatalError(
    error: Error | string,
    node?: Node,
    context?: ProcessingContext,
    code?: string
  ): never {
    // 这个方法总是抛出异常，所以返回类型是never

    // 使用handleError，但强制设置严重级别为FATAL
    try {
      this.handleError(error, node, context, ErrorSeverity.FATAL, code);
    } catch (e) {
      // 确保抛出
      throw e;
    }

    // 正常情况下这行代码永远不会执行，因为上面应该抛出异常
    // 但为了类型安全，确保始终抛出异常
    throw typeof error === 'string'
      ? new ProcessingError({
        message: error,
        severity: ErrorSeverity.FATAL,
        code,
      })
      : error;
  }
}
