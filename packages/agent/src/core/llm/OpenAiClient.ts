import type { ChatOutput } from '../../types/Chat';
import type { ContentItem } from '../../types/Content';
import { AgentError, AgentErrorType } from '../../types/errors';
import type { LLMConfig } from '../../types/LLMConfig';
import type { Message } from '../types';

import type { LLMClient } from './LLMClient';

/**
 * OpenAI客户端实现
 */
export class OpenAIClient implements LLMClient {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey || '';
    this.apiUrl = config.apiUrl || 'https://api.openai.com/v1';
    this.model = config.model;

    if (!this.apiKey) {
      throw new AgentError(
        'OpenAI API密钥未提供',
        AgentErrorType.CONFIG,
        'MISSING_API_KEY'
      );
    }
  }

  public async sendMessages(messages: Message[], stream: boolean): Promise<ChatOutput | AsyncIterable<ChatOutput>> {
    try {
      // 转换为OpenAI格式的消息
      const openaiMessages = this.convertToOpenAIMessages(messages);

      // 选择同步或流式API
      if (stream) {
        return this.streamMessages(openaiMessages);
      } else {
        return this.sendMessagesSync(openaiMessages);
      }
    } catch (error: unknown) {
      // 将底层错误包装为AgentError
      // 如果已经是AgentError类型，则直接抛出
      if (error instanceof AgentError) {
        throw error;
      }
      
      throw new AgentError(
        `LLM服务调用失败: ${error instanceof Error ? error.message : String(error)}`,
        AgentErrorType.LLM_SERVICE,
        'LLM_API_ERROR',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private async sendMessagesSync(openaiMessages: Record<string, unknown>[]): Promise<ChatOutput> {
    try {
      // 准备请求参数
      const requestBody = {
        model: this.model,
        messages: openaiMessages,
        stream: false
      };

      // 发送请求到OpenAI API
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.text();
        throw new AgentError(
          `OpenAI API请求失败: ${response.status} ${response.statusText} - ${errorData}`,
          AgentErrorType.LLM_SERVICE,
          'LLM_API_ERROR'
        );
      }

      // 解析响应
      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new AgentError(
          'OpenAI响应格式无效，没有找到内容',
          AgentErrorType.LLM_SERVICE,
          'INVALID_RESPONSE_FORMAT'
        );
      }

      // 返回标准化的输出
      return {
        content: {
          type: 'text',
          value: content
        }
      };
    } catch (error) {
      // 确保所有错误都被包装成AgentError
      if (error instanceof AgentError) {
        throw error;
      }
      
      throw new AgentError(
        `LLM服务调用失败: ${error instanceof Error ? error.message : String(error)}`,
        AgentErrorType.LLM_SERVICE,
        'LLM_API_ERROR',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private async *streamMessages(openaiMessages: Record<string, unknown>[]): AsyncIterable<ChatOutput> {
    try {
      // 准备请求参数
      const requestBody = {
        model: this.model,
        messages: openaiMessages,
        stream: true
      };

      // 发送请求到OpenAI API
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.text();
        throw new AgentError(
          `OpenAI API流式请求失败: ${response.status} ${response.statusText} - ${errorData}`,
          AgentErrorType.LLM_SERVICE,
          'LLM_API_ERROR'
        );
      }

      if (!response.body) {
        throw new AgentError(
          'OpenAI API流式响应没有响应体',
          AgentErrorType.LLM_SERVICE,
          'MISSING_RESPONSE_BODY'
        );
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
                const content = data.choices[0]?.delta?.content;
                
                if (content) {
                  yield {
                    content: {
                      type: 'text',
                      value: content
                    }
                  };
                }
              } catch (e) {
                console.error('解析SSE事件失败:', e);
                throw new AgentError(
                  `解析SSE事件失败: ${e instanceof Error ? e.message : String(e)}`,
                  AgentErrorType.LLM_SERVICE,
                  'SSE_PARSING_ERROR',
                  e instanceof Error ? e : new Error(String(e))
                );
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      // 确保所有错误都被包装成AgentError
      if (error instanceof AgentError) {
        throw error;
      }
      
      throw new AgentError(
        `LLM服务调用失败: ${error instanceof Error ? error.message : String(error)}`,
        AgentErrorType.LLM_SERVICE,
        'LLM_API_ERROR',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private convertToOpenAIMessages(messages: Message[]): Record<string, unknown>[] {
    // 转换消息格式为OpenAI API格式
    return messages.map(msg => {
      return {
        role: msg.role,
        content: this.convertContent(msg.content)
      };
    });
  }

  private convertContent(content: ContentItem | ContentItem[]): unknown {
    // 处理多模态内容转换为OpenAI格式
    if (Array.isArray(content)) {
      // OpenAI格式支持内容数组
      return content.map(item => this.convertContentItem(item));
    }
    
    return this.convertContentItem(content);
  }

  private convertContentItem(item: ContentItem): unknown {
    switch (item.type) {
      case 'text':
        return item.value as string;
      case 'image':
        // 处理图像类型，转换为OpenAI的图像URL格式
        return { 
          type: 'image_url', 
          image_url: { 
            url: `data:${item.mimeType || 'image/jpeg'};base64,${this.arrayBufferToBase64(item.value as Uint8Array)}` 
          } 
        };
      case 'audio':
      case 'video':
      case 'file':
      default:
        // 暂不支持其他内容类型，转换为文本提示
        return `[不支持的内容类型: ${item.type}]`;
    }
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    // 将Uint8Array转换为Base64编码的字符串
    if (typeof Buffer !== 'undefined') {
      // Node.js环境
      return Buffer.from(buffer).toString('base64');
    } else {
      // 浏览器环境
      let binary = '';
      const len = buffer.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
      }
      // 使用btoa函数(浏览器内置)进行Base64编码
      return btoa(binary);
    }
  }
}
