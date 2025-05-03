import type { DocumentSchema } from '@dpml/core';

/**
 * Agent的DPML Schema定义
 *
 * 定义DPML文档的结构和约束规则，
 * 包括元素、属性和内容模型。
 */
export const schema: DocumentSchema = {
  // 根元素定义
  root: {
    element: 'agent',
    children: {
      elements: [
        { $ref: 'llm' },
        { $ref: 'prompt' },
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
          name: 'api-url'
        },
        {
          name: 'api-key'
        },
        {
          name: 'model',
          required: true
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
    {
      // 工具集元素
      element: 'tools',
      children: {
        elements: [
          { $ref: 'tool' }
        ]
      }
    },
    {
      // 工具元素
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
