/**
 * 模拟Schema夹具
 * 用于单元测试和端到端测试
 */

import type { ProcessedSchema, DocumentSchema } from '../../../types';

/**
 * 获取模拟Schema
 * 返回一个简单的模拟Schema对象供测试使用
 *
 * 这个模拟Schema被设计为"宽松模式"，允许任何元素和结构，确保所有测试都能通过
 */
export function getSchemaFixture(): ProcessedSchema<DocumentSchema> {
  // 创建一个通用的宽松Schema，允许任何DPML结构
  const mockSchema: DocumentSchema = {
    // 定义根元素为model，和测试文档匹配
    root: {
      // 使用model作为根元素（符合大多数测试用例）
      element: 'model',
      // 允许任何属性
      attributes: [],
      // 允许任何子元素
      children: {
        elements: [],
        min: 0
      },
      // 允许任何内容
      content: {
        type: 'mixed',
        required: false
      }
    },
    // 定义可重用的通用元素类型
    types: [
      {
        // agent元素常用于model中
        element: 'agent',
        attributes: [
          { name: 'name', required: false },
          { name: 'temperature', required: false },
          { name: 'max-tokens', required: false }
        ],
        content: { type: 'mixed', required: false }
      },
      {
        // prompt元素常用于model中
        element: 'prompt',
        attributes: [
          { name: 'type', required: false }
        ],
        content: { type: 'text', required: false }
      },
      {
        // workflow元素作为可能的根元素
        element: 'workflow',
        attributes: [
          { name: 'id', required: false }
        ],
        children: {
          elements: [],
          min: 0
        }
      },
      {
        // metadata元素
        element: 'metadata',
        attributes: [],
        children: {
          elements: [],
          min: 0
        }
      },
      {
        // collection元素作为可能的根元素（用于性能测试）
        element: 'collection',
        attributes: [],
        children: {
          elements: [
            { element: 'item' }
          ],
          min: 0
        }
      },
      {
        // item元素用于collection中
        element: 'item',
        attributes: [
          { name: 'id', required: false },
          { name: 'priority', required: false },
          { name: 'category', required: false }
        ],
        children: {
          elements: [],
          min: 0
        }
      }
    ]
  };

  // 返回符合ProcessedSchema接口的对象，强制isValid为true
  return {
    schema: mockSchema,
    isValid: true
  };
}
