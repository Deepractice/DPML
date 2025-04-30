/**
 * CLI核心接口
 * 提供命令行界面核心功能
 */
export interface CLITypes {
  /**
   * 执行CLI处理命令行参数
   * @param argv 命令行参数数组，默认使用process.argv
   */
  execute(argv?: string[]): Promise<void>;

  /**
   * 显示帮助信息
   */
  showHelp(): void;

  /**
   * 显示版本信息
   */
  showVersion(): void;

  /**
   * 注册外部命令
   * @param commands 符合CommandDefinition规范的命令数组
   */
  registerCommands(commands: CommandDefinition[]): void;
}

/**
 * CLI选项
 * 配置CLI基本信息
 */
export interface CLIOptions {
  /**
   * CLI工具名称
   */
  name: string;

  /**
   * CLI版本号
   */
  version: string;

  /**
   * CLI描述
   */
  description: string;

  /**
   * 默认领域，默认为'core'
   */
  defaultDomain?: string;
}

/**
 * 命令行参数定义
 */
export interface ArgumentDefinition {
  /**
   * 参数名称
   */
  name: string;

  /**
   * 参数描述
   */
  description: string;

  /**
   * 是否必需
   */
  required?: boolean;

  /**
   * 默认值
   */
  defaultValue?: string;

  /**
   * 可选项列表
   */
  choices?: string[];
}

/**
 * 命令行选项定义
 */
export interface OptionDefinition {
  /**
   * 选项标识，如 '-v, --verbose'
   */
  flags: string;

  /**
   * 选项描述
   */
  description: string;

  /**
   * 默认值
   */
  defaultValue?: string | boolean | number;

  /**
   * 是否必需
   */
  required?: boolean;

  /**
   * 可选项列表
   */
  choices?: string[];
}

/**
 * 命令行动作处理函数
 */
export type CommandAction = (...args: unknown[]) => void | Promise<void>;

/**
 * 命令定义
 */
export interface CommandDefinition {
  /**
   * 命令名称
   */
  name: string;

  /**
   * 命令描述
   */
  description: string;

  /**
   * 位置参数定义
   */
  arguments?: ArgumentDefinition[];

  /**
   * 选项参数定义
   */
  options?: OptionDefinition[];

  /**
   * 命令执行函数
   */
  action: CommandAction;

  /**
   * 子命令定义
   */
  subcommands?: CommandDefinition[];

  /**
   * 所属领域，用于组织命令层次结构
   */
  domain?: string;
}
