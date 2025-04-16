import { AbstractLLMConnector } from '../AbstractLLMConnector';
import { LLMErrorType, LLMConnectorError } from '../LLMConnector';

import type {
  CompletionOptions,
  CompletionResult,
  CompletionChunk,
} from '../LLMConnector';

/**
 * Anthropic API响应类型
 */
interface AnthropicCompletionResponse {
  id: string;
  type: string;
  model: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  stop_reason: string;
}

/**
 * Anthropic流式响应片段类型
 */
interface AnthropicStreamChunk {
  type: string;
  index: number;
  delta?: {
    type: string;
    text?: string;
  };
  content?: Array<{
    type: string;
    text?: string;
  }>;
  message?: {
    id: string;
    model: string;
  };
  stop_reason?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Anthropic API连接器实现
 */
export class AnthropicConnector extends AbstractLLMConnector {
  /**
   * API密钥
   */
  private apiKey: string;

  /**
   * API URL
   */
  private apiUrl: string;

  /**
   * API版本头
   */
  private apiVersion: string;

  /**
   * Anthropic支持的模型列表缓存
   */
  private cachedModels: string[] = [];

  /**
   * 模型缓存过期时间
   */
  private modelCacheExpiry: number = 0;

  /**
   * 构造函数
   * @param apiKey Anthropic API密钥
   * @param apiUrl Anthropic API URL，默认为官方API
   * @param apiVersion Anthropic API版本头，默认为 '2023-06-01'
   */
  constructor(
    apiKey: string,
    apiUrl: string = 'https://api.anthropic.com',
    apiVersion: string = '2023-06-01'
  ) {
    super('anthropic');
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.apiVersion = apiVersion;
  }

  /**
   * 获取支持的模型列表
   * Anthropic没有获取模型列表的官方API，返回已知模型
   */
  async getSupportedModels(): Promise<string[]> {
    // 检查缓存是否有效
    const now = Date.now();

    if (this.cachedModels.length > 0 && now < this.modelCacheExpiry) {
      return this.cachedModels;
    }

    // Anthropic没有获取模型列表的官方API，返回已知模型
    this.cachedModels = [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2',
    ];

    // 设置缓存过期时间为24小时
    this.modelCacheExpiry = now + 86400000; // 24小时 = 86400000毫秒

    return this.cachedModels;
  }

  /**
   * 计算文本token数量
   * @param text 输入文本
   * @param model 模型名称
   */
  async countTokens(text: string, model: string): Promise<number> {
    // 简单实现：粗略估算
    // 注意：这是一个近似估算，Claude家族的模型约每4个字符为1个token
    // 实际应用中建议使用更准确的工具
    return Math.ceil(text.length / 4);
  }

