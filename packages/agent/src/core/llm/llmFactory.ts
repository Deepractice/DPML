import { AgentError, AgentErrorType } from '../../types';
import type { LLMConfig } from '../../types';

import type { LLMClient } from './LLMClient';
import { OpenAIClient } from './OpenAIClient';

/**
 * 创建LLM客户端实例
 *
 * @param config LLM配置
 * @returns LLM客户端实例
 */
export function createClient(config: LLMConfig): LLMClient {
  switch (config.apiType.toLowerCase()) {
    case 'openai':
      return new OpenAIClient(config);
    // TODO: 添加其他LLM服务支持
    // case 'anthropic':
    //   return new AnthropicClient(config);
    default:
      throw new AgentError(
        `不支持的API类型: ${config.apiType}`,
        AgentErrorType.CONFIG,
        'UNSUPPORTED_LLM_TYPE'
      );
  }
}
