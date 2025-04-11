/**
 * 标签定义和注册模块
 */

// 导出标签注册函数
export { registerAgentTags } from './registerTags';

// 导出标签定义
export { agentTagDefinition } from './definitions/agentTag';
export { llmTagDefinition } from './definitions/llmTag';
export { promptTagDefinition } from './definitions/promptTag';

// 导出标签验证函数
export { validateAgentTag } from './definitions/agentTag';
export { validateLLMTag } from './definitions/llmTag';

// 导出标签处理器
export * from './processors'; 