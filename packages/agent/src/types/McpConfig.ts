/**
 * MCP配置
 *
 * 定义MCP连接的配置信息。
 */
export interface McpConfig {
  /**
   * MCP名称，用于标识不同的MCP实例
   */
  readonly name: string;

  /**
   * MCP版本，用于SDK要求
   */
  readonly version?: string;

  /**
   * 是否启用MCP功能
   */
  readonly enabled: boolean;

  /**
   * 连接类型
   */
  readonly type: 'http' | 'stdio';

  /**
   * HTTP连接配置，当type为http时使用
   */
  readonly http?: HttpConfig;

  /**
   * 标准IO连接配置，当type为stdio时使用
   */
  readonly stdio?: StdioConfig;
}

/**
 * HTTP连接配置
 */
export interface HttpConfig {
  /**
   * MCP服务器URL
   */
  readonly url: string;
}

/**
 * 标准IO连接配置
 */
export interface StdioConfig {
  /**
   * 执行的命令
   */
  readonly command: string;

  /**
   * 命令参数
   */
  readonly args?: string[];

  /**
   * 环境变量
   */
  readonly env?: Record<string, string>;
}
