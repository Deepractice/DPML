/**
 * LLM连接器模块
 * 提供与大语言模型服务交互的接口和实现
 */

// 导出所有公共类型和接口
import type {
  LLMConnector,
  CompletionOptions,
  CompletionResult,
  CompletionChunk,
} from './LLMConnector';

import { LLMErrorType, LLMConnectorError } from './LLMConnector';

// 重新导出类型和类
export type {
  LLMConnector,
  CompletionOptions,
  CompletionResult,
  CompletionChunk,
};
export { LLMErrorType, LLMConnectorError };

// 导出连接器工厂和配置类型
import { LLMConnectorFactory } from './LLMConnectorFactory';

import type { LLMConfig } from './LLMConnectorFactory';

export { LLMConnectorFactory };
export type { LLMConfig };

// 导出具体连接器实现
export { OpenAIConnector } from './providers/OpenAIConnector';
export { AnthropicConnector } from './providers/AnthropicConnector';

// 导出抽象基类，以便用户可以扩展实现自己的连接器
export { AbstractLLMConnector } from './AbstractLLMConnector';
