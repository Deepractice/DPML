import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import type { McpConfig } from '../../types';

import { McpEnhancer } from './McpEnhancer';

/**
 * MCP增强器注册表
 *
 * 管理MCP增强器的全局单例。
 */
export class McpRegistry {
  /**
   * 存储已注册的增强器
   */
  private _enhancers = new Map<string, McpEnhancer>();

  /**
   * 全局单例实例
   */
  private static _instance: McpRegistry;

  /**
   * 私有构造函数，防止外部直接实例化
   */
  private constructor() {}

  /**
   * 获取增强器
   *
   * @param name 增强器名称
   * @returns 增强器实例
   */
  public getEnhancer(name: string): McpEnhancer {
    const enhancer = this._enhancers.get(name);

    if (!enhancer) {
      throw new Error(`未找到名为 ${name} 的MCP增强器`);
    }

    return enhancer;
  }

  /**
   * 注册增强器
   *
   * @param config MCP配置
   * @returns 增强器实例
   */
  public registerEnhancer(config: McpConfig): McpEnhancer {
    // 检查是否已经存在同名增强器
    if (this._enhancers.has(config.name)) {
      console.log(`增强器 ${config.name} 已存在，返回现有实例`);

      return this._enhancers.get(config.name)!;
    }

    console.log(`注册新增强器: ${config.name}`);

    // 创建MCP客户端
    const mcpClient = this.createMcpClient(config);

    // 创建增强器
    const enhancer = new McpEnhancer(mcpClient);

    // 存储增强器
    this._enhancers.set(config.name, enhancer);

    return enhancer;
  }

  /**
   * 创建MCP客户端
   *
   * @param config MCP配置
   * @returns MCP客户端
   */
  private createMcpClient(config: McpConfig): Client {
    // 创建客户端实例
    const client = new Client({
      name: config.name,
      version: config.version || '1.0.0'
    });

    // 根据配置类型创建不同的传输
    if (config.type === 'http' && config.http) {
      console.log(`创建HTTP客户端，连接到: ${config.http.url}`);

      // 创建HTTP传输
      const transport = new StreamableHTTPClientTransport(
        new URL(config.http.url)
      );

      // 连接客户端
      client.connect(transport);
    } else if (config.type === 'stdio' && config.stdio) {
      console.log(`创建STDIO客户端，命令: ${config.stdio.command}`);

      // 创建STDIO传输
      const transport = new StdioClientTransport({
        command: config.stdio.command,
        args: config.stdio.args || []
      });

      // 连接客户端
      client.connect(transport);
    } else {
      throw new Error(`无效的MCP配置: ${config.type}`);
    }

    return client;
  }

  /**
   * 获取全局单例实例
   */
  public static getInstance(): McpRegistry {
    if (!McpRegistry._instance) {
      McpRegistry._instance = new McpRegistry();
    }

    return McpRegistry._instance;
  }

  /**
   * 重置注册表（仅用于测试）
   */
  public static reset(): void {
    McpRegistry._instance = new McpRegistry();
  }
}
