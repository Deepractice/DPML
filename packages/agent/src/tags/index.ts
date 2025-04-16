/**
 * 标签模块导出
 */

// 导出标签定义
export * from './definitions/agentTag';
export * from './definitions/llmTag';
export * from './definitions/promptTag';

// 导出标签处理器
export * from './processors';

// 导出注册函数
export { registerTags } from './registerTags';
