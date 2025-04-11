/**
 * LLM连接器模块
 * 提供与大语言模型服务交互的接口和实现
 */

// 导出所有公共类型和接口
export {
  LLMConnector,
  CompletionOptions, 
  CompletionResult, 
  CompletionChunk,
  LLMErrorType,
  LLMConnectorError
} from './LLMConnector';

// 导出连接器工厂和配置类型
export {
  LLMConnectorFactory,
  LLMConfig
} from './LLMConnectorFactory';

// 导出具体连接器实现
export { OpenAIConnector } from './providers/OpenAIConnector';
export { AnthropicConnector } from './providers/AnthropicConnector';

// 导出抽象基类，以便用户可以扩展实现自己的连接器
export { AbstractLLMConnector } from './AbstractLLMConnector'; 