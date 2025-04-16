// 导出类型定义
export * from './types';

// 导出内存实现
export * from './InMemoryAgentMemory';

// 导出文件系统实现
export * from './FileSystemAgentMemory';

// 导出工厂
export * from './AgentMemoryFactory';

// 导出辅助函数

/**
 * 存储用户消息到记忆
 * @param agentMemory 记忆存储
 * @param sessionId 会话ID
 * @param text 消息文本
 */
export async function storeUserMessage(
  agentMemory: import('./types').AgentMemory,
  sessionId: string,
  text: string
): Promise<void> {
  // 获取现有记忆
  const memory = await agentMemory.retrieve(sessionId);

  // 确保content是数组
  const items = Array.isArray(memory.content) ? memory.content : [];

  // 添加新的记忆项
  items.push({
    text,
    role: 'user',
    timestamp: Date.now(),
  });

  // 更新并存储记忆
  memory.content = items;
  await agentMemory.store(memory);
}

/**
 * 存储助手消息到记忆
 * @param agentMemory 记忆存储
 * @param sessionId 会话ID
 * @param text 消息文本
 */
export async function storeAssistantMessage(
  agentMemory: import('./types').AgentMemory,
  sessionId: string,
  text: string
): Promise<void> {
  // 获取现有记忆
  const memory = await agentMemory.retrieve(sessionId);

  // 确保content是数组
  const items = Array.isArray(memory.content) ? memory.content : [];

  // 添加新的记忆项
  items.push({
    text,
    role: 'assistant',
    timestamp: Date.now(),
  });

  // 更新并存储记忆
  memory.content = items;
  await agentMemory.store(memory);
}

/**
 * 构建LLM对话上下文
 * @param agentMemory 记忆存储
 * @param sessionId 会话ID
 * @param systemPrompt 系统提示词
 * @returns 消息数组
 */
export async function buildConversationContext(
  agentMemory: import('./types').AgentMemory,
  sessionId: string,
  systemPrompt: string
): Promise<Array<{ role: string; content: string }>> {
  // 获取会话记忆
  const memory = await agentMemory.retrieve(sessionId);

  // 确保content是数组
  const items = Array.isArray(memory.content) ? memory.content : [];

  // 构建消息数组，首先添加系统提示
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // 添加对话历史
  for (const item of items) {
    messages.push({
      role: item.role,
      content: item.text,
    });
  }

  return messages;
}
