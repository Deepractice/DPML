/**
 * AgentFactory单元测试
 */
import { describe, it, expect, vi } from 'vitest';
import { AgentFactory } from '../../../src/agent/AgentFactory';

describe('AgentFactory', () => {
  it('应创建Agent实例并返回正确属性', () => {
    // 准备测试配置
    const config = {
      id: 'test-agent',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: '你是一个助手'
      }
    };
    
    // 调用工厂方法
    const agent = AgentFactory.createAgent(config);
    
    // 验证返回的Agent实例
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('test-agent');
    expect(agent.getVersion()).toBe('1.0');
    expect(agent.execute).toBeInstanceOf(Function);
    expect(agent.executeStream).toBeInstanceOf(Function);
    expect(agent.interrupt).toBeInstanceOf(Function);
    expect(agent.reset).toBeInstanceOf(Function);
  });
  
  it('应正确传递配置到agent实例', () => {
    // 准备文件存储配置
    const config = {
      id: 'custom-agent',
      version: '2.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: '你是一个助手'
      },
      stateManagerType: 'file' as const,
      basePath: '/tmp/agent-data'
    };
    
    // 调用工厂方法
    const agent = AgentFactory.createAgent(config);
    
    // 验证配置传递
    expect(agent.getId()).toBe('custom-agent');
    expect(agent.getVersion()).toBe('2.0');
  });
}); 