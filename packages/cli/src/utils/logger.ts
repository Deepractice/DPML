import chalk from 'chalk';

import { LogLevel } from '../types/config';

import type { LoggerOptions } from '../types/config';

/**
 * 默认日志器配置
 */
const DEFAULT_OPTIONS: LoggerOptions = {
  level: LogLevel.INFO,
  console: true,
  timestamp: false,
};

/**
 * 日志工具类
 */
export class Logger {
  private options: LoggerOptions;

  /**
   * 创建日志器实例
   * @param options 日志器配置
   */
  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  public setLevel(level: LogLevel): void {
    this.options.level = level;
  }

  /**
   * 格式化日志消息
   * @param message 消息内容
   * @returns 格式化后的消息
   */
  private formatMessage(message: string): string {
    if (this.options.timestamp) {
      const now = new Date();

      return `[${now.toISOString()}] ${message}`;
    }

    return message;
  }

  /**
   * 输出调试日志
   * @param message 日志消息
   */
  public debug(message: string): void {
    if (this.options.level <= LogLevel.DEBUG && this.options.console) {
      console.log(this.formatMessage(chalk.gray(`debug: ${message}`)));
    }
  }

  /**
   * 输出信息日志
   * @param message 日志消息
   */
  public info(message: string): void {
    if (this.options.level <= LogLevel.INFO && this.options.console) {
      console.log(this.formatMessage(chalk.blue(`info: ${message}`)));
    }
  }

  /**
   * 输出成功日志
   * @param message 日志消息
   */
  public success(message: string): void {
    if (this.options.level <= LogLevel.SUCCESS && this.options.console) {
      console.log(this.formatMessage(chalk.green(`✓ ${message}`)));
    }
  }

  /**
   * 输出警告日志
   * @param message 日志消息
   */
  public warn(message: string): void {
    if (this.options.level <= LogLevel.WARN && this.options.console) {
      console.warn(this.formatMessage(chalk.yellow(`warning: ${message}`)));
    }
  }

  /**
   * 输出错误日志
   * @param message 日志消息
   */
  public error(message: string): void {
    if (this.options.level <= LogLevel.ERROR && this.options.console) {
      console.error(this.formatMessage(chalk.red(`error: ${message}`)));
    }
  }

  /**
   * 输出帮助信息
   * @param command 命令
   * @param description 描述
   */
  public help(command: string, description: string): void {
    if (this.options.level <= LogLevel.INFO && this.options.console) {
      console.log(`  ${chalk.cyan(command.padEnd(20))}${description}`);
    }
  }
}

// 导出默认日志器实例
export const logger = new Logger();
