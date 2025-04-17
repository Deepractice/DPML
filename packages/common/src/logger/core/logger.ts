import { TextFormatter } from '../formatters/text-formatter';
import { ConsoleTransport } from '../transports/console-transport';

import { LogLevel } from './types';

import type {
  ILogger,
  LogFormatter,
  LoggerOptions,
  LogMeta,
  LogTransport,
} from './types';

/**
 * 日志记录器实现类
 */
export class Logger implements ILogger {
  /**
   * 当前日志级别
   */
  private level: LogLevel;

  /**
   * 日志传输通道列表
   */
  private transports: LogTransport[] = [];

  /**
   * 日志格式化器
   */
  private formatter: LogFormatter;

  /**
   * 日志元数据
   */
  private meta: LogMeta;

  /**
   * 创建日志记录器
   */
  constructor(options: LoggerOptions) {
    this.level = options.level ?? LogLevel.INFO;
    this.formatter = options.formatter || new TextFormatter();

    // 初始化元数据
    this.meta = {
      packageName: options.packageName,
      timestamp: '',
      ...options.meta,
    };

    // 添加传输通道
    if (options.transports && options.transports.length > 0) {
      this.transports = [...options.transports];
    } else {
      this.transports = [new ConsoleTransport()];
    }
  }

  /**
   * 记录调试级别日志
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  /**
   * 记录信息级别日志
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  /**
   * 记录警告级别日志
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  /**
   * 记录错误级别日志
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, args);
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * 添加传输通道
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * 设置格式化器
   */
  setFormatter(formatter: LogFormatter): void {
    this.formatter = formatter;
  }

  /**
   * 内部日志记录方法
   */
  private log(level: LogLevel, message: string, args: any[]): void {
    // 级别过滤
    if (level < this.level) return;

    // 捕获调用位置信息
    const callsite = this.captureCallSite();

    // 更新时间戳和调用位置信息
    const meta: LogMeta = {
      ...this.meta,
      timestamp: new Date().toISOString(),
      ...callsite,
    };

    // 格式化消息
    const formattedMessage = this.formatter.format(
      level,
      this.formatMessage(message, args),
      meta
    );

    // 确保有传输通道可用
    if (this.transports.length === 0) {
      // 在没有传输通道时使用默认控制台输出
      try {
        const level2Method: Record<number, keyof Console> = {
          [LogLevel.ERROR]: 'error',
          [LogLevel.WARN]: 'warn',
          [LogLevel.INFO]: 'info',
          [LogLevel.DEBUG]: 'debug',
          [LogLevel.NONE]: 'log',
        };
        const method = level2Method[level] || 'log';

        if (typeof console[method] === 'function') {
          (console[method] as Function)(formattedMessage);
        } else {
          console.log(formattedMessage);
        }
      } catch (error) {
        // 忽略控制台错误
      }
    }

    // 发送到所有传输通道
    for (const transport of this.transports) {
      try {
        const result = transport.log(level, formattedMessage, meta);

        // 处理异步传输
        if (
          typeof transport.isAsync === 'function' &&
          transport.isAsync() &&
          result instanceof Promise
        ) {
          result.catch(err => {
            console.error(`日志传输错误: ${err.message}`);
          });
        }
      } catch (error) {
        // 捕获传输错误，但不中断流程
        console.error(`日志传输错误: ${(error as Error).message}`);
      }
    }
  }

  /**
   * 捕获日志调用位置信息
   * 从错误堆栈中提取调用者的文件名、函数名和行号
   */
  private captureCallSite(): { fileName?: string; functionName?: string; lineNumber?: number; columnNumber?: number } {
    try {
      // 保存原始的错误堆栈处理函数
      const originalPrepareStackTrace = Error.prepareStackTrace;
      
      // 设置自定义堆栈处理函数以获取更多信息
      Error.prepareStackTrace = (_, stack) => stack;
      
      // 创建一个新的Error对象并获取调用堆栈
      const stack = new Error().stack as unknown as NodeJS.CallSite[];
      
      // 恢复原始堆栈处理函数
      Error.prepareStackTrace = originalPrepareStackTrace;
      
      // 索引4对应于实际调用logger方法的位置
      // 0: Error构造函数
      // 1: captureCallSite
      // 2: log 
      // 3: logger.debug/info/warn/error
      // 4: 实际调用的代码位置
      const callSite = stack[4];
      
      if (!callSite) return {};
      
      // 处理可能为null的返回值
      const fileName = callSite.getFileName() ?? undefined;
      const fnName = callSite.getFunctionName();
      const methodName = callSite.getMethodName();
      const functionName = fnName ?? methodName ?? undefined;
      
      let lineNumber: number | undefined = undefined;
      if (callSite.getLineNumber && typeof callSite.getLineNumber === 'function') {
        const line = callSite.getLineNumber();
        if (line && line > 0) lineNumber = line;
      }
      
      let columnNumber: number | undefined = undefined;
      if (callSite.getColumnNumber && typeof callSite.getColumnNumber === 'function') {
        const column = callSite.getColumnNumber();
        if (column && column > 0) columnNumber = column;
      }
      
      return {
        fileName,
        functionName,
        lineNumber,
        columnNumber,
      };
    } catch (error) {
      // 如果出现错误，返回空对象，不影响日志记录
      return {};
    }
  }

  /**
   * 格式化消息，处理类似console.log的格式化方式
   */
  private formatMessage(message: string, args: any[]): string {
    if (args.length === 0) return message;

    // 简单处理参数
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }

      return String(arg);
    });

    return `${message} ${formattedArgs.join(' ')}`;
  }
}
