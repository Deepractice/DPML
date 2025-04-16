/**
 * 错误类型定义
 *
 * 提供DPML项目统一的错误类型系统，支持错误代码、详情和分类
 */

/**
 * DPML错误选项
 */
export interface DPMLErrorOptions {
  /** 错误代码 */
  code: string;
  /** 详细信息 */
  details?: Record<string, unknown>;
  /** 原始错误 */
  cause?: Error;
}

/**
 * DPML基础错误类
 *
 * 所有DPML错误的基类，提供统一的错误格式
 *
 * @example
 * ```typescript
 * throw new DPMLError('配置加载失败', {
 *   code: 'CONFIG_LOAD_ERROR',
 *   details: { path: '/config.json' }
 * });
 * ```
 */
export class DPMLError extends Error {
  /** 错误代码 */
  code: string;
  /** 错误详情 */
  details?: Record<string, unknown>;

  /**
   * 创建DPML错误
   * @param message 错误消息
   * @param options 错误选项
   */
  constructor(message: string, options: DPMLErrorOptions) {
    super(message);
    this.code = options.code;
    this.details = options.details;
    this.name = 'DPMLError';

    // 保留原始调用栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // 设置原因（Node.js v16.9.0+ 和现代浏览器支持）
    if (options.cause) {
      Object.defineProperty(this, 'cause', {
        value: options.cause,
        configurable: true,
        writable: true,
      });
    }
  }
}

/**
 * 配置错误
 *
 * 表示配置加载、解析或验证过程中的错误
 */
export class ConfigError extends DPMLError {
  constructor(
    message: string,
    options: Omit<DPMLErrorOptions, 'code'> & { code?: string }
  ) {
    super(message, {
      code: options.code || 'CONFIG_ERROR',
      details: options.details,
      cause: options.cause,
    });
    this.name = 'ConfigError';
  }
}

/**
 * 验证错误
 *
 * 表示数据验证失败的错误
 */
export class ValidationError extends DPMLError {
  /** 验证失败的字段 */
  fields?: Record<string, string[]>;

  constructor(
    message: string,
    options: Omit<DPMLErrorOptions, 'code'> & {
      code?: string;
      fields?: Record<string, string[]>;
    }
  ) {
    super(message, {
      code: options.code || 'VALIDATION_ERROR',
      details: options.details,
      cause: options.cause,
    });
    this.name = 'ValidationError';
    this.fields = options.fields;
  }
}

/**
 * 网络错误
 *
 * 表示网络请求过程中的错误
 */
export class NetworkError extends DPMLError {
  /** HTTP状态码 */
  statusCode?: number;

  constructor(
    message: string,
    options: Omit<DPMLErrorOptions, 'code'> & {
      code?: string;
      statusCode?: number;
    }
  ) {
    super(message, {
      code: options.code || 'NETWORK_ERROR',
      details: options.details,
      cause: options.cause,
    });
    this.name = 'NetworkError';
    this.statusCode = options.statusCode;
  }
}

/**
 * 文件系统错误
 *
 * 表示文件操作过程中的错误
 */
export class FileSystemError extends DPMLError {
  /** 文件路径 */
  path?: string;

  constructor(
    message: string,
    options: Omit<DPMLErrorOptions, 'code'> & {
      code?: string;
      path?: string;
    }
  ) {
    super(message, {
      code: options.code || 'FS_ERROR',
      details: options.details,
      cause: options.cause,
    });
    this.name = 'FileSystemError';
    this.path = options.path;

    // 添加路径到详情
    if (options.path && this.details) {
      this.details.path = options.path;
    } else if (options.path) {
      this.details = { path: options.path };
    }
  }
}

/**
 * 创建DPML错误的工厂函数
 *
 * @param message 错误消息
 * @param code 错误代码
 * @param details 错误详情
 * @returns DPMLError实例
 *
 * @example
 * ```typescript
 * throw createDPMLError('操作失败', 'OPERATION_FAILED', { id: 123 });
 * ```
 */
export function createDPMLError(
  message: string,
  code: string,
  details?: Record<string, unknown>,
  cause?: Error
): DPMLError {
  return new DPMLError(message, { code, details, cause });
}

/**
 * 创建配置错误的工厂函数
 */
export function createConfigError(
  message: string,
  details?: Record<string, unknown>,
  cause?: Error
): ConfigError {
  return new ConfigError(message, { details, cause });
}

/**
 * 创建验证错误的工厂函数
 */
export function createValidationError(
  message: string,
  fields?: Record<string, string[]>,
  details?: Record<string, unknown>,
  cause?: Error
): ValidationError {
  return new ValidationError(message, { fields, details, cause });
}

/**
 * 创建网络错误的工厂函数
 */
export function createNetworkError(
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
  cause?: Error
): NetworkError {
  return new NetworkError(message, { statusCode, details, cause });
}

/**
 * 创建文件系统错误的工厂函数
 */
export function createFileSystemError(
  message: string,
  path?: string,
  details?: Record<string, unknown>,
  cause?: Error
): FileSystemError {
  return new FileSystemError(message, { path, details, cause });
}
