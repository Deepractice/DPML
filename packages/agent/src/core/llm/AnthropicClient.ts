import type { ChatOutput } from '../../types/Chat';
import type { ContentItem } from '../../types/Content';
import { AgentError, AgentErrorType } from '../../types/errors';
import type { LLMConfig } from '../../types/LLMConfig';
import type { Message } from '../types';

import type { LLMClient } from './LLMClient';

/**
 * Anthropic客户端实现
 */
export class AnthropicClient implements LLMClient {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey || '';
    this.apiUrl = config.apiUrl || 'https://api.anthropic.com/v1';
    this.model = config.model;

    if (!this.apiKey) {
      throw new AgentError(
        'Anthropic API密钥未提供',
        AgentErrorType.CONFIG,
        'MISSING_API_KEY'
      );
    }
  }

  public async sendMessages(messages: Message[], stream: boolean): Promise<ChatOutput | AsyncIterable<ChatOutput>> {
    try {
      // 转换为Anthropic消息格式
      const anthropicMessages = this.convertToAnthropicMessages(messages);

      // 选择同步或流式API
      if (stream) {
        return this.streamMessages(anthropicMessages);
      } else {
        return this.sendMessagesSync(anthropicMessages);
      }
    } catch (error: unknown) {
      // 将底层错误包装为AgentError
      throw new AgentError(
        `LLM服务调用失败: ${error instanceof Error ? error.message : String(error)}`,
        AgentErrorType.LLM_SERVICE,
        'LLM_API_ERROR',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private async sendMessagesSync(anthropicMessages: Record<string, unknown>): Promise<ChatOutput> {
    // 准备请求参数
    const requestBody = {
      model: this.model,
      messages: anthropicMessages.messages,
      max_tokens: 1024,
      stream: false
    };

    // 发送请求到Anthropic API
    const response = await fetch(`${this.apiUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Anthropic API请求失败: ${response.status} ${response.statusText} - ${errorData}`);
    }

    // 解析响应
    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('Anthropic响应格式无效，没有找到内容');
    }

    // 返回标准化的输出
    return {
      content: {
        type: 'text',
        value: content
      }
    };
  }

  private async *streamMessages(anthropicMessages: Record<string, unknown>): AsyncIterable<ChatOutput> {
    // 准备请求参数
    const requestBody = {
      model: this.model,
      messages: anthropicMessages.messages,
      max_tokens: 1024,
      stream: true
    };

    // 发送请求到Anthropic API
    const response = await fetch(`${this.apiUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Anthropic API流式请求失败: ${response.status} ${response.statusText} - ${errorData}`);
    }

    if (!response.body) {
      throw new Error('Anthropic API流式响应没有响应体');
    }

    // 创建流式读取器
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码新接收的数据
        buffer += decoder.decode(value, { stream: true });

        // 处理接收到的事件
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const jsonData = line.substring(6); // 去掉 'data: ' 前缀
            try {
              const data = JSON.parse(jsonData);
              
              if (data.type === 'content_block_delta' && data.delta?.text) {
                yield {
                  content: {
                    type: 'text',
                    value: data.delta.text
                  }
                };
              }
            } catch (e) {
              console.error('解析SSE事件失败:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private convertToAnthropicMessages(messages: Message[]): Record<string, unknown> {
    // Anthropic格式要求系统提示和用户消息分开处理
    const systemMessage = messages.find(msg => msg.role === 'system');
    
    // 过滤掉系统消息，只保留用户和助手消息
    const userAssistantMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: this.convertContent(msg.content)
      }));

    // 构建Anthropic请求格式
    return {
      system: systemMessage ? this.extractTextContent(systemMessage.content) : '',
      messages: userAssistantMessages
    };
  }

  private convertContent(content: ContentItem | ContentItem[]): unknown {
    // Anthropic消息内容处理
    if (Array.isArray(content)) {
      // 暂时只支持文本内容，将数组中的文本合并
      return content
        .filter(item => item.type === 'text')
        .map(item => item.value)
        .join('\n');
    } else if (content.type === 'text') {
      return content.value;
    }
    
    // 不支持的内容类型
    return `[不支持的内容类型: ${Array.isArray(content) ? '多模态内容' : content.type}]`;
  }

  private extractTextContent(content: ContentItem | ContentItem[]): string {
    if (Array.isArray(content)) {
      return content
        .filter(item => item.type === 'text')
        .map(item => item.value as string)
        .join('\n');
    } else if (content.type === 'text') {
      return content.value as string;
    }
    
    return '';
  }
} 