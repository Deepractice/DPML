import { AgentStateManager, AgentStateManagerOptions } from './AgentStateManager';
import { InMemoryAgentStateManager } from './InMemoryAgentStateManager';
import { FileSystemAgentStateManager, FileSystemAgentStateManagerOptions } from './FileSystemAgentStateManager';

/**
 * 状态管理器类型
 */
export enum AgentStateManagerType {
  /** 内存存储类型 */
  MEMORY = 'memory',
  
  /** 文件系统存储类型 */
  FILE_SYSTEM = 'file-system'
}

/**
 * 状态管理器工厂配置
 */
export interface AgentStateManagerFactoryConfig {
  /** 状态管理器类型 */
  type: AgentStateManagerType;
  
  /** 状态管理器选项 */
  options: AgentStateManagerOptions | FileSystemAgentStateManagerOptions;
}

/**
 * 代理状态管理器工厂
 * 创建不同类型的状态管理器
 */
export class AgentStateManagerFactory {
  /**
   * 创建状态管理器
   * @param config 配置对象
   * @returns 状态管理器实例
   */
  static create(config: AgentStateManagerFactoryConfig): AgentStateManager {
    switch (config.type) {
      case AgentStateManagerType.MEMORY:
        return new InMemoryAgentStateManager(config.options);
        
      case AgentStateManagerType.FILE_SYSTEM:
        if (!this.isFileSystemOptions(config.options)) {
          throw new Error('Invalid options for file system state manager');
        }
        return new FileSystemAgentStateManager(config.options);
        
      default:
        throw new Error(`Unsupported state manager type: ${config.type}`);
    }
  }
  
  /**
   * 创建内存存储状态管理器
   * @param options 配置选项
   * @returns 状态管理器实例
   */
  static createMemoryStateManager(options: AgentStateManagerOptions): InMemoryAgentStateManager {
    return new InMemoryAgentStateManager(options);
  }
  
  /**
   * 创建文件系统存储状态管理器
   * @param options 配置选项
   * @returns 状态管理器实例
   */
  static createFileSystemStateManager(options: FileSystemAgentStateManagerOptions): FileSystemAgentStateManager {
    return new FileSystemAgentStateManager(options);
  }
  
  /**
   * 类型判断：是否是文件系统选项
   * @param options 选项对象
   * @returns 是否是文件系统选项
   */
  private static isFileSystemOptions(
    options: AgentStateManagerOptions | FileSystemAgentStateManagerOptions
  ): options is FileSystemAgentStateManagerOptions {
    return 'storageDir' in options;
  }
} 