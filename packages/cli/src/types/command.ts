/**
 * 命令相关类型定义
 */

/**
 * 命令配置接口
 */
export interface CommandOption {
  /** 选项标志，如 "-v, --verbose" */
  flag: string;
  /** 选项描述 */
  description: string;
  /** 默认值（可选） */
  default?: any;
}

/**
 * 命令定义接口
 */
export interface Command {
  /** 命令名称 */
  name: string;
  /** 命令描述 */
  description: string;
  /** 命令选项列表 */
  options?: CommandOption[];
  /** 使用示例 */
  examples?: string[];
  /** 可选：命令别名 */
  aliases?: string[];
  /** 命令执行函数 */
  execute: (args: string | string[], options: Record<string, any>, context?: any) => Promise<void>;
}

/**
 * 生命周期钩子接口
 */
export interface CommandHooks {
  /** CLI初始化时执行 */
  initialize?: () => Promise<void>;
  /** 命令执行前调用 */
  beforeCommand?: (commandName: string) => Promise<void>;
  /** 命令执行后调用 */
  afterCommand?: (commandName: string, result: any) => Promise<void>;
}

/**
 * 领域命令配置接口
 */
export interface DomainCommandConfig {
  /** 领域名称 */
  domain: string;
  /** 命令列表 */
  commands: Command[];
  /** 默认命令（可选） */
  defaultCommand?: string;
  /** 生命周期钩子（可选） */
  hooks?: CommandHooks;
}

/**
 * 领域命令集合接口
 */
export interface DomainCommandSet {
  /** 领域名称 */
  domain: string;
  /** 所属包 */
  package: string;
  /** 命令配置文件路径 */
  commandsPath: string;
  /** 包版本 */
  version: string;
  /** 命令映射 */
  commands: Map<string, Command>;
  /** 生命周期钩子 */
  hooks?: any;
}

/**
 * 命令执行上下文接口
 */
export interface ExecutionContext {
  /** 是否详细模式 */
  verbose: boolean;
  /** 是否静默模式 */
  quiet: boolean;
  /** 其他上下文属性 */
  [key: string]: any;
}

/**
 * 领域映射信息接口
 */
export interface DomainMapping {
  /** 上次更新时间 */
  lastUpdated: string;
  /** 领域到包的映射 */
  domains: Record<string, {
    /** 包名 */
    package: string;
    /** 命令配置文件路径 */
    commandsPath: string;
    /** 包版本 */
    version: string;
  }>;
} 