  /**
   * 执行完成请求
   * @param options 完成选项
   * @param abortSignal 中止信号
   * @param requestId 请求ID
   */
  protected async executeCompletion(
    options: CompletionOptions,
    abortSignal: AbortSignal,
    requestId: string
  ): Promise<CompletionResult> {
    // 转换消息格式为Anthropic格式
    const messages = this.convertMessagesToAnthropicFormat(options.messages);

    // 构建请求体
    const requestBody = {
      model: options.model,
      messages,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature,
      top_p: options.topP,
      stop_sequences: options.stopSequences,
    };

    try {
      // 发送请求
      const response = await fetch(`${this.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortSignal,
      });

      if (!response.ok) {
        // 处理错误响应
        await this.handleErrorResponse(response);
      }

      // 解析响应
      const data = (await response.json()) as AnthropicCompletionResponse;

      // 提取内容
      const content =
        data.content.find(item => item.type === 'text')?.text || '';

      // 构建结果
      return {
        content,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        finishReason: this.mapFinishReason(data.stop_reason),
        requestId: data.id,
        model: data.model,
      };
    } catch (error) {
      // 转换为LLMConnectorError
      throw this.normalizeError(error);
    }
  }

  /**
   * 执行流式完成请求
   * @param options 完成选项
   * @param abortSignal 中止信号
   * @param requestId 请求ID
   */
  protected async *executeCompletionStream(
    options: CompletionOptions,
    abortSignal: AbortSignal,
    requestId: string
  ): AsyncIterable<CompletionChunk> {
    // 转换消息格式为Anthropic格式
    const messages = this.convertMessagesToAnthropicFormat(options.messages);

    // 构建请求体
    const requestBody = {
      model: options.model,
      messages,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature,
      top_p: options.topP,
      stop_sequences: options.stopSequences,
      stream: true,
    };

    try {
      // 发送请求
      const response = await fetch(`${this.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortSignal,
      });

      if (!response.ok) {
        // 处理错误响应
        await this.handleErrorResponse(response);
      }

      if (!response.body) {
        throw new LLMConnectorError('响应没有返回数据流', LLMErrorType.SERVER);
      }

      // 创建流读取器
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamRequestId = requestId;
      let modelName = options.model;
      let finishReason: CompletionResult['finishReason'];

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // 解码并处理数据块
          buffer += decoder.decode(value, { stream: true });

          // 处理缓冲区中的所有完整事件
          const lines = buffer.split('\n');

          buffer = lines.pop() || ''; // 最后一行可能不完整，保留到下一次

          for (const line of lines) {
            // 跳过空行
            if (!line || line.trim() === '') continue;

            // 检查是否为数据行
            if (!line.startsWith('data: ')) continue;

            // 提取数据部分
            const dataLine = line.slice(6);

            // 处理流结束标记
            if (dataLine === '[DONE]') {
              yield {
                content: '',
                isLast: true,
                finishReason,
                model: modelName,
                requestId: streamRequestId,
              };

              return;
            }

            try {
              // 解析JSON数据
              const chunk = JSON.parse(dataLine) as AnthropicStreamChunk;

              // 处理不同类型的事件
              switch (chunk.type) {
                case 'message_start':
                  // 获取请求ID和模型信息
                  if (chunk.message && chunk.message.id) {
                    streamRequestId = chunk.message.id;
                  }

                  if (chunk.message && chunk.message.model) {
                    modelName = chunk.message.model;
                  }

                  break;

                case 'content_block_start':
                  // 内容块开始
                  break;

                case 'content_block_delta':
                  // 内容块增量
                  if (chunk.delta && chunk.delta.text) {
                    yield {
                      content: chunk.delta.text,
                      isLast: false,
                      model: modelName,
                      requestId: streamRequestId,
                    };
                  }

                  break;

                case 'message_delta':
                  // 消息增量，可能包含usage信息
                  break;

                case 'message_stop':
                  // 消息结束
                  if (chunk.stop_reason) {
                    finishReason = this.mapFinishReason(chunk.stop_reason);
                  }

                  yield {
                    content: '',
                    isLast: true,
                    finishReason,
                    model: modelName,
                    requestId: streamRequestId,
                  };

                  return;
              }
            } catch (e) {
              console.error('解析流数据失败:', dataLine, e);
              // 跳过无效JSON，继续处理后续数据
            }
          }
        }

        // 确保流有明确的结束
        yield {
          content: '',
          isLast: true,
          model: modelName,
          requestId: streamRequestId,
        };
      } finally {
        // 确保流正确关闭
        reader.releaseLock();
      }
    } catch (error) {
      // 转换为LLMConnectorError
      throw this.normalizeError(error);
    }
  }

  /**
   * 将通用消息格式转换为Anthropic格式
   */
  private convertMessagesToAnthropicFormat(
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>
  ): Array<{
    role: string;
    content: string | Array<{ type: string; text: string }>;
  }> {
    const result: Array<{
      role: string;
      content: string | Array<{ type: string; text: string }>;
    }> = [];

    // 提取系统消息
    const systemMessages = messages.filter(m => m.role === 'system');
    const systemContent = systemMessages.map(m => m.content).join('\n\n');

    // 其他消息
    const otherMessages = messages.filter(m => m.role !== 'system');

    // 如果有系统消息，添加为第一条消息的系统参数
    if (systemContent) {
      result.push({
        role: 'system',
        content: systemContent,
      });
    }

    // 添加其他消息
    for (const msg of otherMessages) {
      result.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: [
          {
            type: 'text',
            text: msg.content,
          },
        ],
      });
    }

    return result;
  }

  /**
   * 映射Anthropic的完成原因到标准格式
   */
  private mapFinishReason(reason: string): CompletionResult['finishReason'] {
    switch (reason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'stop_sequence':
        return 'stop';
      case 'safety':
        return 'content_filter';
      default:
        return undefined;
    }
  }

  /**
   * 处理错误响应
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = {};

    try {
      errorData = await response.json();
    } catch (e) {
      // 如果无法解析JSON，使用状态文本
      errorData = { error: { message: response.statusText } };
    }

    const errorMessage =
      errorData.error?.message || `API调用失败: ${response.status}`;
    const errorType = errorData.error?.type || `status_${response.status}`;

    // 映射HTTP状态码到错误类型
    let llmErrorType: LLMErrorType;
    let retryable = false;
    let retryAfter: number | undefined;

    switch (response.status) {
      case 401:
        llmErrorType = LLMErrorType.AUTHENTICATION;
        break;
      case 403:
        llmErrorType = LLMErrorType.PERMISSION;
        break;
      case 404:
        llmErrorType = LLMErrorType.MODEL_NOT_FOUND;
        break;
      case 400:
        llmErrorType = LLMErrorType.BAD_REQUEST;
        break;
      case 429:
        llmErrorType = LLMErrorType.RATE_LIMIT;
        retryable = true;
        // 尝试从响应头获取重试延迟
        const retryHeader = response.headers.get('retry-after');

        if (retryHeader) {
          retryAfter = parseInt(retryHeader, 10) * 1000; // 转换为毫秒
        }

        break;
      case 500:
      case 502:
      case 503:
      case 504:
        llmErrorType = LLMErrorType.SERVER;
        retryable = true;
        break;
      default:
        llmErrorType = LLMErrorType.UNKNOWN;
    }

    throw new LLMConnectorError(errorMessage, llmErrorType, {
      providerErrorCode: errorType,
      retryable,
      retryAfter,
    });
  }
}
