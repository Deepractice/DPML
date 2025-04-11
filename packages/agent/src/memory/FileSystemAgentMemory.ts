import * as fs from 'fs';
import * as path from 'path';
import { Memory, MemoryItem, AgentMemory, AgentMemoryOptions } from './types';

/**
 * 基于文件系统的代理记忆存储实现
 */
export class FileSystemAgentMemory implements AgentMemory {
  /**
   * 代理ID
   */
  private readonly agentId: string;

  /**
   * 基础路径
   */
  private readonly basePath: string;

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
    
    if (!options.basePath) {
      throw new Error('FileSystemAgentMemory requires basePath option');
    }
    
    this.basePath = options.basePath;
    
    // 确保目录存在
    this.ensureDirectoryExists();
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

    const filePath = this.getFilePath(memory.id);
    
    // 添加更新时间戳到元数据
    const memoryToSave = {
      ...memory,
      metadata: {
        ...memory.metadata,
        updatedAt: Date.now(),
        agentId: this.agentId
      }
    };
    
    // 写入文件
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(memoryToSave, null, 2),
      'utf-8'
    );
  }

  /**
   * 检索会话记忆
   * @param sessionId 会话ID
   * @returns 会话的记忆
   */
  async retrieve(sessionId: string): Promise<Memory> {
    const filePath = this.getFilePath(sessionId);
    
    try {
      // 尝试读取文件
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data) as Memory;
    } catch (error) {
      // 文件不存在或读取错误，返回空记忆
      return {
        id: sessionId,
        content: [] as MemoryItem[],
        metadata: { 
          created: Date.now(),
          agentId: this.agentId
        }
      };
    }
  }

  /**
   * 清除特定会话的记忆
   * @param sessionId 会话ID
   */
  async clear(sessionId: string): Promise<void> {
    const filePath = this.getFilePath(sessionId);
    
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      // 如果文件不存在，忽略错误
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 获取所有会话ID
   * @returns 所有会话ID的数组
   */
  async getAllSessionIds(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.basePath);
      
      // 过滤出.json文件并提取会话ID
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
    } catch (error) {
      // 目录不存在或读取错误
      return [];
    }
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

  /**
   * 获取会话文件路径
   * @param sessionId 会话ID
   * @returns 文件路径
   * @private
   */
  private getFilePath(sessionId: string): string {
    // 清理会话ID，防止路径注入
    const safeSessionId = sessionId.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.basePath, `${safeSessionId}.json`);
  }

  /**
   * 确保目录存在
   * @private
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }
} 