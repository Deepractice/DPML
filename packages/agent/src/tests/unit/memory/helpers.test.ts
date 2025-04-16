import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  InMemoryAgentMemory,
  storeUserMessage,
  storeAssistantMessage,
  buildConversationContext,
} from '../../../memory';

describe('Memory Helpers', () => {
  // 测试会话ID
  const testSessionId = 'test-session-1';
  // 测试代理ID
  const testAgentId = 'test-agent-1';

  // 测试对象
  let memoryManager: InMemoryAgentMemory;

  // 测试前准备
  beforeEach(() => {
    // 创建内存记忆管理器
    memoryManager = new InMemoryAgentMemory({
      agentId: testAgentId,
    });
  });

  describe('storeUserMessage', () => {
    it('should add user message to empty memory (UT-MEM-007)', async () => {
      // 存储用户消息
      await storeUserMessage(memoryManager, testSessionId, 'Hello, agent!');

      // 检索记忆
      const memory = await memoryManager.retrieve(testSessionId);

      // 验证内容
      expect(memory.content).toHaveLength(1);
      const item = (memory.content as any[])[0];

      expect(item.text).toBe('Hello, agent!');
      expect(item.role).toBe('user');
      expect(item.timestamp).toBeGreaterThan(0);
    });

    it('should add user message to existing memory', async () => {
      // 先存储一条消息
      await storeUserMessage(memoryManager, testSessionId, 'First message');

      // 再存储另一条
      await storeUserMessage(memoryManager, testSessionId, 'Second message');

      // 检索记忆
      const memory = await memoryManager.retrieve(testSessionId);

      // 验证内容
      expect(memory.content).toHaveLength(2);
      expect((memory.content as any[])[0].text).toBe('First message');
      expect((memory.content as any[])[1].text).toBe('Second message');
    });
  });

  describe('storeAssistantMessage', () => {
    it('should add assistant message to empty memory', async () => {
      // 存储助手消息
      await storeAssistantMessage(
        memoryManager,
        testSessionId,
        'I can help you with that!'
      );

      // 检索记忆
      const memory = await memoryManager.retrieve(testSessionId);

      // 验证内容
      expect(memory.content).toHaveLength(1);
      const item = (memory.content as any[])[0];

      expect(item.text).toBe('I can help you with that!');
      expect(item.role).toBe('assistant');
      expect(item.timestamp).toBeGreaterThan(0);
    });

    it('should add assistant message after user message', async () => {
      // 先存储用户消息
      await storeUserMessage(memoryManager, testSessionId, 'Can you help me?');

      // 再存储助手消息
      await storeAssistantMessage(
        memoryManager,
        testSessionId,
        'Yes, I can help you!'
      );

      // 检索记忆
      const memory = await memoryManager.retrieve(testSessionId);

      // 验证内容
      expect(memory.content).toHaveLength(2);
      expect((memory.content as any[])[0].text).toBe('Can you help me?');
      expect((memory.content as any[])[0].role).toBe('user');
      expect((memory.content as any[])[1].text).toBe('Yes, I can help you!');
      expect((memory.content as any[])[1].role).toBe('assistant');
    });
  });

  describe('buildConversationContext', () => {
    it('should build context with only system prompt for empty memory (UT-MEM-007)', async () => {
      // 构建上下文
      const systemPrompt = 'You are a helpful assistant.';
      const context = await buildConversationContext(
        memoryManager,
        testSessionId,
        systemPrompt
      );

      // 验证内容
      expect(context).toHaveLength(1);
      expect(context[0].role).toBe('system');
      expect(context[0].content).toBe(systemPrompt);
    });

    it('should build context with system prompt and conversation history', async () => {
      // 存储一些消息
      await storeUserMessage(memoryManager, testSessionId, 'Hello');
      await storeAssistantMessage(memoryManager, testSessionId, 'Hi there!');
      await storeUserMessage(memoryManager, testSessionId, 'How are you?');

      // 构建上下文
      const systemPrompt = 'You are a helpful assistant.';
      const context = await buildConversationContext(
        memoryManager,
        testSessionId,
        systemPrompt
      );

      // 验证内容
      expect(context).toHaveLength(4);
      expect(context[0].role).toBe('system');
      expect(context[0].content).toBe(systemPrompt);
      expect(context[1].role).toBe('user');
      expect(context[1].content).toBe('Hello');
      expect(context[2].role).toBe('assistant');
      expect(context[2].content).toBe('Hi there!');
      expect(context[3].role).toBe('user');
      expect(context[3].content).toBe('How are you?');
    });
  });
});
