import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

import type { ContentItem } from '../../../../types';
import type { Message } from '../../../types';
import type { ToolCallContext, Tool } from '../ToolCallContext';
import type { ToolCallProcessor } from '../ToolCallProcessor';

// 扩展Client类型，添加getTools方法
interface ExtendedClient extends Client {
  getTools?: () => Promise<Tool[]>;
}

/**
 * 工具准备处理器
 *
 * 准备工具描述并添加到消息中。
 */
export class ToolPreparationProcessor implements ToolCallProcessor {
  /**
   * MCP客户端引用
   */
  private _mcpClient: ExtendedClient;

  /**
   * 工具列表缓存
   */
  private _toolsCache: Tool[] | null = null;

  /**
   * 创建工具准备处理器
   *
   * @param mcpClient MCP客户端
   */
  constructor(mcpClient: Client) {
    this._mcpClient = mcpClient as ExtendedClient;

    // 如果客户端没有getTools方法，添加一个适配器方法
    if (!this._mcpClient.getTools) {
      this._mcpClient.getTools = async () => {
        // 调用SDK的listTools方法
        const result = await this._mcpClient.listTools();

        // 转换为我们自定义的Tool类型
        return result.tools.map(sdkTool => ({
          name: sdkTool.name,
          description: sdkTool.description || '无描述',
          parameters: sdkTool.parameters as Record<string, any> | undefined
        }));
      };
    }
  }

  /**
   * 处理工具准备
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  public async process(context: ToolCallContext): Promise<ToolCallContext> {
    try {
      // 先尝试获取工具列表，失败立即返回原始上下文
      let tools: Tool[];

      try {
        tools = await this.getTools();
      } catch (error) {
        console.error('工具准备处理失败:', error);

        // 在工具获取失败时，直接返回原始上下文，不做任何修改
        return context;
      }

      // 创建新的上下文对象，不修改原对象
      const newContext = { ...context };

      // 检查消息中是否已有工具描述
      if (!this.hasToolsDescription(newContext.messages)) {
        // 格式化工具描述
        const toolsDescription = this.formatToolsDescription(tools);

        // 创建内容项
        const contentItem: ContentItem = {
          type: 'text',
          value: toolsDescription
        };

        // 添加工具描述到消息
        const systemMessage: Message = {
          role: 'system',
          content: contentItem
        };

        newContext.messages = [
          systemMessage,
          ...newContext.messages
        ];
      }

      // 在上下文中存储工具列表
      newContext.tools = tools;

      return newContext;
    } catch (error) {
      // 出错时记录日志并保持上下文不变
      console.error('工具准备处理失败:', error);

      return context;
    }
  }

  /**
   * 获取工具列表
   */
  private async getTools(): Promise<Tool[]> {
    if (!this._toolsCache) {
      // 从MCP客户端获取工具列表
      console.log('从MCP客户端获取工具列表');

      // 调用getTools方法(我们确保在构造函数中已添加这个方法)
      const getToolsFn = this._mcpClient.getTools!;
      const tools = await getToolsFn();

      this._toolsCache = tools;
      console.log(`获取到${tools.length}个工具`);
    }

    return this._toolsCache || [];
  }

  /**
   * 格式化工具描述
   */
  private formatToolsDescription(tools: Tool[]): string {
    // 实现工具格式化逻辑
    let description = "可用工具:\n\n";

    for (const tool of tools) {
      description += `工具名: ${tool.name}\n`;
      description += `描述: ${tool.description || '无描述'}\n`;

      if (tool.parameters) {
        description += "参数:\n";

        if (typeof tool.parameters === 'object') {
          if ('type' in tool.parameters && tool.parameters.type === 'object' && 'properties' in tool.parameters) {
            const props = tool.parameters.properties as Record<string, any>;
            const required = Array.isArray(tool.parameters.required) ? tool.parameters.required : [];

            for (const [paramName, paramInfo] of Object.entries(props)) {
              description += `  - ${paramName}: ${paramInfo.description || '无描述'} (${paramInfo.type || '任意类型'})\n`;

              if (required.includes(paramName)) {
                description += `    (必填)\n`;
              }
            }
          } else {
            description += `  ${JSON.stringify(tool.parameters, null, 2)}\n`;
          }
        }
      }

      description += "\n";
    }

    // 添加工具调用格式指南
    description += "当你需要使用工具时，请使用以下格式:\n\n";
    description += "<function_calls>\n";
    description += "<invoke name=\"工具名\">\n";
    description += "<parameter name=\"参数名\">参数值</parameter>\n";
    description += "<!-- 可以有多个参数 -->\n";
    description += "</invoke>\n";
    description += "</function_calls>\n";

    return description;
  }

  /**
   * 检查消息中是否已有工具描述
   */
  private hasToolsDescription(messages: Message[]): boolean {
    return messages.some(msg => {
      if (msg.role !== 'system') return false;

      const content = msg.content;

      if (Array.isArray(content)) {
        // 如果内容是数组，检查每个内容项
        return content.some(item =>
          item.type === 'text' &&
          typeof item.value === 'string' &&
          item.value.includes('可用工具:')
        );
      } else {
        // 单个内容项
        return content.type === 'text' &&
          typeof content.value === 'string' &&
          content.value.includes('可用工具:');
      }
    });
  }
}
