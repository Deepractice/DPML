import type { LLMClient } from '../../../llm/LLMClient';
import type { ToolCallContext } from '../ToolCallContext';
import type { ToolCallProcessor } from '../ToolCallProcessor';

/**
 * 对话入口处理器
 *
 * 负责首次向LLM发送请求并获取原始响应。
 */
export class ConversationEntryProcessor implements ToolCallProcessor {
  /**
   * 原始LLM客户端引用
   */
  private _originalClient: LLMClient;

  /**
   * 创建对话入口处理器
   *
   * @param originalClient 原始LLM客户端
   */
  constructor(originalClient: LLMClient) {
    this._originalClient = originalClient;
  }

  /**
   * 处理对话入口
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  public async process(context: ToolCallContext): Promise<ToolCallContext> {
    try {
      // 创建新的上下文对象，不修改原对象
      const newContext = { ...context };

      // 检查递归深度，如果大于0表示已经有初始对话
      if (newContext.recursionDepth && newContext.recursionDepth > 0) {
        console.log(`跳过对话入口处理器，递归深度: ${newContext.recursionDepth}`);

        return newContext;
      }

      // 调用LLM获取响应
      console.log('开始向LLM发送请求...');
      const response = await this.callLLM(newContext.messages, newContext.stream);

      console.log('收到LLM响应');

      // 更新上下文中的响应
      newContext.response = response;

      return newContext;
    } catch (error) {
      // 错误处理
      console.error('对话入口处理失败:', error);
      throw error; // 此处必须抛出错误，因为没有LLM响应无法继续处理
    }
  }

  /**
   * 调用LLM获取响应
   *
   * @param messages 消息列表
   * @param stream 是否流式输出
   * @returns LLM响应
   */
  private async callLLM(messages: Array<{role: string, content: any}>, stream: boolean): Promise<any> {
    return this._originalClient.sendMessages(messages, stream);
  }
}
