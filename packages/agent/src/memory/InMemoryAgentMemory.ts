import { v4 as uuidv4 } from 'uuid';
import { Memory, MemoryItem, AgentMemory, AgentMemoryOptions } from './types';

/**
 * 基于内存的代理记忆存储实现
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
   * 最大记忆条目数
   */
  private readonly maxItems?: number;

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: AgentMemoryOptions) {
    this.agentId = options.agentId;
    this.maxItems = options.maxItems;
  }

  /**
   * 存储记忆
   * @param memory 要存储的记忆
   */
  async store(memory: Memory): Promise<void> {
    // 检查记忆长度并根据需要进行压缩
    if (this.maxItems && Array.isArray(memory.content)) {
      memory = this.compressMemoryIfNeeded(memory);
    }

    // 保存记忆
    this.memories.set(memory.id, {
      ...memory,
      metadata: {
        ...memory.metadata,
        updatedAt: Date.now()
      }
    });
  }

  /**
   * 检索会话记忆
   * @param sessionId 会话ID
   * @returns 会话的记忆
   */
  async retrieve(sessionId: string): Promise<Memory> {
    const memory = this.memories.get(sessionId);
    
    if (!memory) {
      // 如果不存在，返回空记忆
      return {
        id: sessionId,
        content: [] as MemoryItem[],
        metadata: { 
          created: Date.now(),
          agentId: this.agentId
        }
      };
    }
    
    return memory;
  }

  /**
   * 清除特定会话的记忆
   * @param sessionId 会话ID
   */
  async clear(sessionId: string): Promise<void> {
    this.memories.delete(sessionId);
  }

  /**
   * 获取所有会话ID
   * @returns 所有会话ID的数组
   */
  async getAllSessionIds(): Promise<string[]> {
    return Array.from(this.memories.keys());
  }

  /**
   * 压缩记忆以保持在最大条目数以内
   * @param memory 要压缩的记忆
   * @returns 压缩后的记忆
   * @private
   */
  private compressMemoryIfNeeded(memory: Memory): Memory {
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