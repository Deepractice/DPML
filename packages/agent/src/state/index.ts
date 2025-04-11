/**
 * DPML Agent 状态管理模块
 * 提供代理状态模型、状态转换和状态管理功能
 */

// 导出状态类型和接口
export {
  AgentState,
  AgentStatus,
  AgentStateEvent,
  AgentMessage,
  AgentStateChangeEventData,
  AgentStateErrorEventData,
  AgentStateTimeoutEventData,
  AGENT_STATE_TRANSITIONS
} from './AgentState';

// 导出状态管理器接口和选项
export {
  AgentStateManager,
  AgentStateManagerOptions
} from './AgentStateManager';

// 导出内存状态管理器
export { InMemoryAgentStateManager } from './InMemoryAgentStateManager';

// 导出文件系统状态管理器及其选项
export {
  FileSystemAgentStateManager,
  FileSystemAgentStateManagerOptions
} from './FileSystemAgentStateManager';

// 导出状态管理器工厂
export {
  AgentStateManagerFactory,
  AgentStateManagerType,
  AgentStateManagerFactoryConfig
} from './AgentStateManagerFactory'; 