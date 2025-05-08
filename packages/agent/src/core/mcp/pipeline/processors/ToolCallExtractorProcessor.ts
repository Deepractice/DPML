import type { ChatOutput } from '../../../../types';
import type { ToolCallContext, InvokeToolRequest } from '../ToolCallContext';
import type { ToolCallProcessor } from '../ToolCallProcessor';

/**
 * 工具调用提取处理器
 *
 * 从LLM响应中提取工具调用请求。
 */
export class ToolCallExtractorProcessor implements ToolCallProcessor {
  /**
   * 处理工具调用提取
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  public async process(context: ToolCallContext): Promise<ToolCallContext> {
    try {
      // 创建新的上下文对象，不修改原对象
      const newContext = { ...context };

      // 如果没有响应，则跳过处理
      if (!newContext.response) {
        console.log('没有LLM响应，跳过工具调用提取');

        return newContext;
      }

      // 根据响应类型进行处理
      if (newContext.stream && Symbol.asyncIterator in (newContext.response as any)) {
        // 从流中提取工具调用
        console.log('从流式响应中提取工具调用');
        const content = await this.collectContentFromStream(newContext.response as AsyncIterable<ChatOutput>);

        newContext.toolCalls = this.extractToolCalls(content);
      } else {
        // 从非流式响应中提取工具调用
        console.log('从非流式响应中提取工具调用');
        const content = this.getContentFromResponse(newContext.response as ChatOutput);

        newContext.toolCalls = this.extractToolCalls(content);
      }

      if (newContext.toolCalls && newContext.toolCalls.length > 0) {
        console.log(`提取到${newContext.toolCalls.length}个工具调用:`,
          newContext.toolCalls.map(call => call.name).join(', '));
      } else {
        console.log('未提取到工具调用');
      }

      return newContext;
    } catch (error) {
      console.error('工具调用提取失败:', error);

      // 错误情况下，直接返回原始上下文对象，不做任何修改
      return context;
    }
  }

  /**
   * 从流式响应中收集内容
   *
   * @param stream 响应流
   * @returns 收集的内容
   */
  private async collectContentFromStream(stream: AsyncIterable<ChatOutput>): Promise<string> {
    let content = '';

    for await (const chunk of stream) {
      if (typeof chunk.content === 'string') {
        content += chunk.content;
      } else if (chunk.content && typeof chunk.content === 'object') {
        // 处理内容是对象的情况
        if ('value' in chunk.content && typeof chunk.content.value === 'string') {
          content += chunk.content.value;
        } else {
          content += JSON.stringify(chunk.content);
        }
      }
    }

    return content;
  }

  /**
   * 从非流式响应中获取内容
   *
   * @param response 响应对象
   * @returns 响应内容
   */
  private getContentFromResponse(response: ChatOutput): string {
    if (typeof response.content === 'string') {
      return response.content;
    } else if (response.content && typeof response.content === 'object') {
      // 处理内容是对象的情况
      if ('value' in response.content && typeof response.content.value === 'string') {
        return response.content.value;
      }
    }

    return JSON.stringify(response.content);
  }

  /**
   * 提取工具调用
   *
   * @param content 内容文本
   * @returns 提取的工具调用列表
   */
  private extractToolCalls(content: string): InvokeToolRequest[] {
    const toolCalls: InvokeToolRequest[] = [];

    // 使用正则表达式查找所有工具调用
    const functionCallsRegex = /<function_calls>([\s\S]*?)<\/function_calls>/g;
    let functionCallsMatch;

    while ((functionCallsMatch = functionCallsRegex.exec(content)) !== null) {
      const functionCallsBlock = functionCallsMatch[1];

      // 解析<invoke>块
      const invokeRegex = /<invoke name="([^"]+)">([\s\S]*?)<\/invoke>/g;
      let invokeMatch;

      while ((invokeMatch = invokeRegex.exec(functionCallsBlock)) !== null) {
        const toolName = invokeMatch[1];
        const paramsBlock = invokeMatch[2];

        // 解析参数
        const params: Record<string, any> = {};
        const paramRegex = /<parameter name="([^"]+)">([\s\S]*?)<\/parameter>/g;
        let paramMatch;

        while ((paramMatch = paramRegex.exec(paramsBlock)) !== null) {
          const paramName = paramMatch[1];
          const paramValue = paramMatch[2].trim();

          // 尝试解析JSON值
          try {
            params[paramName] = JSON.parse(paramValue);
          } catch {
            // 如果不是有效的JSON，保留原始字符串
            params[paramName] = paramValue;
          }
        }

        // 添加解析的工具调用
        toolCalls.push({
          name: toolName,
          parameters: params
        });
      }
    }

    // 始终返回数组，保持良好的编码习惯
    return toolCalls;
  }
}
