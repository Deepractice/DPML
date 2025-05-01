/**
 * 日志注册表，管理所有日志器实例
 *
 * LoggerRegistry是日志模块的状态管理组件，负责维护所有日志器实例
 * 采用单例模式，确保全局唯一的日志注册表实例
 */

import type {
  Logger,
  LoggerConfig
} from '../../types/log';
import { LogLevel } from '../../types/log';

import { DefaultLogger } from './DefaultLogger';

/**
 * 日志注册表类，管理所有日志器实例
 * 采用单例模式，确保全局唯一性
 */
export class LoggerRegistry {
  /**
   * 单例实例
   * @private
   */
  private static instance: LoggerRegistry;

  /**
   * 日志器映射表，存储所有已注册的日志器
   * @private
   */
  private loggers: Map<string, Logger> = new Map();

  /**
   * 默认日志器，当请求不存在的日志器时返回
   * @private
   */
  private readonly defaultLogger: Logger;

  /**
   * 私有构造函数，防止直接实例化
   * @param defaultConfig 默认日志器配置
   * @private
   */
  private constructor(defaultConfig: LoggerConfig) {
    this.defaultLogger = new DefaultLogger(defaultConfig);
    this.loggers.set('default', this.defaultLogger);
  }

  /**
   * 获取LoggerRegistry单例实例
   * @param defaultConfig 可选的默认日志器配置
   * @returns LoggerRegistry单例实例
   */
  public static getInstance(defaultConfig?: LoggerConfig): LoggerRegistry {
    if (!LoggerRegistry.instance) {
      const config = defaultConfig || {
        minLevel: LogLevel.INFO
      };

      LoggerRegistry.instance = new LoggerRegistry(config);
    }

    return LoggerRegistry.instance;
  }

  /**
   * 获取指定名称的日志器
   * @param name 日志器名称
   * @returns 日志器实例，如果不存在则返回默认日志器
   */
  public getLogger(name: string): Logger {
    return this.loggers.get(name) || this.defaultLogger;
  }

  /**
   * 注册日志器
   * @param name 日志器名称
   * @param logger 日志器实例
   */
  public registerLogger(name: string, logger: Logger): void {
    this.loggers.set(name, logger);
  }

  /**
   * 创建并注册新日志器
   * @param name 日志器名称
   * @param config 日志器配置
   * @returns 创建的日志器实例
   */
  public createLogger(name: string, config: LoggerConfig): Logger {
    const logger = new DefaultLogger(config);

    this.registerLogger(name, logger);

    return logger;
  }
}
