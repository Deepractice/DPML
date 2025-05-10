import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { AgentRunner } from '../../../core/AgentRunner';
import type { AgentConfig } from '../../../types/AgentConfig';
import type { McpConfig } from '../../../types/McpConfig';
import * as mcpService from '../../../core/mcpService';
import type { LLMClient } from '../../../core/llm/LLMClient';
import type { AgentSession } from '../../../core/session/AgentSession';

/**
 * AgentRunner与MCP集成测试
 */
describe('IT-MCP-AR', () => {
  // 创建测试用的模拟对象
  let mockLLMClient: LLMClient;
  let mockSession: AgentSession;
  let mockRegisterEnhancer: any;
  let mockEnhanceLLMClient: any;
  
  beforeEach(() => {
    // 模拟LLM客户端
    mockLLMClient = {
      sendMessages: vi.fn().mockResolvedValue({ content: '测试响应' })
    } as unknown as LLMClient;
    
    // 模拟会话
    mockSession = {
      addMessage: vi.fn(),
      getMessages: vi.fn().mockReturnValue([])
    } as unknown as AgentSession;
    
    // 模拟MCP服务方法
    mockRegisterEnhancer = vi.spyOn(mcpService, 'registerEnhancer').mockImplementation(vi.fn());
    mockEnhanceLLMClient = vi.spyOn(mcpService, 'enhanceLLMClient').mockImplementation((client) => {
      // 简单地返回增强后的客户端（在测试中仍然是原始客户端）
      return client;
    });
  });
  
  afterEach(() => {
    // 清理所有模拟
    vi.restoreAllMocks();
  });
  
  test('IT-MCP-AR-01: AgentRunner应注册启用的MCP服务器', () => {
    // 准备配置
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'test-server-1',
          enabled: true,
          type: 'http',
          http: { url: 'http://localhost:3000/mcp' }
        },
        {
          name: 'test-server-2',
          enabled: true,
          type: 'stdio',
          stdio: { command: 'node' }
        }
      ]
    };
    
    // 创建AgentRunner实例
    new AgentRunner(config, mockLLMClient, mockSession);
    
    // 验证registerEnhancer是否被调用
    expect(mockRegisterEnhancer).toHaveBeenCalledTimes(2);
    expect(mockRegisterEnhancer).toHaveBeenCalledWith(config.mcpServers?.[0]);
    expect(mockRegisterEnhancer).toHaveBeenCalledWith(config.mcpServers?.[1]);
    
    // 验证enhanceLLMClient是否被调用
    expect(mockEnhanceLLMClient).toHaveBeenCalledTimes(2);
    expect(mockEnhanceLLMClient.mock.calls[0][1]).toBe('test-server-1');
    expect(mockEnhanceLLMClient.mock.calls[1][1]).toBe('test-server-2');
  });
  
  test('IT-MCP-AR-02: AgentRunner应跳过禁用的MCP服务器', () => {
    // 准备配置，其中一个服务器已禁用
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'enabled-server',
          enabled: true,
          type: 'http',
          http: { url: 'http://localhost:3000/mcp' }
        },
        {
          name: 'disabled-server',
          enabled: false,
          type: 'http',
          http: { url: 'http://localhost:3001/mcp' }
        }
      ]
    };
    
    // 创建AgentRunner实例
    new AgentRunner(config, mockLLMClient, mockSession);
    
    // 验证只为启用的服务器调用registerEnhancer
    expect(mockRegisterEnhancer).toHaveBeenCalledTimes(1);
    expect(mockRegisterEnhancer).toHaveBeenCalledWith(config.mcpServers?.[0]);
    expect(mockRegisterEnhancer).not.toHaveBeenCalledWith(config.mcpServers?.[1]);
    
    // 验证只为启用的服务器调用enhanceLLMClient
    expect(mockEnhanceLLMClient).toHaveBeenCalledTimes(1);
    expect(mockEnhanceLLMClient.mock.calls[0][1]).toBe('enabled-server');
  });
  
  test('IT-MCP-AR-03: 没有MCP配置应不影响基本功能', () => {
    // 准备没有MCP配置的配置
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '测试提示词'
      // 没有mcpServers字段
    };
    
    // 创建AgentRunner实例
    new AgentRunner(config, mockLLMClient, mockSession);
    
    // 验证不调用MCP相关方法
    expect(mockRegisterEnhancer).not.toHaveBeenCalled();
    expect(mockEnhanceLLMClient).not.toHaveBeenCalled();
  });
  
  test('IT-MCP-AR-04: 空的MCP配置数组应不影响基本功能', () => {
    // 准备空MCP配置数组的配置
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '测试提示词',
      mcpServers: [] // 空数组
    };
    
    // 创建AgentRunner实例
    new AgentRunner(config, mockLLMClient, mockSession);
    
    // 验证不调用MCP相关方法
    expect(mockRegisterEnhancer).not.toHaveBeenCalled();
    expect(mockEnhanceLLMClient).not.toHaveBeenCalled();
  });
  
  test('IT-MCP-AR-05: 应优雅处理MCP增强错误', () => {
    // 模拟registerEnhancer抛出错误
    mockRegisterEnhancer.mockImplementation((config: McpConfig) => {
      if (config.name === 'error-server') {
        throw new Error('测试错误');
      }
    });
    
    // 准备配置，包含一个会导致错误的服务器
    const config: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4'
      },
      prompt: '测试提示词',
      mcpServers: [
        {
          name: 'normal-server',
          enabled: true,
          type: 'http',
          http: { url: 'http://localhost:3000/mcp' }
        },
        {
          name: 'error-server',
          enabled: true,
          type: 'http',
          http: { url: 'http://localhost:3001/mcp' }
        }
      ]
    };
    
    // 捕获控制台错误
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // 创建AgentRunner实例，这不应该抛出错误
    const runner = new AgentRunner(config, mockLLMClient, mockSession);
    
    // 验证错误被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 验证第一个服务器仍然被注册
    expect(mockRegisterEnhancer).toHaveBeenCalledWith(config.mcpServers?.[0]);
    
    // 验证enhanceLLMClient只为成功的服务器调用
    expect(mockEnhanceLLMClient).toHaveBeenCalledTimes(1);
    expect(mockEnhanceLLMClient.mock.calls[0][1]).toBe('normal-server');
    
    // 清理
    consoleErrorSpy.mockRestore();
  });
}); 