/**
 * 默认日志器实现
 *
 * DefaultLogger是日志模块的核心执行组件，负责根据配置记录日志
 * 它实现了Logger接口，提供各级别的日志记录功能，并支持调用位置捕获
 */

import type {
  Logger,
  LogEntry,
  LoggerConfig,
  CallerInfo,
  CallSiteCaptureConfig
} from '../../types/log';
import {
  LogLevel
} from '../../types/log';

/**
 * DefaultLogger类，实现Logger接口，提供完整的日志记录功能
 */
export class DefaultLogger implements Logger {
  /**
   * 最低记录级别，低于此级别的日志将被忽略
   */
  private minLevel: LogLevel;

  /**
   * 格式化器，用于将日志条目格式化为字符串
   */
  private formatter?: LoggerConfig['formatter'];

  /**
   * 传输器数组，用于将日志输出到不同目标
   */
  private transports: LoggerConfig['transports'];

  /**
   * 调用位置捕获配置，控制是否捕获和记录调用位置
   */
  private callSiteCapture: CallSiteCaptureConfig;

  /**
   * 构造函数，根据配置初始化日志器
   * @param config 日志器配置
   */
  constructor(config: LoggerConfig) {
    this.minLevel = config.minLevel;
    this.formatter = config.formatter;
    this.transports = config.transports || [];
    this.callSiteCapture = config.callSiteCapture || { enabled: false };
  }

  /**
   * 记录调试级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  public debug(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.DEBUG, message, context, error);
  }

  /**
   * 记录信息级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  public info(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.INFO, message, context, error);
  }

  /**
   * 记录警告级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  public warn(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * 记录错误级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  public error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * 记录致命错误级别的日志
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  public fatal(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  /**
   * 内部日志记录方法，处理共享的日志逻辑
   * @param level 日志级别
   * @param message 日志消息
   * @param context 可选的上下文信息
   * @param error 可选的错误对象
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    // 1. 检查日志级别是否需要记录
    if (level < this.minLevel) {
      return;
    }

    // 2. 创建日志条目
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error
    };

    // 3. 如果需要，捕获调用位置
    if (this.shouldCaptureCallSite(level)) {
      entry.caller = this.getCaller();
    }

    // 4. 将日志条目传递给所有传输器
    for (const transport of this.transports || []) {
      try {
        transport.write(entry);
      } catch (err) {
        // 处理传输器错误，避免影响其他传输器和应用程序
        console.error(`日志传输器错误: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  /**
   * 判断是否应该为指定级别捕获调用位置
   * @param level 日志级别
   * @returns 是否应该捕获调用位置
   */
  private shouldCaptureCallSite(level: LogLevel): boolean {
    const { enabled, forLevels } = this.callSiteCapture;

    if (!enabled) {
      return false;
    }

    if (!forLevels || forLevels.length === 0) {
      return true;
    }

    return forLevels.includes(level);
  }

  /**
   * 获取调用位置信息
   * @returns 调用位置信息对象，如果无法获取则返回undefined
   */
  private getCaller(): CallerInfo | undefined {
    try {
      // 使用Error对象获取堆栈信息
      const err = new Error();

      // 如果可用，使用captureStackTrace获取更准确的堆栈
      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(err, this.getCaller);
      }

      // 解析堆栈信息
      if (!err.stack) {
        return undefined;
      }

      // 将堆栈分割为行
      const stackLines = err.stack.split('\n');

      // 我们需要跳过前几行（Error对象自身和日志方法）
      // 通常第4行是实际调用日志方法的位置
      // 但这可能需要根据环境和平台进行调整
      const callerLine = stackLines[3] || '';

      // 使用正则表达式提取调用位置信息
      // 根据不同环境的堆栈格式，可能需要不同的正则表达式
      const nodeRegex = /at\s+(.*)\s+\((.*):(\d+):(\d+)\)/;
      const browserRegex = /at\s+(.*)\s+\((.*):(\d+):(\d+)\)/;
      const chromeRegex = /at\s+(?:(.*)\s+\()?(.*):(\d+):(\d+)/;

      // 尝试不同的正则表达式
      const match = callerLine.match(nodeRegex) ||
                  callerLine.match(browserRegex) ||
                  callerLine.match(chromeRegex);

      if (!match) {
        return undefined;
      }

      // 提取文件名、函数名和行号
      let functionName = match[1] || 'anonymous';
      const fileName = match[2] || 'unknown';
      const lineNumber = parseInt(match[3], 10) || 0;
      const columnNumber = parseInt(match[4], 10) || 0;

      // 检查是否有类名（类方法调用）
      let className: string | undefined;

      if (functionName.includes('.')) {
        const parts = functionName.split('.');

        className = parts[0];
        functionName = parts[1];
      }

      // 返回调用位置信息
      return {
        fileName,
        className,
        functionName,
        lineNumber,
        columnNumber
      };
    } catch (err) {
      // 获取调用位置时出错，返回undefined
      // 这里故意不抛出错误，因为调用位置不是必需的
      console.error(`获取调用位置时出错: ${err instanceof Error ? err.message : String(err)}`);

      return undefined;
    }
  }
}
