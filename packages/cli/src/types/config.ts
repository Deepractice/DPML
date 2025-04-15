/**
 * 配置相关类型定义
 */

/**
 * 配置项接口
 */
export interface ConfigOptions {
  /** 配置目录 */
  configDir?: string;
  /** 配置文件名 */
  configFileName?: string;
  /** 映射文件名 */
  mappingFileName?: string;
}

/**
 * 配置数据接口
 */
export interface ConfigData {
  /** 版本信息 */
  version?: string;
  /** 上次更新时间 */
  lastUpdated?: string;
  /** 其他配置项 */
  [key: string]: any;
}

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
  SILENT = 5
}

/**
 * 日志器配置
 */
export interface LoggerOptions {
  /** 日志级别 */
  level: LogLevel;
  /** 是否在控制台输出 */
  console: boolean;
  /** 是否包含时间戳 */
  timestamp: boolean;
} 