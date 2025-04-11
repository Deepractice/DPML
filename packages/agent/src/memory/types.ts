/**
 * 记忆基础接口
 * 表示一个独立的记忆单元
 */
export interface Memory {
  // 唯一标识符（通常是会话ID）
  id: string;
  
  // 记忆内容（可以是任何类型）
  content: any;
  
  // 元数据（提供扩展性）
  metadata?: Record<string, any>;
}

/**
 * 会话记忆项
 * 默认的对话内容类型
 */
export interface MemoryItem {
  // 内容文本
  text: string;
  
  // 角色（用户、助手、系统）
  role: 'user' | 'assistant' | 'system';
  
  // 创建时间
  timestamp: number;
}

/**
 * 代理记忆存储
 * 提供记忆的基本存取功能
 */
export interface AgentMemory {
  /**
   * 存储记忆
   * @param memory 要存储的记忆
   */
  store(memory: Memory): Promise<void>;
  
  /**
   * 检索会话记忆
   * @param sessionId 会话ID
   * @returns 会话的记忆
   */
  retrieve(sessionId: string): Promise<Memory>;
  
  /**
   * 清除特定会话的记忆
   * @param sessionId 会话ID
   */
  clear(sessionId: string): Promise<void>;

  /**
   * 获取所有会话ID
   * @returns 所有会话ID的数组
   */
  getAllSessionIds(): Promise<string[]>;
}

/**
 * 代理记忆管理器工厂选项
 */
export interface AgentMemoryOptions {
  /**
   * 代理ID
   */
  agentId: string;
  
  /**
   * 记忆存储类型
   */
  type?: 'memory' | 'file';
  
  /**
   * 文件系统存储的基础路径
   * 仅当type为'file'时使用
   */
  basePath?: string;
  
  /**
   * 最大记忆条目数
   * 超过此数量会触发记忆压缩
   */
  maxItems?: number;
  
  /**
   * 最大会话数量
   * 超过此数量时，最旧的会话会被清除
   * 默认值：100
   */
  maxSessions?: number;
  
  /**
   * 记忆压缩阈值
   * 当记忆条目数超过此阈值时触发压缩
   * 默认值：maxItems的80%或100
   */
  compressionThreshold?: number;
  
  /**
   * 压缩比例
   * 压缩后保留的条目数与阈值的比例
   * 默认值：0.6
   */
  compressionRatio?: number;
} 