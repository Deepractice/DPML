import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ToolPreparationProcessor } from '../../../../../../core/mcp/pipeline/processors/ToolPreparationProcessor';
import type { ToolCallContext } from '../../../../../../core/mcp/pipeline/ToolCallContext';
import { mockTools } from '../../../../../fixtures/mcp.fixture';

describe('ToolPreparationProcessor', () => {
  // 模拟MCP客户端
  const mockClient = {
    getTools: vi.fn().mockResolvedValue(mockTools)
  };

  let processor: ToolPreparationProcessor;

  beforeEach(() => {
    // 重置所有模拟函数
    vi.clearAllMocks();

    // 创建处理器实例
    processor = new ToolPreparationProcessor(mockClient as any);
  });

  it('应该获取工具列表并添加到上下文', async () => {
    // 准备上下文
    const context: ToolCallContext = {
      messages: [
        { role: 'user', content: {
          type: 'text',
          value: '你好，请帮我搜索TypeScript相关信息'
        } }
      ],
      stream: false
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证工具获取函数被调用
    expect(mockClient.getTools).toHaveBeenCalledTimes(1);

    // 验证结果包含工具列表
    expect(result.tools).toEqual(mockTools);

    // 验证消息中添加了系统消息
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].role).toBe('system');

    // 验证内容是ContentItem对象，并且type是text
    expect(result.messages[0].content).toHaveProperty('type');
    expect(result.messages[0].content).toHaveProperty('value');
    expect((result.messages[0].content as any).type).toBe('text');

    // 验证内容值包含"可用工具"
    const contentValue = (result.messages[0].content as any).value;

    expect(typeof contentValue).toBe('string');
    expect(contentValue.includes('可用工具')).toBe(true);

    // 验证原始消息保留在最后
    expect(result.messages[1]).toEqual(context.messages[0]);
  });

  it('如果消息中已有工具描述，不应重复添加', async () => {
    // 准备带有系统消息的上下文
    const context: ToolCallContext = {
      messages: [
        {
          role: 'system',
          content: {
            type: 'text',
            value: '可用工具:\n\n工具名: search\n描述: 搜索互联网上的信息'
          }
        },
        {
          role: 'user',
          content: {
            type: 'text',
            value: '你好，请帮我搜索TypeScript相关信息'
          }
        }
      ],
      stream: false
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证工具获取函数被调用
    expect(mockClient.getTools).toHaveBeenCalledTimes(1);

    // 验证工具被添加到上下文
    expect(result.tools).toEqual(mockTools);

    // 验证没有添加新的系统消息
    expect(result.messages.length).toBe(2);
    expect(result.messages).toEqual(context.messages);
  });

  it('在工具获取失败时应保持上下文不变', async () => {
    // 设置模拟函数抛出错误
    mockClient.getTools.mockRejectedValueOnce(new Error('工具获取失败'));

    // 准备上下文
    const context: ToolCallContext = {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            value: '你好，请帮我搜索TypeScript相关信息'
          }
        }
      ],
      stream: false
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证工具获取函数被调用
    expect(mockClient.getTools).toHaveBeenCalledTimes(1);

    // 验证上下文保持不变（检查对象引用是否相同）
    expect(result).toBe(context);
  });
});
