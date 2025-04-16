import { ILogger, ILoggerFactory, LoggerOptions } from './types';
import { Logger } from './logger';
import { TextFormatter } from '../formatters/text-formatter';
import { ConsoleTransport } from '../transports/console-transport';
import { LogLevel } from './types';

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
    transports: [new ConsoleTransport()]
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
      ...this.defaultOptions as LoggerOptions,
      packageName,
      ...options
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