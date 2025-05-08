/**
 * 模拟的MCP SDK模块
 * 用于端到端测试
 */
import { vi } from 'vitest';

// 模拟函数类型别名
type MockFn<T extends (...args: any[]) => any> = T & ReturnType<typeof vi.fn>;

// 模拟客户端类型
export interface MockMCPClient {
  connect: MockFn<() => Promise<void>>;
  listTools: MockFn<() => Promise<any[]>>;
  callTool: MockFn<(params: { name: string; arguments: Record<string, unknown> }) => Promise<any>>;
}

/**
 * 创建模拟的MCP客户端
 */
export function createMCPClient(config: any): MockMCPClient {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    listTools: vi.fn().mockResolvedValue([
      {
        name: 'search',
        description: '搜索互联网获取信息',
        parameters: {
          schema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: '搜索查询' }
            },
            required: ['query']
          }
        }
      },
      {
        name: 'database',
        description: '查询数据库',
        parameters: {
          schema: {
            type: 'object',
            properties: {
              sql: { type: 'string', description: 'SQL查询' }
            },
            required: ['sql']
          }
        }
      }
    ]),
    callTool: vi.fn().mockImplementation((params) => {
      const { name, arguments: args } = params;

      if (name === 'search') {
        return Promise.resolve({
          result: {
            content: [{ type: 'text', text: `搜索"${args.query}"的结果：这是一些搜索结果。` }]
          }
        });
      } else if (name === 'database') {
        return Promise.resolve({
          result: {
            content: [{ type: 'text', text: `SQL查询结果：${args.sql}的执行结果。` }]
          }
        });
      }

      return Promise.reject(new Error(`未知工具: ${name}`));
    })
  };
}

// 导出整个模块作为默认导出
export default {
  createMCPClient
};
