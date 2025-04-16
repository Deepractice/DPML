import { TextFormatter } from '../formatters/text-formatter';
import { ConsoleTransport } from '../transports/console-transport';

import { Logger } from './logger';

import type { ILogger, ILoggerFactory, LoggerOptions, LogLevel } from './types';

/**
 * 日志工厂类，管理所有Logger实例
 */
export class LoggerFactory implements ILoggerFactory {
  /**
   * 默认日志选项
   */
  private defaultOptions: Partial<LoggerOptions> = {
    level: LogLevel.INFO,
    formatter: new TextFormatter(),
    transports: [new ConsoleTransport()],
  };

  /**
   * 已创建的Logger实例缓存
   */
  private loggers: Map<string, ILogger> = new Map();

  /**
   * 配置默认选项
   */
  configure(options: Partial<LoggerOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };

    // 更新已创建的所有Logger实例
    if (options.level !== undefined) {
      for (const logger of this.loggers.values()) {
        logger.setLevel(options.level);
      }
    }

    if (options.formatter) {
      for (const logger of this.loggers.values()) {
        logger.setFormatter(options.formatter);
      }
    }
  }

  /**
   * 获取或创建Logger实例
   * @param packageName 包或模块名称
   * @param options 可选的Logger选项
   */
  getLogger(packageName: string, options?: Partial<LoggerOptions>): ILogger {
    // 如果已存在，直接返回
    if (this.loggers.has(packageName)) {
      return this.loggers.get(packageName)!;
    }

    // 合并默认选项和用户选项
    const loggerOptions: LoggerOptions = {
      ...(this.defaultOptions as LoggerOptions),
      packageName,
      ...options,
    };

    // 创建新的Logger实例
    const logger = new Logger(loggerOptions);

    this.loggers.set(packageName, logger);

    return logger;
  }

  /**
   * 获取已创建的所有Logger实例
   */
  getAllLoggers(): Map<string, ILogger> {
    return new Map(this.loggers);
  }

  /**
   * 关闭所有Logger
   * 清理资源，如关闭文件句柄等
   */
  async closeAll(): Promise<void> {
    // 目前没有需要关闭的资源，留待将来扩展
    this.loggers.clear();
  }
}

/**
 * 全局日志工厂实例
 */
export const loggerFactory = new LoggerFactory();

/**
 * 创建日志记录器的快捷方法
 *
 * @param options 日志选项
 * @returns 日志记录器实例
 */
export function createLogger(
  options: Partial<LoggerOptions> & { name: string }
): ILogger {
  // 重新映射名称字段到packageName，以保持向后兼容
  const loggerOptions: Partial<LoggerOptions> = {
    ...options,
    packageName: options.name,
  };

  // 增加调试信息，在测试环境下可查看日志创建
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    console.log(
      `Creating logger: ${options.name} at level ${loggerOptions.level}`
    );
  }

  return loggerFactory.getLogger(options.name, loggerOptions);
}
