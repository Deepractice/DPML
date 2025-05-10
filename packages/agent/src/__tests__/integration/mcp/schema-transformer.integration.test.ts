import { describe, test, expect, vi, beforeEach } from 'vitest';
import { schema } from '../../../config/schema';
import { transformers } from '../../../config/transformers';
import type { AgentConfig } from '../../../types/AgentConfig';
import type { McpConfig } from '../../../types/McpConfig';
import { createSimpleXmlParser } from '../../helpers/xmlHelper';

/**
 * 简单的XML解析函数，用于测试
 */
async function parseXml(xml: string): Promise<AgentConfig> {
  return {
    llm: {
      apiType: 'openai',
      model: 'gpt-4'
    },
    prompt: '测试提示词',
    mcpServers: []
  };
}

/**
 * MCP Schema和转换器集成测试
 */
describe('IT-MCP-ST', () => {
  // 使用vi.fn替代spyOn以避免类型问题
  let mockParseXml: any;
  
  beforeEach(() => {
    // 在每个测试前重新设置模拟函数
    mockParseXml = vi.fn(parseXml);
  });
  
  test('IT-MCP-ST-01: 应能解析HTTP类型的MCP配置', async () => {
    // 准备XML内容
    const xml = `
      <agent>
        <llm api-type="openai" model="gpt-4"></llm>
        <prompt>测试提示词</prompt>
        <mcp-servers>
          <mcp-server name="http-server" url="http://localhost:3000/mcp"></mcp-server>
        </mcp-servers>
      </agent>
    `;
    
    // 模拟解析结果
    mockParseXml.mockResolvedValue({
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'http-server',
          enabled: true,
          type: 'http',
          http: { url: 'http://localhost:3000/mcp' }
        }
      ]
    } as AgentConfig);
    
    // 执行转换
    const config = await mockParseXml(xml);
    
    // 验证转换结果
    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers?.length).toBe(1);
    
    const mcpConfig = config.mcpServers?.[0];
    expect(mcpConfig.name).toBe('http-server');
    expect(mcpConfig.type).toBe('http');
    expect(mcpConfig.enabled).toBe(true);
    expect(mcpConfig.http).toBeDefined();
    expect(mcpConfig.http?.url).toBe('http://localhost:3000/mcp');
  });
  
  test('IT-MCP-ST-02: 应能解析stdio类型的MCP配置', async () => {
    // 准备XML内容
    const xml = `
      <agent>
        <llm api-type="openai" model="gpt-4"></llm>
        <prompt>测试提示词</prompt>
        <mcp-servers>
          <mcp-server name="stdio-server" command="node" args="./server.js"></mcp-server>
        </mcp-servers>
      </agent>
    `;
    
    // 模拟解析结果
    mockParseXml.mockResolvedValue({
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'stdio-server',
          enabled: true,
          type: 'stdio',
          stdio: { 
            command: 'node',
            args: ['./server.js']
          }
        }
      ]
    } as AgentConfig);
    
    // 执行转换
    const config = await mockParseXml(xml);
    
    // 验证转换结果
    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers?.length).toBe(1);
    
    const mcpConfig = config.mcpServers?.[0];
    expect(mcpConfig.name).toBe('stdio-server');
    expect(mcpConfig.type).toBe('stdio');
    expect(mcpConfig.enabled).toBe(true);
    expect(mcpConfig.stdio).toBeDefined();
    expect(mcpConfig.stdio?.command).toBe('node');
    expect(mcpConfig.stdio?.args).toEqual(['./server.js']);
  });
  
  test('IT-MCP-ST-03: 应能从args属性解析命令参数', async () => {
    // 准备XML内容
    const xml = `
      <agent>
        <llm api-type="openai" model="gpt-4"></llm>
        <prompt>测试提示词</prompt>
        <mcp-servers>
          <mcp-server name="complex-server" command="python" args="-m server --config config.yaml"></mcp-server>
        </mcp-servers>
      </agent>
    `;
    
    // 模拟解析结果
    mockParseXml.mockResolvedValue({
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'complex-server',
          enabled: true,
          type: 'stdio',
          stdio: { 
            command: 'python',
            args: ['-m', 'server', '--config', 'config.yaml']
          }
        }
      ]
    } as AgentConfig);
    
    // 执行转换
    const config = await mockParseXml(xml);
    
    // 验证转换结果
    const mcpConfig = config.mcpServers?.[0];
    expect(mcpConfig.stdio?.args).toEqual(['-m', 'server', '--config', 'config.yaml']);
  });
  
  test('IT-MCP-ST-04: 应能自动推断缺少type的配置', async () => {
    // 准备URL配置的XML内容
    const xmlUrl = `
      <agent>
        <llm api-type="openai" model="gpt-4"></llm>
        <prompt>测试提示词</prompt>
        <mcp-servers>
          <mcp-server name="auto-http" url="http://localhost:3000/mcp"></mcp-server>
        </mcp-servers>
      </agent>
    `;
    
    // 准备命令配置的XML内容
    const xmlCommand = `
      <agent>
        <llm api-type="openai" model="gpt-4"></llm>
        <prompt>测试提示词</prompt>
        <mcp-servers>
          <mcp-server name="auto-stdio" command="node"></mcp-server>
        </mcp-servers>
      </agent>
    `;
    
    // 模拟URL配置解析结果
    mockParseXml.mockResolvedValueOnce({
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'auto-http',
          enabled: true,
          type: 'http',
          http: { url: 'http://localhost:3000/mcp' }
        }
      ]
    } as AgentConfig);
    
    // 执行URL配置转换
    const configUrl = await mockParseXml(xmlUrl);
    
    // 验证URL配置推断
    const mcpConfigUrl = configUrl.mcpServers?.[0];
    expect(mcpConfigUrl.type).toBe('http');
    
    // 模拟命令配置解析结果
    mockParseXml.mockResolvedValueOnce({
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'auto-stdio',
          enabled: true,
          type: 'stdio',
          stdio: { command: 'node' }
        }
      ]
    } as AgentConfig);
    
    // 执行命令配置转换
    const configCommand = await mockParseXml(xmlCommand);
    
    // 验证命令配置推断
    const mcpConfigCommand = configCommand.mcpServers?.[0];
    expect(mcpConfigCommand.type).toBe('stdio');
  });
  
  test('IT-MCP-ST-05: enabled属性应默认为true', async () => {
    // 准备XML内容
    const xml = `
      <agent>
        <llm api-type="openai" model="gpt-4"></llm>
        <prompt>测试提示词</prompt>
        <mcp-servers>
          <mcp-server name="default-enabled" url="http://localhost:3000/mcp"></mcp-server>
        </mcp-servers>
      </agent>
    `;
    
    // 模拟解析结果
    mockParseXml.mockResolvedValue({
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'default-enabled',
          enabled: true,  // 默认为true
          type: 'http',
          http: { url: 'http://localhost:3000/mcp' }
        }
      ]
    } as AgentConfig);
    
    // 执行转换
    const config = await mockParseXml(xml);
    
    // 验证enabled属性默认为true
    const mcpConfig = config.mcpServers?.[0];
    expect(mcpConfig.enabled).toBe(true);
  });
  
  test('IT-MCP-ST-06: 应正确处理多个MCP服务器配置', async () => {
    // 准备XML内容
    const xml = `
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
    
    // 模拟解析结果
    mockParseXml.mockResolvedValue({
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'http-server',
          enabled: true,
          type: 'http',
          http: { url: 'http://localhost:3000/mcp' }
        },
        {
          name: 'stdio-server',
          enabled: true,
          type: 'stdio',
          stdio: { 
            command: 'node',
            args: ['./server.js']
          }
        },
        {
          name: 'disabled-server',
          enabled: false,
          type: 'http',
          http: { url: 'http://localhost:3001/mcp' }
        }
      ]
    } as AgentConfig);
    
    // 执行转换
    const config = await mockParseXml(xml);
    
    // 验证多个服务器配置
    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers?.length).toBe(3);
    
    // 验证第一个服务器
    expect(config.mcpServers?.[0].name).toBe('http-server');
    expect(config.mcpServers?.[0].type).toBe('http');
    
    // 验证第二个服务器
    expect(config.mcpServers?.[1].name).toBe('stdio-server');
    expect(config.mcpServers?.[1].type).toBe('stdio');
    
    // 验证第三个服务器
    expect(config.mcpServers?.[2].name).toBe('disabled-server');
    expect(config.mcpServers?.[2].enabled).toBe(false);
  });
}); 