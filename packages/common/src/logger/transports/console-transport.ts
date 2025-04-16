import { LogLevel, LogMeta, LogTransport } from '../core/types';

/**
 * 控制台传输选项
 */
export interface ConsoleTransportOptions {
  /**
   * 是否使用彩色输出（仅在支持的环境中）
   * @default false
   */
  colorize?: boolean;

  /**
   * 自定义控制台对象（用于测试）
   */
  console?: Console;
}

/**
 * 控制台传输实现
 * 将日志输出到控制台
 */
export class ConsoleTransport implements LogTransport {
  private colorize: boolean;
  private consoleInstance: Console;
  
  /**
   * 创建控制台传输
   */
  constructor(options: ConsoleTransportOptions = {}) {
    this.colorize = options.colorize === true;
    this.consoleInstance = options.console || console;
  }
  
  /**
   * 记录日志到控制台
   */
  log(level: LogLevel, message: string, meta: LogMeta): void {
    const method = this.getConsoleMethod(level);
    
    if (this.colorize) {
      const colorizedMessage = this.colorizeMessage(level, message);
      this.consoleInstance[method](colorizedMessage);
    } else {
      this.consoleInstance[method](message);
    }
  }
  
  /**
   * 返回此传输是否异步
   */
  isAsync(): boolean {
    return false;
  }
  
  /**
   * 获取对应日志级别的控制台方法
   */
  private getConsoleMethod(level: LogLevel): 'debug' | 'info' | 'warn' | 'error' | 'log' {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warn';
      case LogLevel.ERROR:
        return 'error';
      default:
        return 'log';
    }
  }
  
  /**
   * 为日志消息添加颜色（仅在支持的环境中有效）
   */
  private colorizeMessage(level: LogLevel, message: string): string {
    // 仅在浏览器控制台中有效
    switch (level) {
      case LogLevel.DEBUG:
        return `%c${message}%c`; // 灰色
      case LogLevel.INFO:
        return `%c${message}%c`; // 蓝色
      case LogLevel.WARN:
        return `%c${message}%c`; // 黄色
      case LogLevel.ERROR:
        return `%c${message}%c`; // 红色
      default:
        return message;
    }
  }
} 