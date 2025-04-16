/**
 * 配置相关类型定义
 *
 * 提供DPML项目配置系统的类型定义，支持各种配置场景。
 */

/**
 * 基础配置接口
 *
 * 所有配置对象的基础接口
 */
export interface BaseConfig {
  /** 允许任意键值对 */
  [key: string]: unknown;
}

/**
 * 日志传输配置
 */
export interface TransportConfig {
  /** 传输类型 */
  type: 'console' | 'file' | 'memory' | 'custom';
  /** 传输名称 */
  name?: string;
  /** 传输级别 */
  level?: string;
  /** 传输选项 */
  options?: Record<string, unknown>;
}

/**
 * 日志格式化器配置
 */
export interface FormatterConfig {
  /** 格式化器类型 */
  type: 'text' | 'json' | 'custom';
  /** 模板（用于文本格式化器） */
  template?: string;
  /** 是否显示时间戳 */
  showTimestamp?: boolean;
  /** 是否显示包名 */
  showPackageName?: boolean;
  /** 是否美化输出（用于JSON格式化器） */
  pretty?: boolean;
  /** 自定义选项 */
  options?: Record<string, unknown>;
}

/**
 * 日志配置
 */
export interface LoggerConfig {
  /** 日志级别 */
  level?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  /** 是否启用颜色 */
  enableColors?: boolean;
  /** 是否包含元数据 */
  includeMeta?: boolean;
  /** 格式化器配置 */
  formatter?: FormatterConfig;
  /** 传输配置列表 */
  transports?: TransportConfig[];
}

/**
 * HTTP配置
 */
export interface HttpConfig {
  /** 基础URL */
  baseUrl?: string;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  retries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 默认头信息 */
  headers?: Record<string, string>;
  /** 代理配置 */
  proxy?: {
    /** 代理URL */
    url: string;
    /** 代理认证 */
    auth?: {
      username: string;
      password: string;
    };
  };
  /** 是否验证SSL证书 */
  validateSSL?: boolean;
}

/**
 * 文件系统配置
 */
export interface FileSystemConfig {
  /** 根目录 */
  rootDir?: string;
  /** 临时目录 */
  tempDir?: string;
  /** 编码 */
  encoding?: string;
  /** 是否创建目录 */
  createDirs?: boolean;
}

/**
 * 应用配置
 */
export interface AppConfig extends BaseConfig {
  /** 日志配置 */
  logger?: LoggerConfig;
  /** HTTP配置 */
  http?: HttpConfig;
  /** 文件系统配置 */
  fs?: FileSystemConfig;
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors?: Record<string, string[]>;
  /** 警告信息 */
  warnings?: Record<string, string[]>;
}

/**
 * 深度部分类型
 *
 * 使配置对象的所有属性和嵌套属性变为可选
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * 配置对象类型
 *
 * 用于创建特定配置对象类型
 */
export type ConfigOf<T extends BaseConfig> = T;

/**
 * 通用配置架构
 *
 * 定义配置对象的架构、默认值和验证规则
 */
export interface ConfigSchema<T extends BaseConfig> {
  /** 默认配置 */
  defaults?: DeepPartial<T>;
  /** 验证配置 */
  validate?: (config: T) => ConfigValidationResult;
}

/**
 * 环境变量配置映射
 *
 * 定义环境变量到配置属性的映射
 */
export interface EnvVarMapping {
  /** 环境变量名 */
  [envVar: string]: {
    /** 配置路径（使用点号分隔） */
    path: string;
    /** 转换函数 */
    transform?: (value: string) => unknown;
  };
}
