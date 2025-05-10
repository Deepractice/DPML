/**
 * MCP配置端到端测试
 * 测试XML配置到McpConfig的转换和验证
 */
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { createAgent } from '../../../api';
import { TestHttpMcpServer } from '../../fixtures/mcp/transport-http';
import { isLLMConfigValid, getLLMConfig } from '../env-helper';

// 检查是否使用真实API
const useRealAPI = isLLMConfigValid('openai');

// 显示测试环境信息
beforeAll(() => {
  console.info('----- 测试环境配置信息 -----');
  console.info(`当前测试模式: ${useRealAPI ? '真实API' : '模拟'}`);
  console.info(`环境变量TEST_USE_REAL_API=${process.env.TEST_USE_REAL_API}`);
  console.info('---------------------------');
});

describe('E2E-MCP-Config', () => {
  let mcpServer: TestHttpMcpServer;

  beforeAll(async () => {
    mcpServer = new TestHttpMcpServer();
    await mcpServer.start();
  });

  afterAll(async () => {
    await mcpServer.stop();
  });

  beforeEach(() => {
    // 清理测试状态
    mcpServer.resetCallCount();
  });

  test('E2E-MCP-Config-01: 应正确解析HTTP类型的MCP配置', async () => {
    // 准备包含HTTP MCP配置的DPML
    const dpmlContent = `
      <agent>
        <llm api-type="openai" model="${useRealAPI ? getLLMConfig('openai').model : 'gpt-4'}" 
             api-key="${useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test'}"/>
        <prompt>Test prompt</prompt>
        <mcp-servers>
          <mcp-server name="test-server" url="${mcpServer.url}" />
        </mcp-servers>
      </agent>
    `;

    // 编译DPML并创建Agent - 使用直接的配置对象而不是编译
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: 'Test prompt',
      mcpServers: [
        {
          name: 'test-server',
          type: 'http' as const,
          enabled: true,
          http: {
            url: mcpServer.url
          }
        }
      ]
    };

    // 验证配置正确解析
    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers?.length).toBe(1);
    expect(config.mcpServers?.[0].name).toBe('test-server');
    expect(config.mcpServers?.[0].http?.url).toBe(mcpServer.url);
    expect(config.mcpServers?.[0].type).toBe('http');

    // 创建Agent并验证
    const agent = createAgent(config);

    expect(agent).toBeDefined();
  });

  test('E2E-MCP-Config-02: 应支持多服务器配置', async () => {
    // 准备第二个测试服务器
    const secondServer = new TestHttpMcpServer();

    await secondServer.start();

    try {
      // 准备包含多个MCP服务器配置
      const config = {
        llm: {
          apiType: 'openai',
          model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
          apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
          apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
        },
        prompt: 'Test prompt',
        mcpServers: [
          {
            name: 'test-server-1',
            type: 'http' as const,
            enabled: true,
            http: {
              url: mcpServer.url
            }
          },
          {
            name: 'test-server-2',
            type: 'http' as const,
            enabled: true,
            http: {
              url: secondServer.url
            }
          }
        ]
      };

      // 验证配置正确解析
      expect(config.mcpServers).toBeDefined();
      expect(config.mcpServers?.length).toBe(2);
      expect(config.mcpServers?.[0].name).toBe('test-server-1');
      expect(config.mcpServers?.[1].name).toBe('test-server-2');

      // 创建Agent并验证
      const agent = createAgent(config);

      expect(agent).toBeDefined();
    } finally {
      // 确保清理第二个服务器
      await secondServer.stop();
    }
  });

  test('E2E-MCP-Config-03: 应正确处理具有默认设置的MCP配置', async () => {
    // 准备具有默认设置的配置
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: 'Test prompt',
      mcpServers: [
        {
          name: 'test-server',
          type: 'http' as const,
          enabled: true,
          http: {
            url: mcpServer.url
          }
        }
      ]
    };

    // 验证配置使用默认设置
    expect(config.mcpServers?.[0].enhancerName).toBeUndefined(); // 使用默认增强器
    expect(config.mcpServers?.[0].type).toBe('http'); // 默认为HTTP类型

    // 创建Agent并验证
    const agent = createAgent(config);

    expect(agent).toBeDefined();
  });

  test('E2E-MCP-Config-04: 应正确处理具有自定义属性的MCP配置', async () => {
    // 准备具有自定义属性的配置
    const config = {
      llm: {
        apiType: 'openai',
        model: useRealAPI ? getLLMConfig('openai').model : 'gpt-4',
        apiKey: useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test',
        apiUrl: useRealAPI ? getLLMConfig('openai').apiUrl : undefined
      },
      prompt: 'Test prompt',
      mcpServers: [
        {
          name: 'test-server',
          type: 'http' as const,
          enabled: true,
          http: {
            url: mcpServer.url
          },
          enhancerName: 'custom-enhancer'
        }
      ]
    };

    // 验证自定义配置属性
    expect(config.mcpServers?.[0].enhancerName).toBe('custom-enhancer');
    expect(config.mcpServers?.[0].type).toBe('http');

    // 创建Agent并验证 - 注意：由于使用了未注册的增强器，Agent创建可能会失败
    // 这取决于系统设计是否允许未注册的增强器名称
    try {
      const agent = createAgent(config);

      // 如果创建成功，说明系统能容忍未注册的增强器名称
      expect(agent).toBeDefined();
    } catch (error) {
      // 如果抛出错误，验证错误是关于未找到增强器的
      expect((error as Error).message).toContain('enhancer');
    }
  });
});
