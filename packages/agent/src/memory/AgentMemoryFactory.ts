import { AgentMemory, AgentMemoryOptions } from './types';
import { InMemoryAgentMemory } from './InMemoryAgentMemory';
import { FileSystemAgentMemory } from './FileSystemAgentMemory';

/**
 * 代理记忆管理器工厂
 * 创建不同类型的记忆存储实例
 */
export class AgentMemoryFactory {
  /**
   * 创建记忆管理器
   * @param options 配置选项
   * @returns 记忆管理器实例
   */
  static create(options: AgentMemoryOptions): AgentMemory {
    // 检查必填项
    if (!options.agentId) {
      throw new Error('AgentMemoryFactory requires agentId option');
    }

    // 根据类型创建不同的存储实现
    const type = options.type || 'memory';
    
    switch (type) {
      case 'memory':
        return new InMemoryAgentMemory(options);
      
      case 'file':
        // 确保文件系统存储有基础路径
        if (!options.basePath) {
          throw new Error('FileSystemAgentMemory requires basePath option');
        }
        return new FileSystemAgentMemory(options);
      
      default:
        throw new Error(`Unknown memory type: ${type}`);
    }
  }
} 