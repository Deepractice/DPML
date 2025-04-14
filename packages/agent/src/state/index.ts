/**
 * DPML Agent 状态管理模块
 * 提供代理状态模型、状态转换和状态管理功能
 */

// 导出状态类型和接口
import { AgentStatus, AGENT_STATE_TRANSITIONS } from './AgentState';
import type {
  AgentState,
  AgentStateEvent,
  AgentMessage,
  AgentStateChangeEventData,
  AgentStateErrorEventData,
  AgentStateTimeoutEventData
} from './AgentState';

export { AgentStatus, AGENT_STATE_TRANSITIONS };
export type {
  AgentState,
  AgentStateEvent,
  AgentMessage,
  AgentStateChangeEventData,
  AgentStateErrorEventData,
  AgentStateTimeoutEventData
};

// 导出状态管理器接口和选项
import type { AgentStateManager, AgentStateManagerOptions } from './AgentStateManager';

export type { AgentStateManager, AgentStateManagerOptions };

// 导出内存状态管理器
export { InMemoryAgentStateManager } from './InMemoryAgentStateManager';

// 导出文件系统状态管理器及其选项
import { FileSystemAgentStateManager } from './FileSystemAgentStateManager';
import type { FileSystemAgentStateManagerOptions } from './FileSystemAgentStateManager';

export { FileSystemAgentStateManager };
export type { FileSystemAgentStateManagerOptions };

// 导出状态管理器工厂
import { AgentStateManagerFactory, AgentStateManagerType } from './AgentStateManagerFactory';
import type { AgentStateManagerFactoryConfig } from './AgentStateManagerFactory';

export { AgentStateManagerFactory, AgentStateManagerType };
export type { AgentStateManagerFactoryConfig };