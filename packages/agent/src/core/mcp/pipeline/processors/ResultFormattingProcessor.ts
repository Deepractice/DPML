import type { Message } from '../../../types';
import type { ToolCallContext, ToolResult } from '../ToolCallContext';
import type { ToolCallProcessor } from '../ToolCallProcessor';

/**
 * 结果格式化处理器
 *
 * 将工具执行结果格式化为适合LLM处理的消息。
 */
export class ResultFormattingProcessor implements ToolCallProcessor {
  /**
   * 处理结果格式化
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  public async process(context: ToolCallContext): Promise<ToolCallContext> {
    try {
      // 创建新的上下文对象，不修改原对象
      const newContext = { ...context };

      // 如果没有工具结果，则跳过处理
      if (!newContext.results || newContext.results.length === 0) {
        console.log('没有工具结果需要格式化');

        return newContext;
      }

      console.log('开始格式化工具执行结果');

      // 创建包含工具调用的助手消息
      const assistantMessage = this.createAssistantMessage(newContext.toolCalls!);

      // 格式化工具结果为系统消息
      const resultMessage = this.createToolResultsMessage(newContext.results);

      // 将工具调用和结果添加到消息历史
      newContext.messages = [
        ...newContext.messages,
        // 添加助手消息，包含工具调用
        assistantMessage,
        // 添加工具结果消息
        resultMessage
      ];

      // 准备用于下一轮对话的最终响应
      newContext.finalResponse = {
        content: {
          type: 'text',
          value: '' // 将在后续处理中填充
        }
      };

      console.log('工具结果格式化完成，添加了以下消息:');

      // 获取助手消息内容的预览
      let contentPreview = '';
      const assistantContent = assistantMessage.content;

      if (typeof assistantContent === 'string') {
        contentPreview = assistantContent.substring(0, 50);
      } else if (Array.isArray(assistantContent)) {
        contentPreview =
          assistantContent[0] &&
          assistantContent[0].type === 'text' &&
          typeof assistantContent[0].value === 'string'
            ? assistantContent[0].value.substring(0, 50)
            : '(内容预览不可用)';
      } else if (assistantContent.type === 'text' && typeof assistantContent.value === 'string') {
        contentPreview = assistantContent.value.substring(0, 50);
      } else {
        contentPreview = '(内容预览不可用)';
      }

      console.log(`- 助手消息: ${contentPreview}...`);
      console.log(`- 工具结果消息已添加`);

      return newContext;
    } catch (error) {
      console.error('结果格式化处理失败:', error);

      return context; // 失败时返回原始上下文
    }
  }

  /**
   * 创建包含工具结果的系统消息
   *
   * @param results 工具执行结果
   * @returns 系统消息
   */
  private createToolResultsMessage(results: ToolResult[]): Message {
    let resultText = '工具执行结果:\n\n';

    for (const result of results) {
      resultText += `工具: ${result.toolCall.name}\n`;
      resultText += `状态: ${result.status === 'success' ? '成功' : '失败'}\n`;

      if (result.status === 'success' && result.result) {
        // 处理成功结果
        resultText += '结果:\n';
        for (const item of result.result) {
          if (item.type === 'text' && item.text) {
            resultText += item.text + '\n';
          } else {
            resultText += JSON.stringify(item, null, 2) + '\n';
          }
        }
      } else if (result.error) {
        // 处理错误结果
        resultText += `错误: ${result.error}\n`;
      }

      resultText += '\n'; // 工具之间的分隔
    }

    // 创建系统消息
    return {
      role: 'system',
      content: {
        type: 'text',
        value: resultText
      }
    };
  }

  /**
   * 创建包含工具调用的助手消息
   *
   * @param toolCalls 工具调用列表
   * @returns 助手消息
   */
  private createAssistantMessage(toolCalls: Array<{name: string, parameters: Record<string, any>}>): Message {
    let content = '';

    // 为每个工具调用创建格式化内容
    for (const toolCall of toolCalls) {
      content += '<function_calls>\n';
      content += `<invoke name="${toolCall.name}">\n`;

      for (const [paramName, paramValue] of Object.entries(toolCall.parameters)) {
        const stringValue = typeof paramValue === 'string'
          ? paramValue
          : JSON.stringify(paramValue);

        content += `<parameter name="${paramName}">${stringValue}</parameter>\n`;
      }

      content += '</invoke>\n';
      content += '</function_calls>\n\n';
    }

    // 创建助手消息
    return {
      role: 'assistant',
      content: {
        type: 'text',
        value: content
      }
    };
  }
}
