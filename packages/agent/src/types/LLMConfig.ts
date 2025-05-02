/**
 * LLM配置
 *
 * 定义连接LLM服务所需的配置信息。
 */
export interface LLMConfig {
  /**
   * API提供商类型，如"openai"、"anthropic"等
   */
  readonly apiType: string;

  /**
   * API端点URL，可选
   */
  readonly apiUrl?: string;

  /**
   * API密钥
   */
  readonly apiKey?: string;

  /**
   * 使用的模型名称
   */
  readonly model: string;
}
