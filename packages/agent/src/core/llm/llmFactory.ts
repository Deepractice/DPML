import { AgentError, AgentErrorType } from '../../types';
import type { LLMConfig } from '../../types';

import { AnthropicClient } from './AnthropicClient';
import type { LLMClient } from './LLMClient';
import { OpenAIClient } from './OpenAIClient';

/**
 * 验证LLM配置的基本有效性
 * @param config LLM配置
 */
function validateConfig(config: LLMConfig): void {
  // 验证模型名称
  if (!config.model) {
    throw new AgentError(
      '缺少必要的模型名称参数',
      AgentErrorType.CONFIG,
      'MISSING_MODEL_NAME'
    );
  }

  // 验证OpenAI配置
  if (config.apiType.toLowerCase() === 'openai' && !config.apiKey) {
    throw new AgentError(
      'OpenAI API密钥未提供',
      AgentErrorType.CONFIG,
      'MISSING_API_KEY'
    );
  }

  // 验证Anthropic配置
  if (config.apiType.toLowerCase() === 'anthropic' && !config.apiKey) {
    throw new AgentError(
      'Anthropic API密钥未提供',
      AgentErrorType.CONFIG,
      'MISSING_API_KEY'
    );
  }
}

/**
 * 创建LLM客户端实例
 *
 * @param config LLM配置
 * @returns LLM客户端实例
 */
export function createClient(config: LLMConfig): LLMClient {
  // 首先验证配置的基本有效性
  validateConfig(config);

  switch (config.apiType.toLowerCase()) {
    case 'openai':
      return new OpenAIClient(config);
    case 'anthropic':
      return new AnthropicClient(config);
    default:
      throw new AgentError(
        `不支持的API类型: ${config.apiType}`,
        AgentErrorType.CONFIG,
        'UNSUPPORTED_LLM_TYPE'
      );
  }
}
