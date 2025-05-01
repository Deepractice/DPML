/**
 * 日志服务模块，提供日志相关功能
 * 作为API层和核心实现之间的桥梁
 *
 * 该模块负责协调日志模块各组件，为API层提供功能支持
 * 包括日志器的获取和创建、配置管理和默认日志级别设置
 */

import type { Logger, LoggerConfig } from '../../types/log';
import { LogLevel } from '../../types/log';

import { DefaultFormatter } from './formatters/DefaultFormatter';
import { LoggerRegistry } from './LoggerRegistry';
import { ConsoleTransport } from './transports/ConsoleTransport';

/**
 * 获取默认日志器
 * @returns 默认日志器实例
 */
export function getDefaultLogger(): Logger {
  return LoggerRegistry.getInstance().getLogger('default');
}

/**
 * 获取指定名称的日志器
 * @param name 日志器名称
 * @returns 日志器实例
 */
export function getLogger(name: string): Logger {
  return LoggerRegistry.getInstance().getLogger(name);
}

/**
 * 创建并注册新日志器
 * @param name 日志器名称
 * @param config 日志器配置
 * @returns 创建的日志器实例
 */
export function createLogger(name: string, config: LoggerConfig): Logger {
  // 合并用户配置与默认配置
  const completeConfig = {
    ...loadLoggerConfig(),
    ...config
  };

  // 确保至少有一个传输器
  if (!completeConfig.transports || completeConfig.transports.length === 0) {
    completeConfig.transports = [new ConsoleTransport(completeConfig.formatter)];
  }

  return LoggerRegistry.getInstance().createLogger(name, completeConfig);
}

/**
 * 设置默认日志级别
 * @param level 新的默认日志级别
 */
export function setDefaultLogLevel(level: LogLevel): void {
  // 创建新配置，保留现有配置中的其他属性
  const config = loadLoggerConfig();

  config.minLevel = level;

  // 创建新的默认日志器
  const logger = LoggerRegistry.getInstance().createLogger('default', config);

  LoggerRegistry.getInstance().registerLogger('default', logger);
}

/**
 * 加载日志配置
 * 从环境变量和默认值构建配置
 * @returns 日志配置对象
 * @private
 */
function loadLoggerConfig(): LoggerConfig {
  // 默认配置
  const config: LoggerConfig = {
    minLevel: LogLevel.INFO,
    formatter: new DefaultFormatter(),
    transports: [new ConsoleTransport()]
  };

  // 从环境变量中读取配置
  try {
    if (typeof process !== 'undefined' && process.env) {
      // 读取日志级别
      const envLogLevel = process.env.LOG_LEVEL;

      if (envLogLevel) {
        const level = LogLevel[envLogLevel as keyof typeof LogLevel];

        if (typeof level === 'number') {
          config.minLevel = level;
        }
      }

      // 读取调用位置捕获配置
      const enableCallSiteCapture = process.env.LOG_CAPTURE_CALLSITE;

      if (enableCallSiteCapture === 'true') {
        config.callSiteCapture = {
          enabled: true
        };
      }
    }
  } catch (err) {
    // 环境变量读取失败，使用默认配置
    console.warn('读取日志环境变量配置失败，使用默认配置');
  }

  return config;
}
