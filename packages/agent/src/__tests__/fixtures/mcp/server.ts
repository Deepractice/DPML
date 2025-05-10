import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createTestTools } from './tools';

/**
 * 创建用于测试的MCP服务器实例
 * @param serverName 服务器名称
 * @param version 服务器版本
 * @returns 创建的MCP服务器实例
 */
export const createTestMcpServer = async (
  serverName = 'test-mcp-server',
  version = '1.0.0'
): Promise<McpServer> => {
  console.info(`[TestMcpServer] 正在创建 MCP 测试服务器: ${serverName} v${version}`);

  // 创建服务器实例
  const server = new McpServer({
    name: serverName,
    version: version
  });

  // 注册测试工具
  const tools = createTestTools();
  for (const tool of tools) {
    server.tool(
      tool.name,
      tool.paramSchema,
      tool.handler
    );
    console.info(`[TestMcpServer] 已注册工具: ${tool.name}`);
  }

  return server;
};

/**
 * 创建并连接测试MCP服务器
 * @param transport 传输方式
 * @param serverName 服务器名称
 * @param version 服务器版本
 * @returns 创建并连接的MCP服务器实例
 */
export const createAndConnectTestMcpServer = async (
  transport: any,
  serverName = 'test-mcp-server',
  version = '1.0.0'
): Promise<McpServer> => {
  const server = await createTestMcpServer(serverName, version);
  
  console.info('[TestMcpServer] 正在连接到传输...');
  try {
    await server.connect(transport);
    console.info('[TestMcpServer] 服务器连接成功');
  } catch (error) {
    console.error('[TestMcpServer] 服务器连接失败', error);
    throw error;
  }
  
  return server;
}; 