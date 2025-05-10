import type { Tool } from '@modelcontextprotocol/sdk';
import { z } from 'zod';

/**
 * 标准MCP测试工具集合
 * 提供常用测试工具供测试使用
 */
export const createTestTools = (): Tool[] => {
  return [
    // 计算器工具
    {
      name: 'calculator',
      description: '执行基本数学运算',
      paramSchema: z.object({
        operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
        a: z.number(),
        b: z.number(),
      }),
      handler: async (params: { operation: 'add' | 'subtract' | 'multiply' | 'divide'; a: number; b: number }) => {
        let result = 0; // 初始化为0以避免"未赋值"错误

        switch (params.operation) {
          case 'add':
            result = params.a + params.b;
            break;
          case 'subtract':
            result = params.a - params.b;
            break;
          case 'multiply':
            result = params.a * params.b;
            break;
          case 'divide':
            if (params.b === 0) {
              return {
                content: [{ type: 'text', text: '错误：除数不能为零' }],
                isError: true,
              };
            }

            result = params.a / params.b;
            break;
        }

        return {
          content: [{ type: 'text', text: String(result) }],
        };
      },
    },

    // 搜索工具
    {
      name: 'search',
      description: '搜索指定内容',
      paramSchema: z.object({
        query: z.string(),
      }),
      handler: async (params: { query: string }) => {
        return {
          content: [{ type: 'text', text: `搜索结果: 关于"${params.query}"的结果` }],
        };
      },
    },

    // 错误测试工具
    {
      name: 'error_test',
      description: '返回错误的测试工具',
      paramSchema: z.object({
        shouldFail: z.boolean().optional(),
        errorMessage: z.string().optional(),
      }),
      handler: async (params: { shouldFail?: boolean; errorMessage?: string }) => {
        if (params.shouldFail) {
          return {
            content: [{ type: 'text', text: params.errorMessage || '测试错误' }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: '工具调用成功' }],
        };
      },
    },

    // 回显工具
    {
      name: 'echo',
      description: '回显输入内容',
      paramSchema: z.object({
        message: z.string(),
      }),
      handler: async (params: { message: string }) => {
        return {
          content: [{ type: 'text', text: params.message }],
        };
      },
    }
  ];
};
