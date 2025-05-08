import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

import type { LLMClient } from '../llm/LLMClient';

import { ConversationEntryProcessor } from './pipeline/processors/ConversationEntryProcessor';
import { RecursiveProcessor } from './pipeline/processors/RecursiveProcessor';
import { ResultFormattingProcessor } from './pipeline/processors/ResultFormattingProcessor';
import { StartSideBandProcessor } from './pipeline/processors/StartSideBandProcessor';
import { ToolCallExtractorProcessor } from './pipeline/processors/ToolCallExtractorProcessor';
import { ToolExecutionProcessor } from './pipeline/processors/ToolExecutionProcessor';
import { ToolPreparationProcessor } from './pipeline/processors/ToolPreparationProcessor';
import type { ToolCallContext } from './pipeline/ToolCallContext';
import { ToolCallPipeline } from './pipeline/ToolCallPipeline';

/**
 * MCP增强器
 *
 * 为LLM客户端添加工具调用能力。
 */
export class McpEnhancer {
  /**
   * MCP客户端
   */
  private _mcpClient: Client;

  /**
   * 创建增强器
   *
   * @param mcpClient MCP客户端
   */
  constructor(mcpClient: Client) {
    this._mcpClient = mcpClient;
  }

  /**
   * 增强LLM客户端
   *
   * @param llmClient 原始LLM客户端
   * @returns 增强的LLM客户端
   */
  public enhance(llmClient: LLMClient): LLMClient {
    console.log('正在增强LLM客户端，添加工具调用能力');

    // 创建工具调用管道
    const pipeline = this.createToolCallPipeline(llmClient);

    // 使用闭包创建增强的LLM客户端
    return {
      sendMessages: async (messages, stream) => {
        try {
          console.log('增强客户端接收到发送消息请求');

          // 创建工具调用上下文
          const context: ToolCallContext = {
            messages,
            stream
          };

          // 执行工具调用管道
          console.log('开始执行工具调用管道');
          const result = await pipeline.execute(context);

          console.log('工具调用管道执行完成');

          // 返回最终结果
          return result.response!;
        } catch (error) {
          console.error('增强客户端处理请求时出错:', error);
          throw error;
        }
      }
    };
  }

  /**
   * 创建工具调用管道
   *
   * @param llmClient 原始LLM客户端
   * @returns 工具调用管道
   */
  private createToolCallPipeline(llmClient: LLMClient): ToolCallPipeline {
    console.log('创建工具调用管道');

    // 创建管道
    const pipeline = new ToolCallPipeline();

    // 添加处理器
    pipeline
      .addProcessor(new ToolPreparationProcessor(this._mcpClient))
      .addProcessor(new ConversationEntryProcessor(llmClient))
      .addProcessor(new StartSideBandProcessor())
      .addProcessor(new ToolCallExtractorProcessor())
      .addProcessor(new ToolExecutionProcessor(this._mcpClient))
      .addProcessor(new ResultFormattingProcessor());

    console.log('创建递归处理器');

    // 创建递归处理器并添加到管道
    const recursiveProcessor = new RecursiveProcessor(pipeline);

    pipeline.addProcessor(recursiveProcessor);

    console.log('工具调用管道创建完成');

    return pipeline;
  }
}
