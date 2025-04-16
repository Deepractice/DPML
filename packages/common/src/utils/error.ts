/**
 * 错误处理工具模块
 *
 * 提供错误类型定义和错误处理工具函数。
 */

/**
 * 基础错误类，所有自定义错误的基类
 */
export class DpmlError extends Error {
  /** 错误码 */
  code: string;
  /** 错误上下文信息 */
  context?: Record<string, unknown>;
  /** 原始错误(如果这是包装错误) */
  cause?: Error;

  /**
   * 创建一个DPML错误
   * @param message 错误消息
   * @param code 错误码
   * @param context 上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code = 'DPML_ERROR',
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.cause = cause;

    // 修复继承链中的原型链错误，确保instanceof正常工作
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * 获取格式化的错误消息，包含错误码和上下文
   */
  format(): string {
    let result = `[${this.code}] ${this.message}`;

    if (this.context && Object.keys(this.context).length > 0) {
      try {
        const contextStr = JSON.stringify(this.context);
        result += `\nContext: ${contextStr}`;
      } catch {
        // 忽略序列化错误
      }
    }

    if (this.cause) {
      result += `\nCaused by: ${this.cause.message}`;
    }

    return result;
  }
}

/**
 * 验证错误，表示输入验证失败
 */
export class ValidationError extends DpmlError {
  /**
   * 创建一个验证错误
   * @param message 错误消息
   * @param context 上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'VALIDATION_ERROR', context, cause);
  }
}

/**
 * 配置错误，表示配置问题
 */
export class ConfigurationError extends DpmlError {
  /**
   * 创建一个配置错误
   * @param message 错误消息
   * @param context 上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'CONFIG_ERROR', context, cause);
  }
}

/**
 * 网络错误，表示网络请求问题
 */
export class NetworkError extends DpmlError {
  /** HTTP状态码 */
  statusCode?: number;

  /**
   * 创建一个网络错误
   * @param message 错误消息
   * @param statusCode HTTP状态码
   * @param context 上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    statusCode?: number,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'NETWORK_ERROR', context, cause);
    this.statusCode = statusCode;
  }

  /**
   * 获取格式化的错误消息，包含状态码
   */
  override format(): string {
    let result = super.format();
    if (this.statusCode) {
      result = result.replace('[NETWORK_ERROR]', `[NETWORK_ERROR ${this.statusCode}]`);
    }
    return result;
  }
}

/**
 * 超时错误，表示操作超时
 */
export class TimeoutError extends DpmlError {
  /**
   * 创建一个超时错误
   * @param message 错误消息
   * @param context 上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'TIMEOUT_ERROR', context, cause);
  }
}

/**
 * 权限错误，表示权限不足
 */
export class PermissionError extends DpmlError {
  /**
   * 创建一个权限错误
   * @param message 错误消息
   * @param context 上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'PERMISSION_ERROR', context, cause);
  }
}

/**
 * 未找到错误，表示资源不存在
 */
export class NotFoundError extends DpmlError {
  /**
   * 创建一个未找到错误
   * @param message 错误消息
   * @param context 上下文信息
   * @param cause 原始错误
   */
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'NOT_FOUND_ERROR', context, cause);
  }
}

/**
 * 格式化错误堆栈以提高可读性
 * @param error 错误对象
 * @returns 格式化后的错误堆栈
 */
export function formatErrorStack(error: Error): string {
  if (!error.stack) {
    return error.message;
  }

  // 分割堆栈并提取有用信息
  const lines = error.stack.split('\n');

  // 移除内部框架和库路径
  const filteredLines = lines.filter(line => {
    return !line.includes('node_modules') &&
           !line.includes('internal') &&
           !line.includes('at Module._compile') &&
           !line.includes('at Module.') &&
           !line.includes('at require');
  });

  return filteredLines.join('\n');
}

/**
 * 将错误转换为DPML错误
 * @param error 原始错误或错误消息
 * @param code 错误码
 * @param context 上下文信息
 * @returns DPML错误
 */
export function toDpmlError(
  error: unknown,
  code = 'UNKNOWN_ERROR',
  context?: Record<string, unknown>
): DpmlError {
  if (error instanceof DpmlError) {
    return error;
  }

  if (error instanceof Error) {
    return new DpmlError(error.message, code, context, error);
  }

  return new DpmlError(
    typeof error === 'string' ? error : 'Unknown error occurred',
    code,
    context
  );
}

/**
 * 安全地执行函数，捕获并处理错误
 * @param fn 要执行的函数
 * @param errorHandler 错误处理函数
 * @returns 函数执行结果或错误处理返回值
 */
export function tryCatch<T, E = unknown>(
  fn: () => T,
  errorHandler: (error: unknown) => E
): T | E {
  try {
    return fn();
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * 安全地执行异步函数，捕获并处理错误
 * @param fn 要执行的异步函数
 * @param errorHandler 错误处理函数
 * @returns Promise，解析为函数执行结果或错误处理返回值
 */
export async function tryCatchAsync<T, E = unknown>(
  fn: () => Promise<T>,
  errorHandler: (error: unknown) => Promise<E> | E
): Promise<T | E> {
  try {
    return await fn();
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * 获取错误消息，处理各种错误类型
 * @param error 错误对象
 * @returns 错误消息字符串
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof DpmlError) {
    return error.format();
  }

  if (error instanceof Error) {
    return error.message || error.toString();
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error === null) {
    return 'Null error';
  }

  if (error === undefined) {
    return 'Undefined error';
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * 包装函数，安全捕获错误并调用错误处理函数
 * @param fn 要执行的函数
 * @param errorHandler 错误处理函数
 * @returns 包装后的函数
 */
export function safeCatch<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler: (error: unknown, ...args: Parameters<T>) => ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      const result = fn(...args);

      // 处理Promise返回值
      if (result instanceof Promise) {
        return result.catch(error => errorHandler(error, ...args)) as ReturnType<T>;
      }

      return result;
    } catch (error) {
      return errorHandler(error, ...args);
    }
  };
}

/**
 * 导出errorUtils对象
 */
export const errorUtils = {
  DpmlError,
  ValidationError,
  ConfigurationError,
  NetworkError,
  TimeoutError,
  PermissionError,
  NotFoundError,
  formatErrorStack,
  toDpmlError,
  tryCatch,
  tryCatchAsync,
  getErrorMessage,
  safeCatch
};