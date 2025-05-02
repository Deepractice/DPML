import type { DocumentSchema } from '@dpml/core';

/**
 * 工作流领域的Schema定义
 */
export const workflowSchema: DocumentSchema = {
  // 根元素定义
  root: {
    element: 'workflow',
    attributes: [
      {
        name: 'name',
        required: true
      },
      {
        name: 'version'
      }
    ],
    children: {
      elements: [
        // 通过$ref引用预定义类型
        { $ref: 'variables' },
        { $ref: 'step' },
        { $ref: 'transition' }
      ]
    }
  },
  // 可复用类型定义
  types: [
    {
      // 定义variables元素类型
      element: 'variables',
      children: {
        elements: [
          // 引用variable类型
          { $ref: 'variable' }
        ],
        min: 1
      }
    },
    {
      // 定义variable元素类型
      element: 'variable',
      attributes: [
        {
          name: 'name',
          required: true
        },
        {
          name: 'type',
          enum: ['string', 'number', 'boolean'],
          default: 'string'
        }
      ],
      content: {
        type: 'text'
      }
    },
    {
      // 定义step元素类型
      element: 'step',
      attributes: [
        {
          name: 'id',
          required: true
        },
        {
          name: 'type',
          enum: ['start', 'process', 'decision', 'end'],
          required: true
        }
      ],
      content: {
        type: 'text',
        required: true
      }
    },
    {
      // 定义transition元素类型
      element: 'transition',
      attributes: [
        {
          name: 'from',
          required: true
        },
        {
          name: 'to',
          required: true
        },
        {
          name: 'condition'
        }
      ]
    }
  ],
  // 全局属性定义
  globalAttributes: [
    {
      name: 'description'
    }
  ]
};
