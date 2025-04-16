import { describe, it, expect } from 'vitest';

import {
  AgentStatus,
  AGENT_STATE_TRANSITIONS,
} from '../../../state/AgentState';

describe('AgentState', () => {
  describe('AgentStatus', () => {
    it('should define all required states', () => {
      // 测试所有必需的状态是否存在
      expect(AgentStatus.IDLE).toBeDefined();
      expect(AgentStatus.THINKING).toBeDefined();
      expect(AgentStatus.EXECUTING).toBeDefined();
      expect(AgentStatus.RESPONDING).toBeDefined();
      expect(AgentStatus.DONE).toBeDefined();
      expect(AgentStatus.PAUSED).toBeDefined();
      expect(AgentStatus.ERROR).toBeDefined();
    });

    it('should use correct string values', () => {
      // 测试状态枚举值是否正确
      expect(AgentStatus.IDLE).toBe('idle');
      expect(AgentStatus.THINKING).toBe('thinking');
      expect(AgentStatus.EXECUTING).toBe('executing');
      expect(AgentStatus.RESPONDING).toBe('responding');
      expect(AgentStatus.DONE).toBe('done');
      expect(AgentStatus.PAUSED).toBe('paused');
      expect(AgentStatus.ERROR).toBe('error');
    });
  });

  describe('AGENT_STATE_TRANSITIONS', () => {
    it('should define transitions for all states', () => {
      // 检查所有状态是否都有转换规则
      Object.values(AgentStatus).forEach(status => {
        expect(AGENT_STATE_TRANSITIONS[status]).toBeDefined();
        expect(Array.isArray(AGENT_STATE_TRANSITIONS[status])).toBe(true);
      });
    });

    it('should define valid transitions from IDLE state', () => {
      const transitions = AGENT_STATE_TRANSITIONS[AgentStatus.IDLE];

      expect(transitions).toContain(AgentStatus.THINKING);
      expect(transitions).toContain(AgentStatus.ERROR);
      expect(transitions).not.toContain(AgentStatus.IDLE); // 不能自我循环
    });

    it('should define valid transitions from THINKING state', () => {
      const transitions = AGENT_STATE_TRANSITIONS[AgentStatus.THINKING];

      expect(transitions).toContain(AgentStatus.EXECUTING);
      expect(transitions).toContain(AgentStatus.RESPONDING);
      expect(transitions).toContain(AgentStatus.ERROR);
      expect(transitions).toContain(AgentStatus.PAUSED);
    });

    it('should define valid transitions from EXECUTING state', () => {
      const transitions = AGENT_STATE_TRANSITIONS[AgentStatus.EXECUTING];

      expect(transitions).toContain(AgentStatus.THINKING);
      expect(transitions).toContain(AgentStatus.RESPONDING);
      expect(transitions).toContain(AgentStatus.DONE);
      expect(transitions).toContain(AgentStatus.ERROR);
      expect(transitions).toContain(AgentStatus.PAUSED);
    });

    it('should define valid transitions from RESPONDING state', () => {
      const transitions = AGENT_STATE_TRANSITIONS[AgentStatus.RESPONDING];

      expect(transitions).toContain(AgentStatus.DONE);
      expect(transitions).toContain(AgentStatus.ERROR);
      expect(transitions).toContain(AgentStatus.PAUSED);
    });

    it('should define valid transitions from DONE state', () => {
      const transitions = AGENT_STATE_TRANSITIONS[AgentStatus.DONE];

      expect(transitions).toContain(AgentStatus.IDLE);
      expect(transitions).toContain(AgentStatus.ERROR);
    });

    it('should define valid transitions from PAUSED state', () => {
      const transitions = AGENT_STATE_TRANSITIONS[AgentStatus.PAUSED];

      expect(transitions).toContain(AgentStatus.THINKING);
      expect(transitions).toContain(AgentStatus.EXECUTING);
      expect(transitions).toContain(AgentStatus.RESPONDING);
      expect(transitions).toContain(AgentStatus.ERROR);
    });

    it('should define valid transitions from ERROR state', () => {
      const transitions = AGENT_STATE_TRANSITIONS[AgentStatus.ERROR];

      expect(transitions).toContain(AgentStatus.IDLE);
    });
  });
});
