import type { McpConfig } from '../../types/McpConfig';

/**
 * MCP测试夹具
 *
 * 提供用于测试的MCP配置示例。
 */

/**
 * 创建HTTP类型的MCP配置
 *
 * @param name 配置名称
 * @param url 服务器URL
 * @param enabled 是否启用
 * @returns MCP配置对象
 */
export function createHttpMcpConfig(
  name: string = 'test-http-mcp',
  url: string = 'http://localhost:3000/mcp',
  enabled: boolean = true
): McpConfig {
  return {
    name,
    enabled,
    type: 'http',
    http: { url }
  };
}

/**
 * 创建stdio类型的MCP配置
 *
 * @param name 配置名称
 * @param command 执行命令
 * @param args 命令参数
 * @param enabled 是否启用
 * @returns MCP配置对象
 */
export function createStdioMcpConfig(
  name: string = 'test-stdio-mcp',
  command: string = 'node',
  args: string[] = ['./server.js'],
  enabled: boolean = true
): McpConfig {
  return {
    name,
    enabled,
    type: 'stdio',
    stdio: { command, args }
  };
}

/**
 * 创建包含多个MCP服务器的XML配置
 *
 * @returns XML字符串
 */
export function createMcpXml(): string {
  return `
    <agent>
      <llm api-type="openai" model="gpt-4"></llm>
      <prompt>测试提示词</prompt>
      <mcp-servers>
        <mcp-server name="http-server" url="http://localhost:3000/mcp"></mcp-server>
        <mcp-server name="stdio-server" command="node" args="./server.js"></mcp-server>
        <mcp-server name="disabled-server" enabled="false" url="http://localhost:3001/mcp"></mcp-server>
      </mcp-servers>
    </agent>
  `;
}

/**
 * 创建带有MCP配置的AgentConfig对象
 *
 * @returns Agent配置对象
 */
export function createMcpAgentConfig(): any {
  return {
    llm: {
      apiType: 'openai',
      model: 'gpt-4'
    },
    prompt: '测试提示词',
    mcpServers: [
      createHttpMcpConfig('http-server', 'http://localhost:3000/mcp'),
      createStdioMcpConfig('stdio-server', 'node', ['./server.js']),
      {
        ...createHttpMcpConfig('disabled-server', 'http://localhost:3001/mcp'),
        enabled: false
      }
    ]
  };
}
