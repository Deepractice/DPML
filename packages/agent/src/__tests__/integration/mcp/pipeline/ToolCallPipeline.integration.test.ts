/**
 * ToolCallPipeline集成测试
 *
 * 测试处理器责任链的完整流程
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { ConversationEntryProcessor } from '../../../../core/mcp/pipeline/processors/ConversationEntryProcessor';
import { RecursiveProcessor } from '../../../../core/mcp/pipeline/processors/RecursiveProcessor';
import { ResultFormattingProcessor } from '../../../../core/mcp/pipeline/processors/ResultFormattingProcessor';
import { StartSideBandProcessor } from '../../../../core/mcp/pipeline/processors/StartSideBandProcessor';
import { ToolCallExtractorProcessor } from '../../../../core/mcp/pipeline/processors/ToolCallExtractorProcessor';
import { ToolExecutionProcessor } from '../../../../core/mcp/pipeline/processors/ToolExecutionProcessor';
import { ToolPreparationProcessor } from '../../../../core/mcp/pipeline/processors/ToolPreparationProcessor';
import type { ToolCallContext } from '../../../../core/mcp/pipeline/ToolCallContext';
import { ToolCallPipeline } from '../../../../core/mcp/pipeline/ToolCallPipeline';
import { MockLLMClient } from '../../../fixtures/mcp/MockLLMClient';
import { MockMcpClient } from '../../../fixtures/mcp/MockMcpClient';
import { mockMessages, mockToolCalls } from '../../../fixtures/mcp.fixture';

describe('ToolCallPipeline集成测试', () => {
  // 测试依赖
  let mockMcpClient: MockMcpClient;
  let mockLlmClient: MockLLMClient;
  let pipeline: ToolCallPipeline;

  // 处理器实例
  let toolPrep: ToolPreparationProcessor;
  let convEntry: ConversationEntryProcessor;
  let sideBand: StartSideBandProcessor;
  let extractor: ToolCallExtractorProcessor;
  let executor: ToolExecutionProcessor;
  let formatter: ResultFormattingProcessor;
  let recursive: RecursiveProcessor;

  // 上下文对象
  let context: ToolCallContext;

  beforeEach(() => {
    // 创建模拟客户端
    mockMcpClient = new MockMcpClient();
    mockLlmClient = new MockLLMClient();

    // 创建处理器
    toolPrep = new ToolPreparationProcessor(mockMcpClient as any);
    convEntry = new ConversationEntryProcessor(mockLlmClient as any);
    sideBand = new StartSideBandProcessor();
    extractor = new ToolCallExtractorProcessor();
    executor = new ToolExecutionProcessor(mockMcpClient as any);
    formatter = new ResultFormattingProcessor();

    // 创建管道
    pipeline = new ToolCallPipeline();

    // 添加处理器到管道
    pipeline
      .addProcessor(toolPrep)
      .addProcessor(convEntry)
      .addProcessor(sideBand)
      .addProcessor(extractor)
      .addProcessor(executor)
      .addProcessor(formatter);

    // 创建递归处理器并添加到管道
    recursive = new RecursiveProcessor(pipeline);
    pipeline.addProcessor(recursive);

    // 创建上下文对象
    context = {
      messages: [...mockMessages],
      stream: false
    };

    // 设置监视
    vi.spyOn(toolPrep, 'process');
    vi.spyOn(convEntry, 'process');
    vi.spyOn(sideBand, 'process');
    vi.spyOn(extractor, 'process');
    vi.spyOn(executor, 'process');
    vi.spyOn(formatter, 'process');
    vi.spyOn(recursive, 'process');
    vi.spyOn(mockMcpClient, 'listTools');
    vi.spyOn(mockMcpClient, 'callTool');
    vi.spyOn(mockLlmClient, 'sendMessages');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('处理器链应按顺序执行所有处理器', async () => {
    // 执行管道
    await pipeline.execute(context);

    // 验证处理器调用顺序
    expect(toolPrep.process).toHaveBeenCalledWith(expect.anything());
    expect(convEntry.process).toHaveBeenCalledWith(expect.anything());
    expect(sideBand.process).toHaveBeenCalledWith(expect.anything());
    expect(extractor.process).toHaveBeenCalledWith(expect.anything());
    expect(executor.process).toHaveBeenCalledWith(expect.anything());
    expect(formatter.process).toHaveBeenCalledWith(expect.anything());
    expect(recursive.process).toHaveBeenCalledWith(expect.anything());

    // 验证调用顺序
    expect(toolPrep.process).toHaveBeenCalledBefore(convEntry.process);
    expect(convEntry.process).toHaveBeenCalledBefore(sideBand.process);
    expect(sideBand.process).toHaveBeenCalledBefore(extractor.process);
    expect(extractor.process).toHaveBeenCalledBefore(executor.process);
    expect(executor.process).toHaveBeenCalledBefore(formatter.process);
    expect(formatter.process).toHaveBeenCalledBefore(recursive.process);
  });

  test('处理器链应正确处理工具调用场景', async () => {
    // 设置模拟LLM返回工具调用
    const llmClientWithToolCall = new MockLLMClient({
      includeToolCall: true,
      toolName: 'search',
      toolParams: { query: 'TypeScript' }
    });

    // 监视sendMessages方法，以验证它被调用
    vi.spyOn(llmClientWithToolCall, 'sendMessages');

    // 更新ConversationEntryProcessor使用新的模拟LLM客户端
    convEntry = new ConversationEntryProcessor(llmClientWithToolCall as any);
    vi.spyOn(convEntry, 'process');

    // 重建管道
    pipeline = new ToolCallPipeline();
    pipeline
      .addProcessor(toolPrep)
      .addProcessor(convEntry)
      .addProcessor(sideBand)
      .addProcessor(extractor)
      .addProcessor(executor)
      .addProcessor(formatter)
      .addProcessor(recursive);

    // 执行管道
    const result = await pipeline.execute(context);

    // 验证工具调用过程
    expect(llmClientWithToolCall.sendMessages).toHaveBeenCalled();
    expect(extractor.process).toHaveBeenCalled();
    expect(result.toolCalls).toBeDefined();
    expect(mockMcpClient.callTool).toHaveBeenCalled();
    expect(result.results).toBeDefined();
  });

  test('处理器链应正确处理无工具调用场景', async () => {
    // 设置模拟LLM不返回工具调用
    const llmClientWithoutToolCall = new MockLLMClient({
      includeToolCall: false
    });

    // 监视sendMessages方法，以验证它被调用
    vi.spyOn(llmClientWithoutToolCall, 'sendMessages');

    // 更新ConversationEntryProcessor
    convEntry = new ConversationEntryProcessor(llmClientWithoutToolCall as any);
    vi.spyOn(convEntry, 'process');

    // 重建管道
    pipeline = new ToolCallPipeline();
    pipeline
      .addProcessor(toolPrep)
      .addProcessor(convEntry)
      .addProcessor(sideBand)
      .addProcessor(extractor)
      .addProcessor(executor)
      .addProcessor(formatter)
      .addProcessor(recursive);

    // 执行管道
    const result = await pipeline.execute(context);

    // 验证无工具调用过程
    expect(llmClientWithoutToolCall.sendMessages).toHaveBeenCalled();
    expect(extractor.process).toHaveBeenCalled();
    expect(result.toolCalls).toEqual([]);
    expect(mockMcpClient.callTool).not.toHaveBeenCalled();
  });

  test('处理器链应正确处理流式输出场景', async () => {
    // 设置流式输出
    context.stream = true;

    // 设置模拟LLM返回工具调用
    const llmClientWithStream = new MockLLMClient({
      includeToolCall: true,
      toolName: 'search',
      toolParams: { query: 'TypeScript' }
    });

    // 监视sendMessages方法
    vi.spyOn(llmClientWithStream, 'sendMessages');

    // 更新ConversationEntryProcessor
    convEntry = new ConversationEntryProcessor(llmClientWithStream as any);
    vi.spyOn(convEntry, 'process');

    // 监视SideBandProcessor的私有方法
    const asyncIterableToReadableStreamSpy = vi.spyOn(sideBand as any, 'asyncIterableToReadableStream');

    // 重建管道
    pipeline = new ToolCallPipeline();
    pipeline
      .addProcessor(toolPrep)
      .addProcessor(convEntry)
      .addProcessor(sideBand)
      .addProcessor(extractor)
      .addProcessor(executor)
      .addProcessor(formatter)
      .addProcessor(recursive);

    // 执行管道
    await pipeline.execute(context);

    // 验证流式处理
    expect(llmClientWithStream.sendMessages).toHaveBeenCalledWith(expect.anything(), true);
    expect(sideBand.process).toHaveBeenCalled();
    expect(asyncIterableToReadableStreamSpy).toHaveBeenCalled();
  });

  test('处理器链应正确处理多轮工具调用', async () => {
    // 设置递归处理监视
    const originalRecursiveProcess = recursive.process;
    let recursionCount = 0;

    vi.spyOn(recursive, 'process').mockImplementation(async (ctx) => {
      recursionCount++;
      if (recursionCount === 1) {
        // 第一次调用时，添加工具结果并继续递归
        const newCtx = {
          ...ctx,
          results: [{
            toolCall: mockToolCalls[0],
            status: 'success',
            result: '搜索结果'
          }]
        };

        return originalRecursiveProcess.call(recursive, newCtx);
      } else {
        // 第二次调用时，正常返回
        return originalRecursiveProcess.call(recursive, ctx);
      }
    });

    // 执行管道
    await pipeline.execute(context);

    // 验证递归处理
    expect(recursive.process).toHaveBeenCalledTimes(2);
    expect(recursionCount).toBe(2);
  });
});
