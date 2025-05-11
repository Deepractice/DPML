import { Observable, throwError, timer } from 'rxjs';
import { catchError, finalize, mergeMap, retryWhen, take, timeout } from 'rxjs/operators';

import type { ChatOutput } from '../../types/Chat';
import type { ContentItem } from '../../types/Content';
import { AgentError, AgentErrorType } from '../../types/errors';
import type { LLMConfig } from '../../types/LLMConfig';
import type { Message } from '../../types/Message';

import type { LLMClient } from './LLMClient';
import type { LLMRequest } from './LLMRequest';

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

  public sendRequest(request: LLMRequest): Observable<ChatOutput> {
    // 转换为OpenAI格式的消息
    const openaiMessages = this.convertToOpenAIMessages(request.messages);

    // 使用请求中的模型(如果提供)，否则使用默认模型
    const model = request.model || this.model;

    // 提取可能的OpenAI特有参数
    const { temperature, max_tokens, top_p, presence_penalty, frequency_penalty } =
      (request.providerParams || {}) as Record<string, number>;

    return new Observable<ChatOutput>(observer => {
      // 创建用于取消请求的AbortController
      const abortController = new AbortController();

      // 准备请求参数
      const requestBody: Record<string, unknown> = {
        model,
        messages: openaiMessages,
        stream: true
      };

      // 添加可选参数
      if (temperature !== undefined) requestBody.temperature = temperature;
      if (max_tokens !== undefined) requestBody.max_tokens = max_tokens;
      if (top_p !== undefined) requestBody.top_p = top_p;
      if (presence_penalty !== undefined) requestBody.presence_penalty = presence_penalty;
      if (frequency_penalty !== undefined) requestBody.frequency_penalty = frequency_penalty;

      // 发送流式请求
      fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal
      })
        .then(response => {
        // 检查响应状态
          if (!response.ok) {
            return response.text().then(errorData => {
              throw new AgentError(
                `OpenAI API流式请求失败: ${response.status} ${response.statusText} - ${errorData}`,
                AgentErrorType.LLM_SERVICE,
                'LLM_API_ERROR'
              );
            });
          }

          if (!response.body) {
            throw new AgentError(
              'OpenAI API流式响应没有响应体',
              AgentErrorType.LLM_SERVICE,
              'MISSING_RESPONSE_BODY'
            );
          }

          // 处理流式响应
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const processStream = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                observer.complete();

                return;
              }

              try {
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
                        observer.next({
                          content: {
                            type: 'text',
                            value: content
                          }
                        });
                      }
                    } catch (e) {
                      console.error('解析SSE事件失败:', e);
                      observer.error(new AgentError(
                        `解析SSE事件失败: ${e instanceof Error ? e.message : String(e)}`,
                        AgentErrorType.LLM_SERVICE,
                        'SSE_PARSING_ERROR',
                        e instanceof Error ? e : new Error(String(e))
                      ));

                      return;
                    }
                  }
                }

                // 继续处理流
                processStream();
              } catch (error) {
                observer.error(new AgentError(
                  `处理流式响应失败: ${error instanceof Error ? error.message : String(error)}`,
                  AgentErrorType.LLM_SERVICE,
                  'STREAM_PROCESSING_ERROR',
                  error instanceof Error ? error : new Error(String(error))
                ));
              }
            }).catch(error => {
            // 处理读取流时的错误
              if (error.name === 'AbortError') {
              // 请求被中止，这是预期的行为
                observer.complete();
              } else {
                observer.error(new AgentError(
                  `读取流失败: ${error.message}`,
                  AgentErrorType.LLM_SERVICE,
                  'STREAM_READ_ERROR',
                  error
                ));
              }
            });
          };

          // 开始处理流
          processStream();
        })
        .catch(error => {
        // 处理fetch调用本身的错误
          if (error.name === 'AbortError') {
          // 请求被中止，这是预期的行为
            observer.complete();
          } else {
            observer.error(error instanceof AgentError ? error : new AgentError(
              `LLM服务调用失败: ${error.message}`,
              AgentErrorType.LLM_SERVICE,
              'LLM_API_ERROR',
              error
            ));
          }
        });

      // 返回清理函数，用于取消请求
      return () => {
        abortController.abort();
      };
    }).pipe(
      // 添加30秒超时
      timeout({
        each: 30000,
        with: () => throwError(() => new AgentError(
          '请求超时',
          AgentErrorType.LLM_SERVICE,
          'REQUEST_TIMEOUT'
        ))
      }),

      // 针对特定错误类型进行重试
      retryWhen(errors => errors.pipe(
        // 仅重试网络相关错误
        mergeMap(error => {
          const shouldRetry =
            error instanceof AgentError &&
            error.type === AgentErrorType.LLM_SERVICE &&
            ['NETWORK_ERROR', 'RATE_LIMIT_EXCEEDED'].includes(error.code);

          if (shouldRetry) {
            console.log(`重试LLM请求: ${error.message}`);

            return timer(1000); // 1秒后重试
          }

          return throwError(() => error); // 其他错误不重试
        }),
        // 最多重试3次
        take(3)
      )),

      // 最终错误处理
      catchError(error => {
        console.error(`LLM请求失败: ${error.message}`, error);

        return throwError(() => error);
      }),

      // 资源清理
      finalize(() => {
      })
    );
  }

  private convertToOpenAIMessages(messages: ReadonlyArray<Message>): Record<string, unknown>[] {
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
        if (typeof item.value === 'string') {
          // 假设是图像URL
          return {
            type: 'image_url',
            image_url: {
              url: item.value
            }
          };
        } else if (item.value instanceof Uint8Array) {
          // 二进制图像数据
          return {
            type: 'image_url',
            image_url: {
              url: `data:${item.mimeType || 'image/jpeg'};base64,${this.arrayBufferToBase64(item.value)}`
            }
          };
        }

        return { type: 'text', text: '[不支持的图像格式]' };
      default:
        // 其他内容类型暂时以文本形式表示
        return `[不支持的内容类型: ${item.type}]`;
    }
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }
}
