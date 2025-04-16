import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAgentMemory, Memory, MemoryItem } from '../../../memory';

describe('InMemoryAgentMemory', () => {
  // 测试会话ID
  const testSessionId = 'test-session-1';
  // 测试代理ID
  const testAgentId = 'test-agent-1';
  
  // 测试对象
  let memoryManager: InMemoryAgentMemory;
  
  // 测试前准备
  beforeEach(() => {
    // 创建内存记忆管理器
    memoryManager = new InMemoryAgentMemory({
      agentId: testAgentId
    });
  });
  
  describe('basic functionality', () => {
    it('should create memory manager with default options', () => {
      expect(memoryManager).toBeInstanceOf(InMemoryAgentMemory);
    });
    
    it('should create memory manager with custom options', () => {
      const manager = new InMemoryAgentMemory({
        agentId: testAgentId,
        maxItems: 100
      });
      expect(manager).toBeInstanceOf(InMemoryAgentMemory);
    });
  });
  
  describe('memory operations', () => {
    it('should return empty memory when retrieving non-existent session (UT-MEM-001)', async () => {
      const memory = await memoryManager.retrieve(testSessionId);
      
      expect(memory).toBeDefined();
      expect(memory.id).toBe(testSessionId);
      expect(Array.isArray(memory.content)).toBe(true);
      expect(memory.content).toHaveLength(0);
      expect(memory.metadata).toBeDefined();
      expect(memory.metadata?.agentId).toBe(testAgentId);
    });
    
    it('should store and retrieve memory correctly (UT-MEM-001)', async () => {
      // 创建测试记忆
      const testMemory: Memory = {
        id: testSessionId,
        content: [
          {
            text: 'Hello, agent!',
            role: 'user',
            timestamp: Date.now()
          } as MemoryItem
        ],
        metadata: {
          custom: 'value'
        }
      };
      
      // 存储记忆
      await memoryManager.store(testMemory);
      
      // 检索记忆
      const retrievedMemory = await memoryManager.retrieve(testSessionId);
      
      // 验证内容
      expect(retrievedMemory.id).toBe(testSessionId);
      expect(retrievedMemory.content).toHaveLength(1);
      expect((retrievedMemory.content as MemoryItem[])[0].text).toBe('Hello, agent!');
      expect(retrievedMemory.metadata?.custom).toBe('value');
      expect(retrievedMemory.metadata?.updatedAt).toBeDefined();
    });
    
    it('should properly manage memory for multiple sessions (UT-MEM-002)', async () => {
      // 创建两个测试会话的记忆
      const session1Memory: Memory = {
        id: 'session-1',
        content: [{ text: 'Message from session 1', role: 'user', timestamp: Date.now() }] as MemoryItem[]
      };
      
      const session2Memory: Memory = {
        id: 'session-2',
        content: [{ text: 'Message from session 2', role: 'user', timestamp: Date.now() }] as MemoryItem[]
      };
      
      // 存储两个会话的记忆
      await memoryManager.store(session1Memory);
      await memoryManager.store(session2Memory);
      
      // 检索并验证各自的记忆
      const memory1 = await memoryManager.retrieve('session-1');
      const memory2 = await memoryManager.retrieve('session-2');
      
      expect((memory1.content as MemoryItem[])[0].text).toBe('Message from session 1');
      expect((memory2.content as MemoryItem[])[0].text).toBe('Message from session 2');
    });
    
    it('should clear memory correctly (UT-MEM-004)', async () => {
      // 创建和存储测试记忆
      const testMemory: Memory = {
        id: testSessionId,
        content: [{ text: 'Test message', role: 'user', timestamp: Date.now() }] as MemoryItem[]
      };
      
      await memoryManager.store(testMemory);
      
      // 确认记忆已存储
      let retrievedMemory = await memoryManager.retrieve(testSessionId);
      expect(retrievedMemory.content).toHaveLength(1);
      
      // 清除记忆
      await memoryManager.clear(testSessionId);
      
      // 确认记忆已清除
      retrievedMemory = await memoryManager.retrieve(testSessionId);
      expect(retrievedMemory.content).toHaveLength(0);
    });
    
    it('should return all session IDs (UT-MEM-003)', async () => {
      // 存储多个会话的记忆
      await memoryManager.store({ id: 'session-1', content: [] });
      await memoryManager.store({ id: 'session-2', content: [] });
      await memoryManager.store({ id: 'session-3', content: [] });
      
      // 获取所有会话ID
      const sessionIds = await memoryManager.getAllSessionIds();
      
      expect(sessionIds).toHaveLength(3);
      expect(sessionIds).toContain('session-1');
      expect(sessionIds).toContain('session-2');
      expect(sessionIds).toContain('session-3');
    });
  });
  
  describe('memory compression', () => {
    it('should compress memory when exceeding max items (UT-MEM-008, UT-MEM-010)', async () => {
      // 创建有最大条目限制的记忆管理器
      const compressManager = new InMemoryAgentMemory({
        agentId: testAgentId,
        maxItems: 5
      });
      
      // 强制使用truncateMemory而不是compressMemory
      (compressManager as any).shouldCompress = () => false;
      
      // 创建超过限制的记忆
      const testMemory: Memory = {
        id: testSessionId,
        content: [
          { text: 'System prompt', role: 'system', timestamp: 1 },
          { text: 'Message 1', role: 'user', timestamp: 2 },
          { text: 'Response 1', role: 'assistant', timestamp: 3 },
          { text: 'Message 2', role: 'user', timestamp: 4 },
          { text: 'Response 2', role: 'assistant', timestamp: 5 },
          { text: 'Message 3', role: 'user', timestamp: 6 },
          { text: 'Response 3', role: 'assistant', timestamp: 7 }
        ] as MemoryItem[]
      };
      
      // 存储记忆
      await compressManager.store(testMemory);
      
      // 检索记忆
      const retrievedMemory = await compressManager.retrieve(testSessionId);
      
      // 验证记忆被截断了
      expect(retrievedMemory.content).toHaveLength(5); // 最大条目数
      expect(retrievedMemory.metadata?.truncated).toBe(true);
      expect(retrievedMemory.metadata?.originalLength).toBe(7);
      
      // 验证system消息被保留
      expect((retrievedMemory.content as MemoryItem[])[0].role).toBe('system');
      
      // 验证最近的消息被保留
      expect((retrievedMemory.content as MemoryItem[])[4].text).toBe('Response 3');
    });
    
    it('should prioritize important memory items (UT-MEM-009)', async () => {
      // 创建有最大条目限制的记忆管理器
      const compressManager = new InMemoryAgentMemory({
        agentId: testAgentId,
        maxItems: 3
      });
      
      // 创建包含多个system消息的记忆
      const testMemory: Memory = {
        id: testSessionId,
        content: [
          { text: 'System prompt 1', role: 'system', timestamp: 1 },
          { text: 'System prompt 2', role: 'system', timestamp: 2 },
          { text: 'Message 1', role: 'user', timestamp: 3 },
          { text: 'Response 1', role: 'assistant', timestamp: 4 },
          { text: 'Message 2', role: 'user', timestamp: 5 }
        ] as MemoryItem[]
      };
      
      // 存储记忆
      await compressManager.store(testMemory);
      
      // 检索记忆
      const retrievedMemory = await compressManager.retrieve(testSessionId);
      
      // 验证记忆被压缩了
      expect(retrievedMemory.content).toHaveLength(3); // 最大条目数
      
      // 验证所有system消息都被保留
      const systemCount = (retrievedMemory.content as MemoryItem[])
        .filter(item => item.role === 'system')
        .length;
      expect(systemCount).toBe(2);
      
      // 验证最近的非system消息被保留
      expect((retrievedMemory.content as MemoryItem[])[2].text).toBe('Message 2');
    });
  });
}); 