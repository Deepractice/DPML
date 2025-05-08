import type { McpConfig } from '../types';
import { McpError, McpErrorType } from '../types/McpError';

import type { LLMClient } from './llm/LLMClient';
import { McpRegistry } from './mcp/McpRegistry';

/**
 * 注册MCP增强器
 *
 * @param config MCP配置
 */
export function registerEnhancer(config: McpConfig): void {
  try {
    console.log(`注册MCP增强器: ${config.name}`);

    // 获取全局注册表
    const registry = getRegistry();

    // 注册增强器
    registry.registerEnhancer(config);

    console.log(`MCP增强器 ${config.name} 注册成功`);
  } catch (error) {
    // 统一错误处理
    handleErrors(error);
  }
}

/**
 * 增强LLM客户端
 *
 * 为LLM客户端添加工具调用能力。
 *
 * @param llmClient 原始LLM客户端
 * @param mcpName MCP名称
 * @returns 增强的LLM客户端
 */
export function enhanceLLMClient(llmClient: LLMClient, mcpName: string): LLMClient {
  try {
    console.log(`使用MCP增强器 ${mcpName} 增强LLM客户端`);

    // 获取注册表
    const registry = getRegistry();

    // 获取指定的增强器
    const enhancer = registry.getEnhancer(mcpName);

    // 使用增强器增强LLM客户端
    const enhancedClient = enhancer.enhance(llmClient);

    console.log('LLM客户端增强成功');

    return enhancedClient;
  } catch (error) {
    // 统一错误处理
    handleErrors(error);
  }
}

/**
 * 获取MCP注册表
 */
export function getRegistry(): McpRegistry {
  return McpRegistry.getInstance();
}

/**
 * 重置MCP注册表（仅用于测试）
 */
export function resetRegistry(): void {
  console.log('重置MCP注册表');
  // 直接委托给McpRegistry的静态方法
  McpRegistry.reset();
}

/**
 * 统一错误处理
 */
function handleErrors(error: unknown): never {
  console.error('MCP操作失败:', error);

  // 已经是McpError则直接抛出
  if (error instanceof McpError) {
    throw error;
  }

  // 包装为McpError
  throw new McpError(
    McpErrorType.UNKNOWN_ERROR,
    `MCP操作失败: ${error instanceof Error ? error.message : String(error)}`,
    error
  );
}
