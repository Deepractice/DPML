/**
 * DPML日志模块标准API
 *
 * 该模块是DPML日志系统的标准公共API，严格遵循设计文档规范，
 * 提供了获取日志器、创建自定义日志器和设置日志级别的功能。
 */

import {
  getDefaultLogger as coreGetDefaultLogger,
  getLogger as coreGetLogger,
  createLogger as coreCreateLogger,
  setDefaultLogLevel as coreSetDefaultLogLevel
} from '../core/logging/loggingService';
import { LogLevel, Logger, LoggerConfig } from '../types/log';

/**
 * 获取默认日志器
 * @returns 默认日志器实例
 * @example
 * ```typescript
 * // 获取默认日志器
 * const logger = getDefaultLogger();
 * logger.info('Hello DPML');
 * ```
 */
export function getDefaultLogger(): Logger {
  return coreGetDefaultLogger();
}

/**
 * 获取日志器
 * @param name 日志器名称
 * @returns 日志器实例
 * @example
 * ```typescript
 * // 获取命名日志器
 * const dbLogger = getLogger('database');
 * dbLogger.debug('DB connection established');
 * ```
 */
export function getLogger(name: string): Logger {
  return coreGetLogger(name);
}

/**
 * 创建自定义配置的日志器
 * @param name 日志器名称
 * @param config 日志器配置
 * @returns 日志器实例
 * @example
 * ```typescript
 * // 创建自定义日志器
 * const logger = createLogger('api', {
 *   minLevel: LogLevel.INFO
 * });
 * ```
 */
export function createLogger(name: string, config: LoggerConfig): Logger {
  return coreCreateLogger(name, config);
}

/**
 * 设置默认日志级别
 * @param level 日志级别
 * @example
 * ```typescript
 * // 设置默认日志级别为DEBUG
 * setDefaultLogLevel(LogLevel.DEBUG);
 * ```
 */
export function setDefaultLogLevel(level: LogLevel): void {
  coreSetDefaultLogLevel(level);
}

// 导出类型和枚举
export { LogLevel, Logger, LoggerConfig };
