import type { Schema } from '@dpml/core';

/**
 * Agent的DPML Schema定义
 *
 * 定义DPML文档的结构和约束规则，
 * 包括元素、属性和内容模型。
 */
export const schema: Schema = {
  // 根元素定义
  root: {
    element: 'agent',
    children: {
      elements: [
        { $ref: 'llm' },
        { $ref: 'prompt' },
        { $ref: 'mcp-servers' },
        { $ref: 'experimental' }
      ]
    }
  },
  // 可复用类型定义
  types: [
    {
      // LLM配置元素
      element: 'llm',
      attributes: [
        {
          name: 'api-type',
          required: true
        },
        {
          name: 'model',
          required: true
        },
        {
          name: 'api-key'
        },
        {
          name: 'api-url'
        }
      ]
    },
    {
      // 提示词元素
      element: 'prompt',
      content: {
        type: 'text',
        required: true
      }
    },
    {
      // 实验性功能元素
      element: 'experimental',
      children: {
        elements: [
          { $ref: 'tools' }
        ]
      }
    },
    // MCP服务器配置
    {
      element: 'mcp-servers',
      children: {
        elements: [
          { $ref: 'mcp-server' }
        ]
      }
    },
    {
      element: 'mcp-server',
      attributes: [
        {
          name: 'name',
          required: true
        },
        {
          name: 'enabled',
          type: 'boolean',
          default: 'true'
        },
        {
          name: 'type',
          enum: ['http', 'stdio']
        },
        {
          name: 'url'
        },
        {
          name: 'command'
        },
        {
          name: 'args'
        }
      ]
    },
    {
      // 工具元素
      element: 'tools',
      children: {
        elements: [
          { $ref: 'tool' }
        ]
      }
    },
    {
      // 工具配置
      element: 'tool',
      attributes: [
        {
          name: 'name',
          required: true
        },
        {
          name: 'description',
          required: true
        }
      ]
    }
  ]
};
