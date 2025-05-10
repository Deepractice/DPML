import { createTransformerDefiner } from '@dpml/core';
import type { DPMLNode } from '@dpml/core';

import type { AgentConfig } from '../types/AgentConfig';
import type { McpConfig } from '../types/McpConfig';

// 创建转换器定义器
const definer = createTransformerDefiner();

/**
 * Agent配置转换器
 *
 * 将DPML文档转换为AgentConfig对象
 */
export const agentTransformer = definer.defineStructuralMapper<unknown, AgentConfig>(
  'agentTransformer',
  [
    {
      selector: 'agent > llm',
      targetPath: 'llm',
      transform: (value: unknown) => {
        const node = value as DPMLNode;
        const apiType = node.attributes.get('api-type');
        const model = node.attributes.get('model');
        const apiKey = node.attributes.get('api-key');
        const apiUrl = node.attributes.get('api-url');

        return {
          apiType,
          model,
          apiKey,
          apiUrl
        };
      }
    },
    {
      selector: 'agent > prompt',
      targetPath: 'prompt',
      transform: (value: unknown) => {
        const node = value as DPMLNode;

        return node.content || '';
      }
    }
  ]
);

/**
 * MCP服务器配置转换器
 *
 * 将DPML文档中的MCP服务器配置转换为McpConfig数组
 */
export const mcpTransformer = definer.defineStructuralMapper<unknown, AgentConfig>(
  'mcpTransformer',
  [
    {
      selector: 'agent > mcp-servers',
      targetPath: 'mcpServers',
      transform: (value: unknown) => {
        // 获取所有MCP服务器节点
        const node = value as DPMLNode;
        const serverNodes = node.children?.filter(child => child.tagName === 'mcp-server') || [];

        if (serverNodes.length === 0) {
          return undefined;
        }

        return serverNodes.map(serverNode => {
          const name = serverNode.attributes.get('name');
          const enabled = serverNode.attributes.get('enabled') !== 'false';
          const explicitType = serverNode.attributes.get('type') as 'http' | 'stdio' | undefined;
          const url = serverNode.attributes.get('url');
          const command = serverNode.attributes.get('command');
          const argsStr = serverNode.attributes.get('args');

          // 解析args字符串为数组
          const args = argsStr ? argsStr.split(' ') : undefined;

          // 推断传输类型
          const type = inferTransportType(explicitType, command, url);

          // 根据类型创建配置
          if (type === 'http') {
            return {
              name,
              enabled,
              type,
              http: { url: url || '' }
            } as McpConfig;
          } else {
            return {
              name,
              enabled,
              type,
              stdio: {
                command: command || '',
                args
              }
            } as McpConfig;
          }
        });
      }
    }
  ]
);

/**
 * 推断MCP服务器传输类型
 *
 * 根据配置属性推断传输类型：
 * 1. 如果明确指定了类型，则使用指定的类型
 * 2. 如果有command属性，则使用stdio传输
 * 3. 如果有url属性，则使用http传输
 * 4. 默认使用stdio传输
 *
 * @param explicitType 明确指定的类型
 * @param command 命令属性
 * @param url URL属性
 * @returns 推断的传输类型
 */
function inferTransportType(
  explicitType?: string,
  command?: string,
  url?: string
): 'http' | 'stdio' {
  // 如果明确指定了类型，则使用指定的类型
  if (explicitType === 'http') {
    return 'http';
  } else if (explicitType === 'stdio') {
    return 'stdio';
  }

  // 否则根据提供的属性推断
  if (command) {
    return 'stdio';
  } else if (url) {
    return 'http';
  }

  // 默认为stdio
  return 'stdio';
}

// 导出所有转换器
export const transformers = [agentTransformer, mcpTransformer];
