/**
 * DPML日志模块
 * @module logging
 *
 * 该模块提供了完整的日志记录功能，支持多种日志级别、格式和输出目标。
 *
 * 基本用法:
 * ```typescript
 * import { getDefaultLogger, getLogger, createLogger, setDefaultLogLevel, LogLevel } from '@dpml/core';
 *
 * // 获取默认日志器
 * const logger = getDefaultLogger();
 *
 * // 记录不同级别的日志
 * logger.debug('调试信息');
 * logger.info('一般信息');
 * logger.warn('警告信息');
 * logger.error('错误信息', { userId: 123 }, new Error('发生错误'));
 * logger.fatal('严重错误');
 *
 * // 设置全局日志级别
 * setDefaultLogLevel(LogLevel.DEBUG);
 *
 * // 创建自定义日志器
 * const customLogger = createLogger('custom', {
 *   minLevel: LogLevel.INFO,
 *   callSiteCapture: {
 *     enabled: true,
 *     forLevels: [LogLevel.ERROR, LogLevel.FATAL]
 *   }
 * });
 * ```
 */

// 导出日志服务 API
export * from './loggingService';

// 导出核心组件
export { LoggerRegistry } from './LoggerRegistry';
export { DefaultLogger } from './DefaultLogger';

// 导出格式化器
export { DefaultFormatter } from './formatters/DefaultFormatter';
export { JsonFormatter } from './formatters/JsonFormatter';
export { SimpleFormatter } from './formatters/SimpleFormatter';

// 导出传输器
export { ConsoleTransport } from './transports/ConsoleTransport';
export { AsyncConsoleTransport } from './transports/AsyncConsoleTransport';
export { FileTransport } from './transports/FileTransport';
export { BaseTransport } from './transports/BaseTransport';
