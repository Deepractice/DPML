/**
 * Framework CLI测试夹具
 * 提供CLI相关测试的夹具函数和数据
 */

import type { DomainContext } from '../../../core/framework/types';
import type { DomainAction } from '../../../types/DomainAction';
import type { Schema } from '../../../types/Schema';

/**
 * 创建基本领域配置夹具（包含CLI命令）
 */
export function createDomainConfigWithCommandsFixture() {
  return {
    domain: 'test-domain',
    description: '测试领域',
    schema: {
      root: {
        element: 'test',
        attributes: [
          { name: 'id', type: 'string', required: true }
        ],
        children: {
          elements: []
        }
      }
    },
    transformers: [{
      name: 'TestTransformer',
      transform: (data: unknown) => ({ result: 'transformed' })
    }],
    commands: {
      includeStandard: true,
      actions: [
        {
          name: 'custom-action',
          description: '自定义命令',
          args: [
            { name: 'input', description: '输入文件', required: true }
          ],
          options: [
            { flags: '--format <type>', description: '输出格式' }
          ],
          executor: async (context, input, options) => {
            // 测试执行器逻辑
            return `Executed with ${input} and ${options?.format || 'default'}`;
          }
        }
      ]
    }
  };
}

/**
 * 创建标准命令测试夹具
 */
export function createStandardActionTestFixture() {
  // 提供测试标准命令需要的上下文和参数
  return {
    context: {
      domain: 'test',
      description: '测试领域',
      schema: {
        root: {
          element: 'test',
          attributes: [
            { name: 'id', type: 'string', required: true }
          ],
          children: {
            elements: []
          }
        }
      },
      transformers: [],
      options: {
        strictMode: true,
        errorHandling: 'throw',
        transformOptions: { resultMode: 'merged' },
        custom: {}
      },
      compiler: {
        compile: async (content: string) => ({ result: 'compiled' }),
        extend: () => {},
        getSchema: () => ({}),
        getTransformers: () => []
      }
    } as DomainContext,
    args: {
      file: 'test.dpml',
      options: {
        strict: true,
        output: 'output.json',
        format: 'json'
      }
    },
    fileContent: '<test id="123">Test content</test>'
  };
}

/**
 * 创建Command测试夹具
 */
export function createCommandDefinitionFixture() {
  return {
    name: 'test:command',
    description: '测试命令',
    domain: 'test',
    arguments: [
      { name: 'arg1', description: '参数1', required: true }
    ],
    options: [
      { flags: '-o, --option <value>', description: '选项' }
    ],
    action: async (...args: any[]) => {
      // 测试命令动作
    }
  };
}

/**
 * 创建DomainAction测试夹具
 */
export function createDomainActionFixture(): DomainAction {
  return {
    name: 'test-action',
    description: '测试动作',
    args: [
      { name: 'arg1', description: '参数1', required: true }
    ],
    options: [
      { flags: '-o, --option <value>', description: '选项' }
    ],
    action: async (context, arg1, options) => {
      // 测试执行器
      return `Executed with ${arg1}`;
    }
  };
}

/**
 * 创建测试文件内容
 */
export function createTestFileContent() {
  return '<test id="123">Test content</test>';
}

/**
 * 创建无效的测试文件内容
 */
export function createInvalidTestFileContent() {
  return '<invalid>Missing required id attribute</invalid>';
}
