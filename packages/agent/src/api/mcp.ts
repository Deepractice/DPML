import { registerEnhancer } from '../core/mcpService';
import type { McpConfig } from '../types/McpConfig';

/**
 * 注册MCP增强器
 *
 * 向系统注册一个MCP增强器，用于为LLMClient添加工具调用能力。
 *
 * @param config MCP配置
 */
export function registerMcp(config: McpConfig): void {
  // 委托给mcpService注册增强器
  registerEnhancer(config);
}
