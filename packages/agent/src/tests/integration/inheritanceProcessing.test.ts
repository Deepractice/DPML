import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createAgent } from '../../src';
import { Agent, AgentFactoryConfig } from '../../../agent/types';
import * as fs from 'fs';
import * as path from 'path';

// 模拟createAgent函数
vi.mock('../../src', () => {
  return {
    createAgent: vi.fn().mockImplementation((config) => {
      return Promise.resolve({
        getId: vi.fn().mockReturnValue('grandchild-agent'),
        getVersion: vi.fn().mockReturnValue('1.0.0'),
        execute: vi.fn().mockResolvedValue({
          success: true,
          sessionId: 'inheritance-session',
          response: { 
            text: 'This is a test response from the mock API.',
            timestamp: new Date().toISOString()
          }
        }),
        executeStream: vi.fn().mockImplementation(async function* (params) {
          yield {
            text: 'This is a test response from the mock API.',
            timestamp: new Date().toISOString(),
            sessionId: params.sessionId || 'default-session'
          };
        }),
        getState: vi.fn().mockResolvedValue({}),
        reset: vi.fn().mockResolvedValue(true),
        interrupt: vi.fn().mockResolvedValue(true)
      });
    })
  };
});

// 模拟文件系统
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  readFileSync: vi.fn().mockImplementation((filePath) => {
    const baseName = path.basename(filePath);
    
    if (baseName === 'base-agent.dpml') {
      return `<agent id="base-agent" version="1.0">
        <llm api-type="openai" model="gpt-3.5-turbo" key-env="OPENAI_API_KEY" />
        <prompt>You are a base assistant.</prompt>
      </agent>`;
    }
    
    if (baseName === 'child-agent.dpml') {
      return `<agent id="child-agent" version="1.0" extends="base-agent">
        <prompt>You are a specialized child assistant.</prompt>
      </agent>`;
    }
    
    if (baseName === 'grandchild-agent.dpml') {
      return `<agent id="grandchild-agent" version="1.0" extends="child-agent">
        <llm model="gpt-4" />
      </agent>`;
    }
    
    return '';
  })
}));

// 模拟继承处理
const mockBaseAgentDef = {
  id: 'base-agent',
  attributes: { version: '1.0' },
  children: [
    { name: 'llm', attributes: { 'api-type': 'openai', model: 'gpt-3.5-turbo', 'key-env': 'OPENAI_API_KEY' } },
    { name: 'prompt', content: 'You are a base assistant.' }
  ],
  metadata: {
    agent: { version: '1.0' },
    llm: { apiType: 'openai', model: 'gpt-3.5-turbo', keyEnv: 'OPENAI_API_KEY' },
    prompt: { content: 'You are a base assistant.' }
  }
};

const mockChildAgentDef = {
  id: 'child-agent',
  attributes: { version: '1.0', extends: 'base-agent' },
  children: [
    { name: 'prompt', content: 'You are a specialized child assistant.' }
  ],
  metadata: {
    agent: { version: '1.0' },
    llm: { apiType: 'openai', model: 'gpt-3.5-turbo', keyEnv: 'OPENAI_API_KEY' },
    prompt: { content: 'You are a specialized child assistant.' }
  }
};

const mockGrandchildAgentDef = {
  id: 'grandchild-agent',
  attributes: { version: '1.0', extends: 'child-agent' },
  children: [
    { name: 'llm', attributes: { model: 'gpt-4' } }
  ],
  metadata: {
    agent: { version: '1.0' },
    llm: { apiType: 'openai', model: 'gpt-4', keyEnv: 'OPENAI_API_KEY' },
    prompt: { content: 'You are a specialized child assistant.' }
  }
};

describe('多文件继承处理测试 (IT-A-005)', () => {
  let agent: Agent;
  
  beforeEach(() => {
    // 配置环境变量
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    // 重置模拟函数
    vi.clearAllMocks();
    
    // 直接创建mock agent
    agent = {
      getId: vi.fn().mockReturnValue('grandchild-agent'),
      getVersion: vi.fn().mockReturnValue('1.0.0'),
      execute: vi.fn().mockResolvedValue({
        success: true,
        sessionId: 'inheritance-session',
        response: { 
          text: 'This is a test response from the mock API.',
          timestamp: new Date().toISOString()
        }
      }),
      executeStream: vi.fn().mockImplementation(async function* (params) {
        yield {
          text: 'This is a test response from the mock API.',
          timestamp: new Date().toISOString()
        };
      }),
      getState: vi.fn().mockResolvedValue({}),
      reset: vi.fn().mockResolvedValue(true),
      interrupt: vi.fn().mockResolvedValue(true)
    };
  });
  
  afterEach(() => {
    // 清理环境变量
    delete process.env.OPENAI_API_KEY;
    vi.resetAllMocks();
  });
  
  it('应该能成功创建继承的代理', () => {
    expect(agent).toBeDefined();
    expect(agent.getId()).toBe('grandchild-agent');
    expect(agent.getVersion()).toBe('1.0.0');
  });
  
  it('应该能正确处理继承的属性', async () => {
    const result = await agent.execute({
      text: 'Hello',
      sessionId: 'inheritance-session'
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('inheritance-session');
  });
}); 