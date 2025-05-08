import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

import type { ToolCallContext, ToolResult, InvokeToolRequest, ToolExecutionContent } from '../ToolCallContext';
import type { ToolCallProcessor } from '../ToolCallProcessor';

/**
 * 工具执行处理器
 *
 * 执行提取的工具调用并收集结果。
 */
export class ToolExecutionProcessor implements ToolCallProcessor {
  /**
   * MCP客户端引用
   */
  private _mcpClient: Client;

  /**
   * 创建工具执行处理器
   *
   * @param mcpClient MCP客户端
   */
  constructor(mcpClient: Client) {
    this._mcpClient = mcpClient;
  }

  /**
   * 处理工具执行
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  public async process(context: ToolCallContext): Promise<ToolCallContext> {
    try {
      // 创建新的上下文对象，不修改原对象
      const newContext = { ...context };

      // 如果没有工具调用，则跳过处理
      if (!newContext.toolCalls || newContext.toolCalls.length === 0) {
        console.log('没有工具调用需要执行');

        return newContext;
      }

      console.log(`开始执行${newContext.toolCalls.length}个工具调用`);

      // 执行所有工具调用并收集结果
      const results = await Promise.all(
        newContext.toolCalls.map(toolCall => this.executeTool(toolCall))
      );

      // 存储结果
      newContext.results = results;

      console.log('工具调用执行完成');

      return newContext;
    } catch (error) {
      console.error('工具执行处理失败:', error);

      // 错误情况下，直接返回原始上下文对象，不做任何修改
      return context;
    }
  }

  /**
   * 执行单个工具调用
   *
   * @param toolCall 工具调用
   * @returns 工具执行结果
   */
  private async executeTool(toolCall: InvokeToolRequest): Promise<ToolResult> {
    console.log(`执行工具: ${toolCall.name}，参数:`, toolCall.parameters);

    try {
      // 调用MCP客户端执行工具
      const result = await this._mcpClient.callTool({
        name: toolCall.name,
        arguments: toolCall.parameters
      });

      console.log(`工具 ${toolCall.name} 执行成功:`, result.content);

      // 检查content是否是数组
      if (!result.content || !Array.isArray(result.content)) {
        throw new Error(`工具 ${toolCall.name} 返回了无效结果格式`);
      }

      // 将SDK的结果转换为我们的类型
      const contentItems: ToolExecutionContent[] = result.content.map((item: any) => ({
        type: item.type || 'text',
        text: item.text || '',
        ...item
      }));

      // 返回成功结果
      return {
        toolCall,
        status: 'success',
        result: contentItems
      };
    } catch (error) {
      console.error(`工具 ${toolCall.name} 执行失败:`, error);

      // 返回错误结果
      return {
        toolCall,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
