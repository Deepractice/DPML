import { v4 as uuidv4 } from 'uuid';
import { Memory, MemoryItem, AgentMemory, AgentMemoryOptions } from './types';

/**
 * 基于内存的代理记忆存储实现
 * 优化版本：使用索引和缓存提高性能
 */
export class InMemoryAgentMemory implements AgentMemory {
  /**
   * 代理ID
   */
  private readonly agentId: string;

  /**
   * 内存存储
   */
  private memories: Map<string, Memory> = new Map();
  
  /**
   * 会话索引 - 按时间排序的会话ID
   * 用于快速检索最近会话
   */
  private sessionIndex: Array<{id: string, lastUpdated: number}> = [];
  
  /**
   * 记忆检索缓存 - 存储最近的检索结果
   * 用于减少频繁检索同一会话的开销
   */
  private retrieveCache: Map<string, {memory: Memory, timestamp: number}> = new Map();
  
  /**
   * 检索缓存有效期(毫秒)
   */
  private cacheTTL = 1000;

  /**
   * 最大记忆条目数
   */
  private readonly maxItems?: number;
  
  /**
   * 最大会话数量
   * 超过此数量时，最旧的会话会被清除
   */
  private readonly maxSessions: number;
  
  /**
   * 记忆压缩配置
   */
  private readonly compressionConfig: {
    /**
     * 触发压缩的条目数阈值
     */
    threshold: number;
    
    /**
     * 压缩比例，压缩后保留的条目数与阈值的比例
     */
    ratio: number;
  };

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: AgentMemoryOptions) {
    this.agentId = options.agentId;
    this.maxItems = options.maxItems;
    this.maxSessions = options.maxSessions || 100;
    this.compressionConfig = {
      threshold: options.compressionThreshold || (this.maxItems ? this.maxItems * 0.8 : 100),
      ratio: options.compressionRatio || 0.6
    };
    
    // 定期清理过期缓存和旧会话
    setInterval(() => this.performMaintenance(), 60000);
  }

  /**
   * 存储记忆
   * @param memory 要存储的记忆
   */
  async store(memory: Memory): Promise<void> {
    // 检查记忆长度并根据需要进行压缩
    if (Array.isArray(memory.content)) {
      if (this.shouldCompress(memory)) {
        memory = this.compressMemory(memory);
      } else if (this.maxItems && memory.content.length > this.maxItems) {
        // 如果超过最大条目数但未达到压缩阈值，进行简单截断
        memory = this.truncateMemory(memory);
      }
    }

    // 更新记忆的元数据
    const now = Date.now();
    const updatedMemory = {
      ...memory,
      metadata: {
        ...memory.metadata,
        updatedAt: now
      }
    };

    // 保存记忆
    this.memories.set(memory.id, updatedMemory);
    
    // 更新会话索引
    this.updateSessionIndex(memory.id, now);
    
    // 更新检索缓存
    this.retrieveCache.set(memory.id, {
      memory: updatedMemory,
      timestamp: now
    });
    
    // 如果会话数量超过限制，清除最旧的会话
    this.pruneOldSessions();
  }

  /**
   * 检索会话记忆
   * @param sessionId 会话ID
   * @returns 会话的记忆
   */
  async retrieve(sessionId: string): Promise<Memory> {
    // 检查缓存
    const cached = this.retrieveCache.get(sessionId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp <= this.cacheTTL)) {
      return cached.memory;
    }
    
    const memory = this.memories.get(sessionId);
    
    if (!memory) {
      // 如果不存在，创建空记忆
      const emptyMemory = {
        id: sessionId,
        content: [] as MemoryItem[],
        metadata: { 
          created: now,
          agentId: this.agentId,
          updatedAt: now
        }
      };
      
      // 缓存空记忆结果
      this.retrieveCache.set(sessionId, {
        memory: emptyMemory,
        timestamp: now
      });
      
      return emptyMemory;
    }
    
    // 更新检索缓存
    this.retrieveCache.set(sessionId, {
      memory,
      timestamp: now
    });
    
    // 更新会话索引
    this.updateSessionIndex(sessionId, now);
    
    return memory;
  }

  /**
   * 清除特定会话的记忆
   * @param sessionId 会话ID
   */
  async clear(sessionId: string): Promise<void> {
    this.memories.delete(sessionId);
    this.retrieveCache.delete(sessionId);
    
    // 更新会话索引，移除该会话
    this.sessionIndex = this.sessionIndex.filter(session => session.id !== sessionId);
  }

  /**
   * 获取所有会话ID
   * @returns 所有会话ID的数组
   */
  async getAllSessionIds(): Promise<string[]> {
    return this.sessionIndex.map(session => session.id);
  }
  
  /**
   * 更新会话索引
   * @param sessionId 会话ID
   * @param timestamp 更新时间戳
   * @private
   */
  private updateSessionIndex(sessionId: string, timestamp: number): void {
    // 查找并移除现有索引
    this.sessionIndex = this.sessionIndex.filter(session => session.id !== sessionId);
    
    // 添加到索引，按时间戳降序排序
    this.sessionIndex.push({ id: sessionId, lastUpdated: timestamp });
    this.sessionIndex.sort((a, b) => b.lastUpdated - a.lastUpdated);
  }
  
  /**
   * 清理过期缓存和执行维护工作
   * @private
   */
  private performMaintenance(): void {
    const now = Date.now();
    
    // 清理过期检索缓存
    for (const [key, item] of this.retrieveCache.entries()) {
      if (now - item.timestamp > this.cacheTTL) {
        this.retrieveCache.delete(key);
      }
    }
    
    // 清理过期会话
    this.pruneOldSessions();
  }
  
  /**
   * 清理过旧会话
   * @private
   */
  private pruneOldSessions(): void {
    if (this.sessionIndex.length <= this.maxSessions) {
      return;
    }
    
    // 保留最近的会话，清除旧会话
    const sessionsToKeep = this.sessionIndex.slice(0, this.maxSessions);
    const sessionsToRemove = this.sessionIndex.slice(this.maxSessions);
    
    // 更新索引
    this.sessionIndex = sessionsToKeep;
    
    // 清除旧会话数据
    for (const session of sessionsToRemove) {
      this.memories.delete(session.id);
      this.retrieveCache.delete(session.id);
    }
  }
  
  /**
   * 判断是否应该进行记忆压缩
   * @param memory 记忆对象
   * @returns 是否应该压缩
   * @private
   */
  private shouldCompress(memory: Memory): boolean {
    if (!Array.isArray(memory.content)) {
      return false;
    }
    
    return memory.content.length > this.compressionConfig.threshold;
  }

  /**
   * 压缩记忆，使用智能算法保留重要信息
   * @param memory 要压缩的记忆
   * @returns 压缩后的记忆
   * @private
   */
  private compressMemory(memory: Memory): Memory {
    if (!Array.isArray(memory.content)) {
      return memory;
    }

    const items = memory.content as MemoryItem[];
    
    // 计算压缩后应保留的条目数
    const targetCount = Math.floor(this.compressionConfig.threshold * this.compressionConfig.ratio);
    
    if (items.length <= targetCount) {
      return memory;
    }

    // 系统消息总是保留
    const systemMessages = items.filter(item => item.role === 'system');
    
    // 计算需要从非系统消息中保留的数量
    const nonSystemToKeep = targetCount - systemMessages.length;
    
    if (nonSystemToKeep <= 0) {
      // 如果只能保留系统消息，则只返回系统消息
      return {
        ...memory,
        content: [...systemMessages],
        metadata: {
          ...memory.metadata,
          compressed: true,
          originalLength: items.length
        }
      };
    }
    
    // 获取非系统消息
    const nonSystemMessages = items.filter(item => item.role !== 'system');
    
    // 保留策略：
    // 1. 保留最近的一半消息
    // 2. 从剩余的消息中均匀采样
    
    const recentCount = Math.floor(nonSystemToKeep / 2);
    const recentMessages = nonSystemMessages.slice(-recentCount);
    
    // 从较早的消息中采样
    const olderMessages = nonSystemMessages.slice(0, -recentCount);
    const sampledOlderMessages = this.sampleMessages(olderMessages, nonSystemToKeep - recentCount);
    
    // 合并消息并按原始顺序排序
    const selectedNonSystemMessages = [...sampledOlderMessages, ...recentMessages];
    
    // 合并所有消息
    return {
      ...memory,
      content: [...systemMessages, ...selectedNonSystemMessages],
      metadata: {
        ...memory.metadata,
        compressed: true,
        originalLength: items.length,
        compressionTime: Date.now()
      }
    };
  }
  
  /**
   * 从消息列表中均匀采样
   * @param messages 消息列表
   * @param count 采样数量
   * @returns 采样后的消息
   * @private
   */
  private sampleMessages(messages: MemoryItem[], count: number): MemoryItem[] {
    if (messages.length <= count) {
      return messages;
    }
    
    // 计算采样间隔
    const step = messages.length / count;
    const result: MemoryItem[] = [];
    
    // 均匀采样
    for (let i = 0; i < count; i++) {
      const index = Math.floor(i * step);
      if (index < messages.length) {
        result.push(messages[index]);
      }
    }
    
    return result;
  }
  
  /**
   * 简单截断记忆，保持在最大条目数以内
   * @param memory 要截断的记忆
   * @returns 截断后的记忆
   * @private
   */
  private truncateMemory(memory: Memory): Memory {
    if (!this.maxItems || !Array.isArray(memory.content)) {
      return memory;
    }

    const items = memory.content as MemoryItem[];
    if (items.length <= this.maxItems) {
      return memory;
    }

    // 保留system消息和最近的消息
    const systemMessages = items.filter(item => item.role === 'system');
    const recentMessages = items
      .filter(item => item.role !== 'system')
      .slice(-this.maxItems + systemMessages.length);

    return {
      ...memory,
      content: [...systemMessages, ...recentMessages],
      metadata: {
        ...memory.metadata,
        truncated: true,
        originalLength: items.length
      }
    };
  }
} 