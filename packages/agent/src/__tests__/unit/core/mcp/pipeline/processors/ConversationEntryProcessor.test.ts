import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ConversationEntryProcessor } from '../../../../../../core/mcp/pipeline/processors/ConversationEntryProcessor';
import type { ToolCallContext } from '../../../../../../core/mcp/pipeline/ToolCallContext';
import { mockMessages } from '../../../../../fixtures/mcp.fixture';

describe('ConversationEntryProcessor', () => {
  // 模拟LLM客户端
  const mockLLMClient = {
    sendMessages: vi.fn().mockResolvedValue({
      content: {
        type: 'text',
        value: '我是AI助手，有什么可以帮助你的？'
      }
    })
  };

  let processor: ConversationEntryProcessor;

  beforeEach(() => {
    // 重置所有模拟函数
    vi.clearAllMocks();

    // 创建处理器实例
    processor = new ConversationEntryProcessor(mockLLMClient as any);
  });

  it('应该调用LLM并将响应添加到上下文', async () => {
    // 准备上下文
    const context: ToolCallContext = {
      messages: [...mockMessages],
      stream: false
    };

    // 执行处理
    const result = await processor.process(context);

    // 验证LLM客户端被调用
    expect(mockLLMClient.sendMessages).toHaveBeenCalledTimes(1);
    expect(mockLLMClient.sendMessages).toHaveBeenCalledWith(mockMessages, false);

    // 验证响应被正确添加到上下文
    expect(result.response).toEqual({
      content: {
        type: 'text',
        value: '我是AI助手，有什么可以帮助你的？'
      }
    });
  });

  it('在递归深度大于0时应跳过LLM调用', async () => {
    // 准备递归上下文
    const recursiveContext: ToolCallContext = {
      messages: [...mockMessages],
      stream: false,
      recursionDepth: 1,
      response: {
        content: {
          type: 'text',
          value: '已有的响应'
        }
      }
    };

    // 执行处理
    const result = await processor.process(recursiveContext);

    // 验证LLM客户端未被调用
    expect(mockLLMClient.sendMessages).not.toHaveBeenCalled();

    // 验证原有响应保持不变
    expect(result.response).toEqual(recursiveContext.response);
  });

  it('应该支持流式请求', async () => {
    // 准备流式上下文
    const streamContext: ToolCallContext = {
      messages: [...mockMessages],
      stream: true
    };

    // 执行处理
    await processor.process(streamContext);

    // 验证LLM客户端被以流式模式调用
    expect(mockLLMClient.sendMessages).toHaveBeenCalledWith(mockMessages, true);
  });

  it('在LLM调用失败时应抛出错误', async () => {
    // 设置模拟函数抛出错误
    mockLLMClient.sendMessages.mockRejectedValueOnce(new Error('LLM调用失败'));

    // 准备上下文
    const context: ToolCallContext = {
      messages: [...mockMessages],
      stream: false
    };

    // 验证处理抛出错误
    await expect(processor.process(context)).rejects.toThrow('LLM调用失败');
  });
});
