import { AbstractLLMConnector } from '../AbstractLLMConnector';
import { LLMErrorType, LLMConnectorError } from '../LLMConnector';

import type {
  CompletionOptions,
  CompletionResult,
  CompletionChunk,
} from '../LLMConnector';

/**
 * OpenAI API响应类型
 */
interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI流式响应片段类型
 */
interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

/**
 * OpenAI API连接器实现
 */
export class OpenAIConnector extends AbstractLLMConnector {
  /**
   * API密钥
   */
  private apiKey: string;

  /**
   * API URL
   */
  private apiUrl: string;

  /**
   * OpenAI支持的模型列表缓存
   */
  private cachedModels: string[] = [];

  /**
   * 模型缓存过期时间
   */
  private modelCacheExpiry: number = 0;

  /**
   * 构造函数
   * @param apiKey OpenAI API密钥
   * @param apiUrl OpenAI API URL，默认为官方API
   */
  constructor(apiKey: string, apiUrl: string = 'https://api.openai.com/v1') {
    super('openai');
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * 获取支持的模型列表
   * 包含缓存机制，避免频繁API调用
   */
  async getSupportedModels(): Promise<string[]> {
    // 检查缓存是否有效
    const now = Date.now();

    if (this.cachedModels.length > 0 && now < this.modelCacheExpiry) {
      return this.cachedModels;
    }

    try {
      // 从OpenAI API获取模型列表
      const response = await fetch(`${this.apiUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // 处理错误响应
        await this.handleErrorResponse(response);
      }

      const data = await response.json();

      // 提取模型ID
      this.cachedModels = data.data.map((model: any) => model.id);

      // 设置缓存过期时间为1小时
      this.modelCacheExpiry = now + 3600000; // 1小时 = 3600000毫秒

      return this.cachedModels;
    } catch (error) {
      // 如果API调用失败但有缓存，返回过期缓存
      if (this.cachedModels.length > 0) {
        return this.cachedModels;
      }

      // 如果获取失败且没有缓存，返回常见模型列表
      this.cachedModels = [
        'gpt-4-turbo',
        'gpt-4',
        'gpt-4-32k',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
      ];

      return this.cachedModels;
    }
  }

  /**
   * 计算文本token数量
   * @param text 输入文本
   * @param model 模型名称
   */
  async countTokens(text: string, model: string): Promise<number> {
    // 简单实现：粗略估算
    // 注意：这是一个近似估算，GPT家族的模型约每4个字符为1个token
    // 实际应用中建议使用tiktoken等库进行准确计算
    return Math.ceil(text.length / 4);
  }

  /**
   * 执行LLM请求
   * @param options 请求选项
   * @returns 响应结果
   */
  protected async executeCompletion(
    options: CompletionOptions
  ): Promise<CompletionResult> {
    // 记录请求详情
    console.log('DEBUG: 发送到OpenAI的请求:');
    console.log(`DEBUG: API URL: ${this.apiUrl}`);
    console.log(`DEBUG: 模型: ${options.model}`);

    // 特别记录system prompt
    const systemMessages = options.messages.filter(m => m.role === 'system');

    if (systemMessages.length > 0) {
      console.log('DEBUG: 系统提示词:');
      systemMessages.forEach((m, i) => {
        console.log(`DEBUG: [${i}] ${m.content}`);
      });
    } else {
      console.log('DEBUG: 警告 - 请求中没有系统提示词!');
    }

    // 记录所有消息内容
    console.log('DEBUG: 所有消息:');
    options.messages.forEach((m, i) => {
      console.log(`DEBUG: [${i}] 角色=${m.role}, 内容长度=${m.content.length}`);
      console.log(
        `DEBUG: 内容预览: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`
      );
    });

    console.log(`DEBUG: 消息总数: ${options.messages.length}`);

    try {
      // 构建请求体
      const requestBody = {
        model: options.model,
        messages: options.messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        stop: options.stopSequences,
      };

      // 打印完整请求体
      console.log('==========================');
      console.log('完整请求体:');
      console.log(JSON.stringify(requestBody, null, 2));
      console.log('==========================');

      // 发送请求
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: options.signal,
      });

      if (!response.ok) {
        // 处理错误响应
        await this.handleErrorResponse(response);
      }

      // 解析响应
      const data = (await response.json()) as OpenAICompletionResponse;

      // 构建结果
      return {
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        finishReason: this.mapFinishReason(data.choices[0]?.finish_reason),
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
    // 构建请求体
    const requestBody = {
      model: options.model,
      messages: options.messages,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      stop: options.stopSequences,
      stream: true,
    };

    try {
      // 发送请求
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
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
      let streamRequestId = '';
      let modelName = options.model;

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
            // 跳过空行和注释
            if (!line || line.trim() === '') continue;
            if (line.startsWith(':')) continue;

            // 提取数据部分
            const dataLine = line.startsWith('data: ') ? line.slice(6) : line;

            // 处理心跳消息
            if (dataLine === '[DONE]') {
              yield {
                content: '',
                isLast: true,
                model: modelName,
                requestId: streamRequestId || requestId,
              };

              return;
            }

            try {
              // 解析JSON数据
              const chunk = JSON.parse(dataLine) as OpenAIStreamChunk;

              streamRequestId = chunk.id;
              modelName = chunk.model;

              const content = chunk.choices[0]?.delta?.content || '';
              const isLast = !!chunk.choices[0]?.finish_reason;
              const finishReason = this.mapFinishReason(
                chunk.choices[0]?.finish_reason || null
              );

              // 产生流块
              yield {
                content,
                isLast,
                finishReason: isLast ? finishReason : undefined,
                model: modelName,
                requestId: streamRequestId,
              };
            } catch (e) {
              console.error('解析流数据失败:', dataLine, e);
              // 跳过无效JSON，继续处理后续数据
            }
          }
        }

        // 处理可能的最后一条消息
        if (buffer.trim()) {
          try {
            if (buffer.startsWith('data: ')) {
              buffer = buffer.slice(6);
            }

            if (buffer === '[DONE]') {
              yield {
                content: '',
                isLast: true,
                model: modelName,
                requestId: streamRequestId || requestId,
              };

              return;
            }

            const chunk = JSON.parse(buffer) as OpenAIStreamChunk;

            streamRequestId = chunk.id;
            modelName = chunk.model;

            const content = chunk.choices[0]?.delta?.content || '';
            const isLast = !!chunk.choices[0]?.finish_reason;
            const finishReason = this.mapFinishReason(
              chunk.choices[0]?.finish_reason || null
            );

            yield {
              content,
              isLast,
              finishReason: isLast ? finishReason : undefined,
              model: modelName,
              requestId: streamRequestId,
            };
          } catch (e) {
            // 跳过无效JSON
            console.error('解析最后的流数据失败:', buffer, e);
          }
        }

        // 确保流有明确的结束
        yield {
          content: '',
          isLast: true,
          model: modelName,
          requestId: streamRequestId || requestId,
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
   * 映射OpenAI的完成原因到标准格式
   */
  private mapFinishReason(
    reason: string | null
  ): CompletionResult['finishReason'] {
    if (!reason) return undefined;

    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'error':
        return 'error';
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
    const errorCode = errorData.error?.code || `status_${response.status}`;

    // 映射HTTP状态码到错误类型
    let errorType: LLMErrorType;
    let retryable = false;
    let retryAfter: number | undefined;

    switch (response.status) {
      case 401:
        errorType = LLMErrorType.AUTHENTICATION;
        break;
      case 403:
        errorType = LLMErrorType.PERMISSION;
        break;
      case 404:
        errorType = LLMErrorType.MODEL_NOT_FOUND;
        break;
      case 400:
        errorType = LLMErrorType.BAD_REQUEST;
        break;
      case 429:
        errorType = LLMErrorType.RATE_LIMIT;
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
        errorType = LLMErrorType.SERVER;
        retryable = true;
        break;
      default:
        errorType = LLMErrorType.UNKNOWN;
    }

    throw new LLMConnectorError(errorMessage, errorType, {
      providerErrorCode: errorCode,
      retryable,
      retryAfter,
    });
  }
}
