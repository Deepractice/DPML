import { describe, it, expect } from 'vitest';
import { Memory, MemoryItem, AgentMemory, AgentMemoryOptions } from '../../../memory';

describe('Memory Types', () => {
  describe('Memory Interface', () => {
    it('should define a memory structure with required properties', () => {
      // 创建一个符合Memory接口的对象
      const memory: Memory = {
        id: 'test-session',
        content: []
      };

      // 验证属性
      expect(memory.id).toBe('test-session');
      expect(Array.isArray(memory.content)).toBe(true);
      expect(memory.metadata).toBeUndefined();

      // 添加元数据
      const memoryWithMetadata: Memory = {
        id: 'test-session',
        content: [],
        metadata: {
          created: Date.now(),
          custom: 'value'
        }
      };

      expect(memoryWithMetadata.metadata).toBeDefined();
      expect(memoryWithMetadata.metadata?.custom).toBe('value');
    });
  });

  describe('MemoryItem Interface', () => {
    it('should define a memory item with required properties', () => {
      // 创建一个符合MemoryItem接口的对象
      const userItem: MemoryItem = {
        text: 'Hello, agent!',
        role: 'user',
        timestamp: Date.now()
      };

      // 验证属性
      expect(userItem.text).toBe('Hello, agent!');
      expect(userItem.role).toBe('user');
      expect(userItem.timestamp).toBeGreaterThan(0);

      // 创建一个助手记忆项
      const assistantItem: MemoryItem = {
        text: 'How can I help you?',
        role: 'assistant',
        timestamp: Date.now()
      };

      expect(assistantItem.role).toBe('assistant');

      // 创建一个系统记忆项
      const systemItem: MemoryItem = {
        text: 'You are a helpful agent.',
        role: 'system',
        timestamp: Date.now()
      };

      expect(systemItem.role).toBe('system');
    });
  });

  describe('AgentMemoryOptions Interface', () => {
    it('should define memory options with required and optional properties', () => {
      // 最小配置
      const minOptions: AgentMemoryOptions = {
        agentId: 'test-agent'
      };

      expect(minOptions.agentId).toBe('test-agent');
      expect(minOptions.type).toBeUndefined();
      expect(minOptions.basePath).toBeUndefined();
      expect(minOptions.maxItems).toBeUndefined();

      // 完整配置
      const fullOptions: AgentMemoryOptions = {
        agentId: 'test-agent',
        type: 'file',
        basePath: '/tmp/agent-memory',
        maxItems: 50
      };

      expect(fullOptions.type).toBe('file');
      expect(fullOptions.basePath).toBe('/tmp/agent-memory');
      expect(fullOptions.maxItems).toBe(50);
    });
  });
}); 