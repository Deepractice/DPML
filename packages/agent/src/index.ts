/**
 * DPML Agent模块
 *
 * 用于创建和管理AI对话代理。提供一组简洁的API，
 * 使应用开发者能够通过DPML定义AI助手，并与大语言模型服务进行交互。
 *
 * @example
 * ```typescript
 * import { createAgent } from '@dpml/agent';
 *
 * const agent = createAgent({
 *   llm: {
 *     apiType: 'openai',
 *     apiKey: process.env.OPENAI_API_KEY,
 *     model: 'gpt-4-turbo'
 *   },
 *   prompt: '你是一个专业的JavaScript和TypeScript助手。'
 * });
 *
 * const response = await agent.chat('如何在TypeScript中实现单例模式？');
 * console.log(response);
 * ```
 *
 * 或者使用DPML声明式语法：
 * ```typescript
 * import { createAgent, compiler } from '@dpml/agent';
 *
 * // DPML配置
 * const dpmlContent = `
 * <agent>
 *   <llm api-type="openai" api-key="@agentenv:OPENAI_API_KEY" model="gpt-4-turbo"></llm>
 *   <prompt>你是一个专业的JavaScript和TypeScript助手。</prompt>
 * </agent>
 * `;
 *
 * // 编译DPML为AgentConfig
 * const config = await compiler.compile(dpmlContent);
 *
 * // 创建Agent
 * const agent = createAgent(config);
 * ```
 */

import { createDomainDPML } from '@dpml/core';

import { schema, transformers, commandsConfig } from './config';
import type { AgentConfig } from './types';

// 导出API
export * from './api';

// 导出类型定义
export * from './types';

/**
 * 创建Agent领域DPML实例
 *
 * 集成Schema、转换器和CLI配置，
 * 提供编译和命令行功能。
 */
export const agentDPML = createDomainDPML<AgentConfig>({
  domain: 'agent',
  description: 'Agent配置领域',
  schema,
  transformers,
  commands: commandsConfig,
  options: {
    strictMode: true,
    errorHandling: 'throw'
  }
});

/**
 * 导出编译器，便于直接使用
 */
export const compiler = agentDPML.compiler;
