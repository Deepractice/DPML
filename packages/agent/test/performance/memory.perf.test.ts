import { describe, expect, test, beforeEach } from 'vitest';
import { InMemoryAgentMemory } from '../../src/memory/InMemoryAgentMemory';
import { Memory, MemoryItem } from '../../src/memory/types';

describe('记忆系统性能测试', () => {
  let memory: InMemoryAgentMemory;
  
  beforeEach(() => {
    memory = new InMemoryAgentMemory({
      agentId: 'test-agent',
      maxItems: 1000,
      maxSessions: 100,
      compressionThreshold: 800,
      compressionRatio: 0.6
    });
  });
  
  test('记忆检索缓存提高性能', async () => {
    // 创建测试会话
    const sessionId = 'perf-test-session';
    
    // 存储一个大内存
    await memory.store({
      id: sessionId,
      content: Array(100).fill(null).map((_, i) => ({
        text: `消息 ${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        timestamp: Date.now() - (100 - i) * 1000
      })),
      metadata: {
        created: Date.now(),
        agentId: 'test-agent'
      }
    });
    
    // 第一次检索（应该访问实际存储）
    const startTime1 = Date.now();
    const result1 = await memory.retrieve(sessionId);
    const time1 = Date.now() - startTime1;
    
    // 验证结果
    expect(result1.id).toBe(sessionId);
    expect(Array.isArray(result1.content)).toBe(true);
    expect(result1.content.length).toBe(100);
    
    // 第二次检索（应该使用缓存）
    const startTime2 = Date.now();
    const result2 = await memory.retrieve(sessionId);
    const time2 = Date.now() - startTime2;
    
    // 验证结果
    expect(result2.id).toBe(sessionId);
    
    // 由于使用缓存，第二次检索应该明显快于第一次
    expect(time2).toBeLessThan(time1 * 0.5);
  });
  
  test('大规模记忆压缩性能', async () => {
    // 创建测试会话
    const sessionId = 'compression-test';
    
    // 创建一个大会话，超过压缩阈值
    const largeContent: MemoryItem[] = Array(1000).fill(null).map((_, i) => ({
      text: `这是一个长消息，用于测试记忆压缩算法的性能。消息索引: ${i}`,
      role: i % 3 === 0 ? 'system' : (i % 2 === 0 ? 'user' : 'assistant'),
      timestamp: Date.now() - (1000 - i) * 1000
    }));
    
    // 测量存储性能
    const startTime = Date.now();
    await memory.store({
      id: sessionId,
      content: largeContent,
      metadata: {
        created: Date.now(),
        agentId: 'test-agent'
      }
    });
    const storeTime = Date.now() - startTime;
    
    // 检索压缩后的记忆
    const result = await memory.retrieve(sessionId);
    
    // 验证结果
    expect(result.id).toBe(sessionId);
    expect(Array.isArray(result.content)).toBe(true);
    
    // 检查是否压缩了记忆
    // 压缩后的大小应该是压缩阈值(800) * 压缩比例(0.6) = 480 左右
    // 但系统消息应该全部保留
    const systemMessages = largeContent.filter(item => item.role === 'system').length;
    const expectedSize = Math.floor(800 * 0.6);
    
    // 验证压缩结果
    expect(result.content.length).toBeLessThanOrEqual(expectedSize + systemMessages);
    expect(result.metadata?.compressed).toBe(true);
    expect(result.metadata?.originalLength).toBe(1000);
    
    // 存储性能应该在可接受范围内
    expect(storeTime).toBeLessThan(1000); // 1秒内完成
  });
  
  test('多会话管理和过期会话清理', async () => {
    // 创建超过最大会话数量的会话
    const sessionCount = 120; // 超过设置的maxSessions(100)
    
    // 创建所有会话
    for (let i = 0; i < sessionCount; i++) {
      await memory.store({
        id: `session-${i}`,
        content: [{
          text: `会话 ${i} 的测试消息`,
          role: 'user',
          timestamp: Date.now() - (sessionCount - i) * 1000
        }],
        metadata: {
          created: Date.now() - (sessionCount - i) * 1000,
          agentId: 'test-agent'
        }
      });
    }
    
    // 获取所有会话ID
    const sessions = await memory.getAllSessionIds();
    
    // 验证结果
    expect(sessions.length).toBeLessThanOrEqual(100); // 不应超过maxSessions
    
    // 最新的会话应该被保留
    for (let i = sessionCount - 1; i >= sessionCount - 100; i--) {
      expect(sessions).toContain(`session-${i}`);
    }
    
    // 最旧的会话应该被清除
    for (let i = 0; i < sessionCount - 100; i++) {
      // 尝试检索被清除的会话
      const result = await memory.retrieve(`session-${i}`);
      
      // 应该返回空记忆而不是实际存储的数据
      expect(result.content).toEqual([]);
    }
  });
  
  test('大量会话并发访问性能', async () => {
    // 创建多个会话
    const sessionCount = 50;
    
    // 预创建会话
    for (let i = 0; i < sessionCount; i++) {
      await memory.store({
        id: `concurrent-${i}`,
        content: [{
          text: `会话 ${i} 的初始消息`,
          role: 'system',
          timestamp: Date.now()
        }],
        metadata: {
          created: Date.now(),
          agentId: 'test-agent'
        }
      });
    }
    
    // 并发访问所有会话
    const startTime = Date.now();
    await Promise.all(
      Array(sessionCount).fill(null).map((_, i) => memory.retrieve(`concurrent-${i}`))
    );
    const retrieveTime = Date.now() - startTime;
    
    // 并发存储到所有会话
    const storeStartTime = Date.now();
    await Promise.all(
      Array(sessionCount).fill(null).map((_, i) => memory.store({
        id: `concurrent-${i}`,
        content: [{
          text: `会话 ${i} 的新消息`,
          role: 'user',
          timestamp: Date.now()
        }],
        metadata: {
          created: Date.now(),
          agentId: 'test-agent',
          updated: Date.now()
        }
      }))
    );
    const storeTime = Date.now() - storeStartTime;
    
    // 验证性能
    // 检索时间应该相对较快，因为有缓存
    expect(retrieveTime).toBeLessThan(1000); // 1秒内
    
    // 存储时间可能稍长，但也应该在可接受范围内
    expect(storeTime).toBeLessThan(1500); // 1.5秒内
  });
}); 