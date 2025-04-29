import { processSchema } from '../src/api/schema';
import type { ElementSchema, DocumentSchema } from '../src/types/Schema';

// 示例1：定义一个简单的元素Schema
const buttonSchema: ElementSchema = {
  element: 'button',
  attributes: [
    {
      name: 'type',
      type: 'string',
      enum: ['primary', 'secondary', 'danger']
    },
    {
      name: 'disabled',
      type: 'boolean'
    }
  ],
  content: {
    type: 'text'
  }
};

// 验证简单元素Schema
const buttonResult = processSchema(buttonSchema);

console.log('Button Schema 验证结果:', buttonResult.isValid);
if (!buttonResult.isValid && buttonResult.errors) {
  console.log('错误:', buttonResult.errors);
}

// 示例2：定义一个包含类型引用的文档Schema
const promptDocumentSchema: DocumentSchema = {
  root: {
    element: 'prompt',
    children: {
      elements: [
        { $ref: 'role' },
        { $ref: 'context' },
        { $ref: 'thinking' }
      ]
    }
  },
  types: [
    {
      element: 'role',
      attributes: [
        {
          name: 'type',
          type: 'string',
          enum: ['system', 'user', 'assistant']
        }
      ],
      content: {
        type: 'text',
        required: true
      }
    },
    {
      element: 'context',
      content: {
        type: 'text'
      }
    },
    {
      element: 'thinking',
      content: {
        type: 'text'
      }
    }
  ],
  globalAttributes: [
    {
      name: 'id',
      type: 'string'
    }
  ]
};

// 验证文档Schema
const promptResult = processSchema(promptDocumentSchema);

console.log('Prompt Document Schema 验证结果:', promptResult.isValid);
if (!promptResult.isValid && promptResult.errors) {
  console.log('错误:', promptResult.errors);
}

// 示例3：故意定义一个无效的元素Schema
const invalidElementSchema = {
  // 缺少 element 属性
  attributes: [
    {
      name: 'type',
      type: 'string'
    }
  ]
};

// 验证无效元素Schema
const invalidResult = processSchema(invalidElementSchema);

console.log('无效元素Schema验证结果:', invalidResult.isValid);
if (!invalidResult.isValid && invalidResult.errors) {
  console.log('错误:', invalidResult.errors);
}
