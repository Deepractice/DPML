/**
 * 日志系统核心类型定义
 */

/**
 * 日志级别枚举
 * 使用数字值便于比较
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * 日志级别的字符串映射
 */
export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.NONE]: 'NONE',
};

/**
 * 日志元数据接口
 */
export interface LogMeta {
  /**
   * 时间戳
   */
  timestamp: string;

  /**
   * 包或模块名称
   */
  packageName: string;

  /**
   * 文件名
   */
  fileName?: string;

  /**
   * 函数名
   */
  functionName?: string;

  /**
   * 行号
   */
  lineNumber?: number;

  /**
   * 列号
   */
  columnNumber?: number;

  /**
   * 其他元数据
   */
  [key: string]: any;
}

/**
 * 日志选项接口
 */
export interface LoggerOptions {
  /**
   * 包或模块名称
   */
  packageName: string;

  /**
   * 日志级别
   */
  level?: LogLevel;

  /**
   * 格式化器
   */
  formatter?: LogFormatter;

  /**
   * 传输通道列表
   */
  transports?: LogTransport[];

  /**
   * 附加元数据
   */
  meta?: Record<string, any>;
}

/**
 * 日志记录接口
 */
export interface ILogger {
  /**
   * 记录调试级别日志
   */
  debug(message: string, ...args: any[]): void;

  /**
   * 记录信息级别日志
   */
  info(message: string, ...args: any[]): void;

  /**
   * 记录警告级别日志
   */
  warn(message: string, ...args: any[]): void;

  /**
   * 记录错误级别日志
   */
  error(message: string, ...args: any[]): void;

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void;

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel;

  /**
   * 添加传输通道
   */
  addTransport(transport: LogTransport): void;

  /**
   * 设置格式化器
   */
  setFormatter(formatter: LogFormatter): void;
}

/**
 * 日志传输接口
 */
export interface LogTransport {
  /**
   * 记录日志
   */
  log(level: LogLevel, message: string, meta: LogMeta): void | Promise<void>;

  /**
   * 是否是异步传输
   */
  isAsync(): boolean;
}

/**
 * 日志格式化器接口
 */
export interface LogFormatter {
  /**
   * 格式化日志消息
   */
  format(level: LogLevel, message: string, meta: LogMeta): string;
}

/**
 * 日志工厂接口
 */
export interface ILoggerFactory {
  /**
   * 获取指定名称的日志实例
   */
  getLogger(packageName: string, options?: Partial<LoggerOptions>): ILogger;

  /**
   * 配置全局日志选项
   */
  configure(options: Partial<LoggerOptions>): void;
}
