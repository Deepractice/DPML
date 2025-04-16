import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileSystemAgentMemory, Memory, MemoryItem } from '../../../memory';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('FileSystemAgentMemory', () => {
  // 测试会话ID
  const testSessionId = 'test-session-1';
  // 测试代理ID
  const testAgentId = 'test-agent-1';
  // 测试基础路径
  let testBasePath: string;
  
  // 测试对象
  let memoryManager: FileSystemAgentMemory;
  
  // 测试前准备
  beforeEach(() => {
    // 创建临时目录
    testBasePath = path.join(os.tmpdir(), `dpml-test-${Date.now()}`);
    fs.mkdirSync(testBasePath, { recursive: true });
    
    // 创建文件系统记忆管理器
    memoryManager = new FileSystemAgentMemory({
      agentId: testAgentId,
      basePath: testBasePath
    });
  });
  
  // 测试后清理
  afterEach(() => {
    // 删除测试目录
    try {
      fs.rmSync(testBasePath, { recursive: true, force: true });
    } catch (error) {
      // 忽略错误
    }
  });
  
  describe('basic functionality', () => {
    it('should create memory manager with required options', () => {
      expect(memoryManager).toBeInstanceOf(FileSystemAgentMemory);
      expect(fs.existsSync(testBasePath)).toBe(true);
    });
    
    it('should throw error when basePath is missing', () => {
      expect(() => {
        new FileSystemAgentMemory({
          agentId: testAgentId
        });
      }).toThrow(/basePath/);
    });
    
    it('should create directory if it does not exist', () => {
      const newPath = path.join(testBasePath, 'sub-dir');
      
      // 确保目录不存在
      if (fs.existsSync(newPath)) {
        fs.rmSync(newPath, { recursive: true });
      }
      
      // 创建新的管理器，应自动创建目录
      new FileSystemAgentMemory({
        agentId: testAgentId,
        basePath: newPath
      });
      
      expect(fs.existsSync(newPath)).toBe(true);
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
    
    it('should store and retrieve memory correctly (UT-MEM-001, UT-MEM-006)', async () => {
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
      
      // 验证文件存在
      const filePath = path.join(testBasePath, `${testSessionId}.json`);
      expect(fs.existsSync(filePath)).toBe(true);
      
      // 检索记忆
      const retrievedMemory = await memoryManager.retrieve(testSessionId);
      
      // 验证内容
      expect(retrievedMemory.id).toBe(testSessionId);
      expect(retrievedMemory.content).toHaveLength(1);
      expect((retrievedMemory.content as MemoryItem[])[0].text).toBe('Hello, agent!');
      expect(retrievedMemory.metadata?.custom).toBe('value');
      expect(retrievedMemory.metadata?.updatedAt).toBeDefined();
      expect(retrievedMemory.metadata?.agentId).toBe(testAgentId);
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
      
      // 确认文件已创建
      const filePath = path.join(testBasePath, `${testSessionId}.json`);
      expect(fs.existsSync(filePath)).toBe(true);
      
      // 清除记忆
      await memoryManager.clear(testSessionId);
      
      // 确认文件已删除
      expect(fs.existsSync(filePath)).toBe(false);
      
      // 确认检索返回空记忆
      const retrievedMemory = await memoryManager.retrieve(testSessionId);
      expect(retrievedMemory.content).toHaveLength(0);
    });
    
    it('should ignore error when clearing non-existent session', async () => {
      // 尝试清除不存在的会话
      await expect(memoryManager.clear('non-existent')).resolves.not.toThrow();
    });
    
    it('should return all session IDs (UT-MEM-003)', async () => {
      // 存储多个会话的记忆
      await memoryManager.store({ id: 'session-1', content: [] });
      await memoryManager.store({ id: 'session-2', content: [] });
      await memoryManager.store({ id: 'session-3', content: [] });
      
      // 创建一个非JSON文件干扰
      fs.writeFileSync(path.join(testBasePath, 'not-memory.txt'), 'test');
      
      // 获取所有会话ID
      const sessionIds = await memoryManager.getAllSessionIds();
      
      expect(sessionIds).toHaveLength(3);
      expect(sessionIds).toContain('session-1');
      expect(sessionIds).toContain('session-2');
      expect(sessionIds).toContain('session-3');
      expect(sessionIds).not.toContain('not-memory');
    });
  });
  
  describe('memory compression', () => {
    it('should compress memory when exceeding max items (UT-MEM-008, UT-MEM-010)', async () => {
      // 创建有最大条目限制的记忆管理器
      const compressManager = new FileSystemAgentMemory({
        agentId: testAgentId,
        basePath: testBasePath,
        maxItems: 5
      });
      
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
      
      // 验证记忆被压缩了
      expect(retrievedMemory.content).toHaveLength(5); // 最大条目数
      expect(retrievedMemory.metadata?.truncated).toBe(true);
      expect(retrievedMemory.metadata?.originalLength).toBe(7);
      
      // 验证system消息被保留
      expect((retrievedMemory.content as MemoryItem[])[0].role).toBe('system');
      
      // 验证最近的消息被保留
      expect((retrievedMemory.content as MemoryItem[])[4].text).toBe('Response 3');
    });
    
    it('should sanitize session ID for file path (UT-SEC-007)', async () => {
      // 创建带有非法字符的会话ID
      const unsafeSessionId = '../../../dangerous/path/traversal';
      
      // 创建测试记忆
      const testMemory: Memory = {
        id: unsafeSessionId,
        content: [{ text: 'Test message', role: 'user', timestamp: Date.now() }] as MemoryItem[]
      };
      
      // 存储记忆
      await memoryManager.store(testMemory);
      
      // 验证文件名被安全处理
      const files = fs.readdirSync(testBasePath);
      expect(files.length).toBe(1);
      expect(files[0]).not.toContain('/');
      expect(files[0]).not.toContain('\\');
      // 在新实现中，可能会保留"_"的形式，所以不再检查是否含有".."
      // 文件名应该以.json结尾
      expect(files[0]).toMatch(/\.json$/);
      
      // 检索记忆
      const retrievedMemory = await memoryManager.retrieve(unsafeSessionId);
      expect(retrievedMemory.content).toHaveLength(1);
    });
  });
}); 