import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  AgentStatus,
  InMemoryAgentStateManager 
} from '../../../src/state';

// 模拟uuid模块
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123'
}));

describe('InMemoryAgentStateManager', () => {
  // 测试会话ID
  const testSessionId = 'test-session-1';
  // 测试代理ID
  const testAgentId = 'test-agent-1';
  
  // 测试对象
  let stateManager: InMemoryAgentStateManager;
  
  // 测试前准备
  beforeEach(async () => {
    // 创建内存状态管理器
    stateManager = new InMemoryAgentStateManager({
      agentId: testAgentId
    });
    
    // 初始化状态管理器
    await stateManager.initialize();
  });
  
  // 恢复模拟的清理
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('creation', () => {
    it('should create a state manager with default options', () => {
      const manager = new InMemoryAgentStateManager({ agentId: testAgentId });
      expect(manager).toBeInstanceOf(InMemoryAgentStateManager);
    });
    
    it('should create a state manager with custom options', () => {
      const manager = new InMemoryAgentStateManager({
        agentId: testAgentId,
        defaultTimeoutMs: 10000,
        enableEvents: true,
        detectTimeouts: true,
        timeoutCheckIntervalMs: 1000
      });
      expect(manager).toBeInstanceOf(InMemoryAgentStateManager);
    });
  });
  
  describe('session management', () => {
    it('should create a new session with default state', async () => {
      const state = await stateManager.createSession(testSessionId);
      
      expect(state).toBeDefined();
      expect(state.id).toBe('test-uuid-123');
      expect(state.sessionId).toBe(testSessionId);
      expect(state.status).toBe(AgentStatus.IDLE);
      expect(state.messages).toEqual([]);
      expect(state.metadata).toEqual({});
      expect(state.timeoutMs).toBe(0); // 默认超时
      expect(state.updatedAt).toBeGreaterThan(0);
      expect(state.statusStartedAt).toBeGreaterThan(0);
    });
    
    it('should create a new session with custom initial state', async () => {
      const initialState = {
        status: AgentStatus.THINKING,
        timeoutMs: 5000,
        metadata: { key: 'value' }
      };
      
      const state = await stateManager.createSession(testSessionId, initialState);
      
      expect(state.id).toBe('test-uuid-123');
      expect(state.sessionId).toBe(testSessionId);
      expect(state.status).toBe(AgentStatus.THINKING);
      expect(state.timeoutMs).toBe(5000);
      expect(state.metadata).toEqual({ key: 'value' });
    });
    
    it('should check if a session exists', async () => {
      expect(await stateManager.hasSession(testSessionId)).toBe(false);
      
      await stateManager.createSession(testSessionId);
      
      expect(await stateManager.hasSession(testSessionId)).toBe(true);
    });
    
    it('should get existing session state', async () => {
      await stateManager.createSession(testSessionId);
      
      const state = await stateManager.getState(testSessionId);
      
      expect(state).toBeDefined();
      expect(state?.sessionId).toBe(testSessionId);
    });
    
    it('should return null for non-existent session', async () => {
      const state = await stateManager.getState('non-existent-session');
      expect(state).toBeNull();
    });
    
    it('should delete a session', async () => {
      await stateManager.createSession(testSessionId);
      expect(await stateManager.hasSession(testSessionId)).toBe(true);
      
      const result = await stateManager.deleteSession(testSessionId);
      
      expect(result).toBe(true);
      expect(await stateManager.hasSession(testSessionId)).toBe(false);
    });
    
    it('should return false when deleting non-existent session', async () => {
      const result = await stateManager.deleteSession('non-existent-session');
      expect(result).toBe(false);
    });
    
    it('should get all session IDs', async () => {
      await stateManager.createSession('session-1');
      await stateManager.createSession('session-2');
      await stateManager.createSession('session-3');
      
      const sessionIds = await stateManager.getAllSessionIds();
      
      expect(sessionIds).toHaveLength(3);
      expect(sessionIds).toContain('session-1');
      expect(sessionIds).toContain('session-2');
      expect(sessionIds).toContain('session-3');
    });
  });
  
  describe('state transitions', () => {
    beforeEach(async () => {
      // 创建一个测试会话
      await stateManager.createSession(testSessionId);
    });
    
    it('should validate state transitions', () => {
      // 有效转换
      expect(stateManager.isValidTransition(AgentStatus.IDLE, AgentStatus.THINKING)).toBe(true);
      expect(stateManager.isValidTransition(AgentStatus.THINKING, AgentStatus.EXECUTING)).toBe(true);
      
      // 无效转换
      expect(stateManager.isValidTransition(AgentStatus.IDLE, AgentStatus.DONE)).toBe(false);
      expect(stateManager.isValidTransition(AgentStatus.ERROR, AgentStatus.EXECUTING)).toBe(false);
    });
    
    it('should transition state with valid transition', async () => {
      const state = await stateManager.transitionState(testSessionId, AgentStatus.THINKING);
      
      expect(state.status).toBe(AgentStatus.THINKING);
      expect(state.metadata.stateChangeReason).toBe('transition');
      
      // 检查状态是否已更新
      const updatedState = await stateManager.getState(testSessionId);
      expect(updatedState?.status).toBe(AgentStatus.THINKING);
    });
    
    it('should transition state with custom reason', async () => {
      const state = await stateManager.transitionState(
        testSessionId, 
        AgentStatus.THINKING, 
        'user_input'
      );
      
      expect(state.status).toBe(AgentStatus.THINKING);
      expect(state.metadata.stateChangeReason).toBe('user_input');
    });
    
    it('should throw error for invalid transition', async () => {
      // 从IDLE不能直接到DONE
      await expect(
        stateManager.transitionState(testSessionId, AgentStatus.DONE)
      ).rejects.toThrow(/Invalid state transition/);
    });
    
    it('should throw error for non-existent session', async () => {
      await expect(
        stateManager.transitionState('non-existent', AgentStatus.THINKING)
      ).rejects.toThrow(/does not exist/);
    });
    
    it('should update state partially', async () => {
      const updates = {
        metadata: { key: 'value' },
        timeoutMs: 10000
      };
      
      const state = await stateManager.updateState(testSessionId, updates);
      
      expect(state.status).toBe(AgentStatus.IDLE); // 保持原状态
      expect(state.metadata).toEqual({ key: 'value' });
      expect(state.timeoutMs).toBe(10000);
    });
    
    it('should reset state to IDLE', async () => {
      // 先转换到一个非IDLE状态
      await stateManager.transitionState(testSessionId, AgentStatus.THINKING);
      
      // 重置状态
      const state = await stateManager.resetState(testSessionId);
      
      expect(state.status).toBe(AgentStatus.IDLE);
      expect(state.metadata.stateChangeReason).toBe('reset');
    });
  });
  
  describe('serialization', () => {
    beforeEach(async () => {
      // 创建一个测试会话
      await stateManager.createSession(testSessionId, {
        metadata: { key: 'value' }
      });
    });
    
    it('should serialize state to JSON string', async () => {
      const serialized = await stateManager.serializeState(testSessionId);
      
      expect(typeof serialized).toBe('string');
      
      const parsed = JSON.parse(serialized);
      expect(parsed.id).toBe('test-uuid-123');
      expect(parsed.sessionId).toBe(testSessionId);
      expect(parsed.metadata).toEqual({ key: 'value' });
    });
    
    it('should throw error when serializing non-existent session', async () => {
      await expect(
        stateManager.serializeState('non-existent')
      ).rejects.toThrow(/does not exist/);
    });
    
    it('should deserialize state from JSON string', async () => {
      // 创建序列化数据
      const serialized = JSON.stringify({
        id: 'uuid-new',
        sessionId: 'new-session',
        status: AgentStatus.EXECUTING,
        updatedAt: Date.now(),
        statusStartedAt: Date.now(),
        timeoutMs: 5000,
        messages: [],
        metadata: { restored: true }
      });
      
      const state = await stateManager.deserializeState('new-session', serialized);
      
      expect(state.id).toBe('uuid-new');
      expect(state.sessionId).toBe('new-session');
      expect(state.status).toBe(AgentStatus.EXECUTING);
      expect(state.metadata).toEqual({ restored: true });
      
      // 检查是否已保存
      expect(await stateManager.hasSession('new-session')).toBe(true);
    });
    
    it('should throw error when deserializing invalid JSON', async () => {
      await expect(
        stateManager.deserializeState('test', 'invalid-json')
      ).rejects.toThrow(/Failed to deserialize/);
    });
  });
  
  describe('event handling', () => {
    let stateChangeCallback: vi.Mock;
    let timeoutCallback: vi.Mock;
    let resetCallback: vi.Mock;
    
    beforeEach(async () => {
      // 创建模拟回调
      stateChangeCallback = vi.fn();
      timeoutCallback = vi.fn();
      resetCallback = vi.fn();
      
      // 创建会话
      await stateManager.createSession(testSessionId);
      
      // 注册事件监听器
      stateManager.on('state:change', stateChangeCallback);
      stateManager.on('state:timeout', timeoutCallback);
      stateManager.on('state:reset', resetCallback);
    });
    
    it('should trigger state:change event on transition', async () => {
      await stateManager.transitionState(testSessionId, AgentStatus.THINKING);
      
      // 使用setTimeout给异步事件时间执行
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(stateChangeCallback).toHaveBeenCalledTimes(1);
      expect(stateChangeCallback).toHaveBeenCalledWith(expect.objectContaining({
        agentId: testAgentId,
        sessionId: testSessionId,
        previousStatus: AgentStatus.IDLE,
        currentStatus: AgentStatus.THINKING
      }));
    });
    
    it('should trigger state:reset event on reset', async () => {
      // 先切换到非IDLE状态
      await stateManager.transitionState(testSessionId, AgentStatus.THINKING);
      
      // 重置状态
      await stateManager.resetState(testSessionId);
      
      // 使用setTimeout给异步事件时间执行
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(resetCallback).toHaveBeenCalledTimes(1);
      expect(resetCallback).toHaveBeenCalledWith(expect.objectContaining({
        agentId: testAgentId,
        sessionId: testSessionId,
        previousStatus: AgentStatus.THINKING,
        currentStatus: AgentStatus.IDLE,
        reason: 'reset'
      }));
    });
    
    it('should remove event listener with off()', async () => {
      // 保存监听器ID
      const listenerId = stateManager.on('state:change', vi.fn());
      
      // 移除监听器
      const result = stateManager.off(listenerId);
      
      expect(result).toBe(true);
    });
    
    it('should return false when removing non-existent listener', () => {
      const result = stateManager.off('non-existent-id');
      expect(result).toBe(false);
    });
  });
}); 