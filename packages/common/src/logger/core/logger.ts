import { 
  ILogger, 
  LogFormatter, 
  LoggerOptions, 
  LogLevel, 
  LogMeta, 
  LogTransport 
} from './types';
import { TextFormatter } from '../formatters/text-formatter';
import { ConsoleTransport } from '../transports/console-transport';

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
      ...options.meta
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
    
    // 更新时间戳
    const meta: LogMeta = { 
      ...this.meta, 
      timestamp: new Date().toISOString() 
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
          [LogLevel.NONE]: 'log'
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
        if (typeof transport.isAsync === 'function' && transport.isAsync() && result instanceof Promise) {
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