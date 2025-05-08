/**
 * 模拟MCP客户端
 *
 * 用于测试的MCP客户端模拟实现
 */

import type { Tool } from '../../../core/mcp/pipeline/ToolCallContext';
import { mockTools, mockToolResults } from '../mcp.fixture';

/**
 * 模拟MCP客户端接口
 */
export interface MockMcpClientOptions {
  /**
   * 是否启用错误模式
   */
  errorMode?: boolean;

  /**
   * 自定义工具列表
   */
  tools?: Tool[];

  /**
   * 自定义工具结果
   */
  toolResults?: Record<string, any>;

  /**
   * 工具执行延迟（毫秒）
   */
  executionDelay?: number;
}

/**
 * 模拟MCP客户端，用于测试
 */
export class MockMcpClient {
  private options: MockMcpClientOptions;
  private connected: boolean = false;
  private executionLog: Array<{tool: string, params: any}> = [];

  /**
   * 创建模拟MCP客户端
   * @param options 客户端选项
   */
  constructor(options: MockMcpClientOptions = {}) {
    this.options = {
      errorMode: false,
      tools: mockTools,
      toolResults: mockToolResults,
      executionDelay: 50,
      ...options
    };
  }

  /**
   * 连接到MCP服务
   */
  public async connect(): Promise<void> {
    if (this.options.errorMode) {
      throw new Error('无法连接到MCP服务');
    }

    // 模拟连接延迟
    await new Promise(resolve => setTimeout(resolve, 50));
    this.connected = true;
  }

  /**
   * 断开MCP连接
   */
  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  /**
   * 获取工具列表
   */
  public async listTools(): Promise<Tool[]> {
    this.ensureConnected();

    return [...this.options.tools!];
  }

  /**
   * 执行工具调用
   * @param params 包含工具名称和参数的对象
   * @returns 工具执行结果
   */
  public async callTool(params: { name: string, arguments: Record<string, any> }): Promise<any> {
    this.ensureConnected();

    const { name, arguments: parameters } = params;

    // 记录执行
    this.executionLog.push({ tool: name, params: parameters });

    // 模拟执行延迟
    await new Promise(resolve => setTimeout(resolve, this.options.executionDelay));

    // 错误模式
    if (this.options.errorMode) {
      throw new Error(`工具 ${name} 执行失败`);
    }

    // 检查工具是否存在
    if (!this.options.tools!.some(t => t.name === name)) {
      throw new Error(`工具 ${name} 不存在`);
    }

    // 返回工具结果
    if (name in this.options.toolResults!) {
      return this.options.toolResults![name];
    } else {
      return this.options.toolResults!['error'];
    }
  }

  /**
   * 获取执行日志
   */
  public getExecutionLog(): Array<{tool: string, params: any}> {
    return [...this.executionLog];
  }

  /**
   * 清除执行日志
   */
  public clearExecutionLog(): void {
    this.executionLog = [];
  }

  /**
   * 确保客户端已连接
   */
  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('MCP客户端未连接');
    }
  }
}
