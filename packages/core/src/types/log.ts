/**
 * 日志模块类型定义
 *
 * 该文件包含DPML日志模块所需的所有类型定义和接口，作为日志模块的类型基础架构。
 */

/**
 * 日志级别枚举，从DEBUG(最低)到FATAL(最高)
 * 数值顺序对应严重程度，用于日志级别比较
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * 日志器接口，定义日志记录的核心方法
 * 所有日志器实现必须实现此接口
 */
export type Logger = {
  /**
   * 记录调试级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  debug(message: string, context?: Record<string, unknown>, error?: Error): void;

  /**
   * 记录信息级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  info(message: string, context?: Record<string, unknown>, error?: Error): void;

  /**
   * 记录警告级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  warn(message: string, context?: Record<string, unknown>, error?: Error): void;

  /**
   * 记录错误级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  error(message: string, context?: Record<string, unknown>, error?: Error): void;

  /**
   * 记录致命错误级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  fatal(message: string, context?: Record<string, unknown>, error?: Error): void;
}

/**
 * 日志条目结构，表示一条完整的日志记录
 * 包含时间戳、级别、消息和可选的上下文信息、错误对象和调用位置
 */
export type LogEntry = {
  /**
   * 日志记录的时间戳
   */
  timestamp: Date;

  /**
   * 日志级别
   */
  level: LogLevel;

  /**
   * 日志消息
   */
  message: string;

  /**
   * 可选的上下文信息，提供额外的结构化数据
   */
  context?: Record<string, unknown>;

  /**
   * 可选的错误对象，通常用于错误和异常日志
   */
  error?: Error;

  /**
   * 可选的调用位置信息，记录日志调用的代码位置
   */
  caller?: CallerInfo;
}

/**
 * 调用位置信息，记录日志调用的代码位置
 * 用于调试和问题定位
 */
export type CallerInfo = {
  /**
   * 文件名
   */
  fileName: string;

  /**
   * 可选的类名
   */
  className?: string;

  /**
   * 函数名
   */
  functionName: string;

  /**
   * 行号
   */
  lineNumber: number;

  /**
   * 可选的列号
   */
  columnNumber?: number;
}

/**
 * 日志器配置，控制日志器的行为
 */
export type LoggerConfig = {
  /**
   * 最低记录级别，低于此级别的日志将被忽略
   */
  minLevel: LogLevel;

  /**
   * 可选的格式化器，用于将日志条目格式化为字符串
   */
  formatter?: LogFormatter;

  /**
   * 可选的传输器数组，用于将日志输出到不同目标
   */
  transports?: LogTransport[];

  /**
   * 可选的调用位置捕获配置，控制是否捕获和记录调用位置
   */
  callSiteCapture?: CallSiteCaptureConfig;
}

/**
 * 调用位置捕获配置，控制调用位置捕获的行为
 */
export type CallSiteCaptureConfig = {
  /**
   * 是否启用调用位置捕获
   */
  enabled: boolean;

  /**
   * 可选的日志级别数组，指定哪些级别需要捕获调用位置
   * 如果未指定，则对所有级别启用
   */
  forLevels?: LogLevel[];
}

/**
 * 日志格式化器接口，负责将日志条目格式化为字符串
 */
export type LogFormatter = {
  /**
   * 将日志条目格式化为字符串
   * @param entry 要格式化的日志条目
   * @returns 格式化后的字符串
   */
  format(entry: LogEntry): string;
}

/**
 * 日志传输器接口，负责将日志写入到目标位置
 */
export type LogTransport = {
  /**
   * 将日志条目写入到目标位置
   * @param entry 要写入的日志条目
   */
  write(entry: LogEntry): void;
}
