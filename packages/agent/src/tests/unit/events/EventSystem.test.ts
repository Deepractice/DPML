import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { DefaultEventSystem } from '../../../events/DefaultEventSystem';
import { EventType } from '../../../events/EventTypes';

import type { EventSystem } from '../../../events/EventSystem';
import type { EventData } from '../../../events/EventTypes';

describe('EventSystem', () => {
  let eventSystem: EventSystem;

  beforeEach(() => {
    eventSystem = new DefaultEventSystem();
  });

  // 测试用例 UT-EV-001: 事件注册与触发
  it('should register and trigger events correctly', async () => {
    const listener = vi.fn();
    const eventType = EventType.AGENT_INITIALIZED;
    const eventData: EventData = {
      agentId: 'test-agent',
      timestamp: Date.now(),
    };

    const listenerId = eventSystem.on(eventType, listener);

    expect(listenerId).toBeTypeOf('string');

    eventSystem.emit(eventType, eventData);

    // 等待异步事件处理完成
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(listener).toHaveBeenCalled();
    expect(listener.mock.calls[0][0]).toMatchObject(eventData);
  });

  // 测试用例 UT-EV-002: 生命周期事件触发
  it('should trigger lifecycle events in the expected order', async () => {
    const events: string[] = [];

    eventSystem.on(EventType.AGENT_INITIALIZING, () => {
      events.push('initializing');
    });
    eventSystem.on(EventType.AGENT_INITIALIZED, () => {
      events.push('initialized');
    });
    eventSystem.on(EventType.CHAT_STARTED, () => {
      events.push('chat_started');
    });
    eventSystem.on(EventType.CHAT_COMPLETED, () => {
      events.push('chat_completed');
    });

    eventSystem.emit(EventType.AGENT_INITIALIZING, { timestamp: Date.now() });
    eventSystem.emit(EventType.AGENT_INITIALIZED, { timestamp: Date.now() });
    eventSystem.emit(EventType.CHAT_STARTED, { timestamp: Date.now() });
    eventSystem.emit(EventType.CHAT_COMPLETED, { timestamp: Date.now() });

    // 等待异步事件处理完成
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(events).toEqual([
      'initializing',
      'initialized',
      'chat_started',
      'chat_completed',
    ]);
  });

  // 测试用例 UT-EV-003: 处理阶段事件触发
  it('should trigger processing phase events correctly', async () => {
    const events: string[] = [];

    eventSystem.on(EventType.PROMPT_BUILDING, () => {
      events.push('prompt_building');
    });
    eventSystem.on(EventType.PROMPT_BUILT, () => {
      events.push('prompt_built');
    });
    eventSystem.on(EventType.LLM_REQUEST_STARTED, () => {
      events.push('llm_request_started');
    });
    eventSystem.on(EventType.LLM_REQUEST_COMPLETED, () => {
      events.push('llm_request_completed');
    });

    eventSystem.emit(EventType.PROMPT_BUILDING, { timestamp: Date.now() });
    eventSystem.emit(EventType.PROMPT_BUILT, { timestamp: Date.now() });
    eventSystem.emit(EventType.LLM_REQUEST_STARTED, { timestamp: Date.now() });
    eventSystem.emit(EventType.LLM_REQUEST_COMPLETED, {
      timestamp: Date.now(),
    });

    // 等待异步事件处理完成
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(events).toEqual([
      'prompt_building',
      'prompt_built',
      'llm_request_started',
      'llm_request_completed',
    ]);
  });

  // 测试用例 UT-EV-004: 异步事件处理
  it('should handle async event listeners correctly', async () => {
    const result: string[] = [];

    eventSystem.on(EventType.CHAT_STARTED, async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      result.push('async1');
    });

    eventSystem.on(EventType.CHAT_STARTED, async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
      result.push('async2');
    });

    eventSystem.emit(EventType.CHAT_STARTED, { timestamp: Date.now() });

    // 等待异步回调完成
    await new Promise(resolve => setTimeout(resolve, 30));

    expect(result).toContain('async1');
    expect(result).toContain('async2');
  });

  // 测试用例 UT-EV-005: 事件处理器错误
  it('should catch and handle errors in event listeners', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    eventSystem.on(EventType.CHAT_STARTED, () => {
      throw new Error('Test error');
    });

    expect(() => {
      eventSystem.emit(EventType.CHAT_STARTED, { timestamp: Date.now() });
    }).not.toThrow();

    // 等待异步事件处理完成
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // 测试用例 UT-EV-006: 事件参数传递
  it('should correctly pass parameters to event handlers', async () => {
    const listener = vi.fn();
    const eventData: EventData = {
      agentId: 'test-agent',
      sessionId: 'test-session',
      timestamp: Date.now(),
      metadata: { custom: 'value' },
    };

    eventSystem.on(EventType.CHAT_STARTED, listener);
    eventSystem.emit(EventType.CHAT_STARTED, eventData);

    // 等待异步事件处理完成
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(listener).toHaveBeenCalled();
    expect(listener.mock.calls[0][0]).toMatchObject(eventData);
  });

  // 测试用例 UT-EV-007: 监听器移除
  it('should correctly remove event listeners', async () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const id1 = eventSystem.on(EventType.CHAT_STARTED, listener1);
    const id2 = eventSystem.on(EventType.CHAT_STARTED, listener2);

    eventSystem.emit(EventType.CHAT_STARTED, { timestamp: Date.now() });

    // 等待异步事件处理完成
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();

    listener1.mockClear();
    listener2.mockClear();

    const removed = eventSystem.off(id1);

    expect(removed).toBe(true);

    eventSystem.emit(EventType.CHAT_STARTED, { timestamp: Date.now() });

    // 等待异步事件处理完成
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();

    const removedAgain = eventSystem.off(id1);

    expect(removedAgain).toBe(false); // 已经移除，返回false
  });

  // 测试同步事件触发功能
  it('should handle synchronous event emission with emitAsync', async () => {
    const events: string[] = [];

    eventSystem.on(EventType.AGENT_INITIALIZING, () => {
      events.push('initializing');
    });
    eventSystem.on(EventType.AGENT_INITIALIZED, () => {
      events.push('initialized');
    });

    await eventSystem.emitAsync(EventType.AGENT_INITIALIZING, {
      timestamp: Date.now(),
    });
    await eventSystem.emitAsync(EventType.AGENT_INITIALIZED, {
      timestamp: Date.now(),
    });

    expect(events).toEqual(['initializing', 'initialized']);
  });
});
