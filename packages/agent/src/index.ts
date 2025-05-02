/**
 * DPML Agent模块
 *
 * 用于创建和管理AI对话代理。提供一组简洁的API，
 * 使应用开发者能够通过DPML定义AI助手，并与大语言模型服务进行交互。
 *
 * @example
 * ```typescript
 * import { createAgent } from '@dpml/session';
 *
 * const session = createAgent({
 *   llm: {
 *     apiType: 'openai',
 *     apiKey: process.env.OPENAI_API_KEY,
 *     model: 'gpt-4-turbo'
 *   },
 *   prompt: '你是一个专业的JavaScript和TypeScript助手。'
 * });
 *
 * const response = await session.chat('如何在TypeScript中实现单例模式？');
 * console.log(response);
 * ```
 */

// 导出API
export * from './api';

// 导出类型定义
export * from './types';
