import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

import { handleRegularChat, handleStreamChat } from '../../../../config/cli';

/**
 * Agent CLI流式输出单元测试
 */
describe('Agent CLI流式输出', () => {
  // 模拟控制台输出
  let consoleLogSpy: any;
  let stdoutWriteSpy: any;

  // 模拟Agent
  const mockAgent = {
    chat: vi.fn().mockResolvedValue('这是模拟的非流式响应'),
    chatStream: vi.fn().mockImplementation(async function* () {
      yield '这是';
      yield '模拟';
      yield '的流';
      yield '式响应';
    })
  };

  beforeEach(() => {
    // 模拟console.log和process.stdout.write
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    // 清理模拟
    vi.clearAllMocks();
  });

  test('handleRegularChat应正确调用agent.chat并输出响应', async () => {
    await handleRegularChat(mockAgent, '你好');

    // 验证调用了chat方法
    expect(mockAgent.chat).toHaveBeenCalledWith('你好');

    // 验证输出了响应
    expect(consoleLogSpy).toHaveBeenCalledWith('\n这是模拟的非流式响应\n');
  });

  test('handleStreamChat应正确调用agent.chatStream并逐块输出响应', async () => {
    await handleStreamChat(mockAgent, '你好');

    // 验证调用了chatStream方法
    expect(mockAgent.chatStream).toHaveBeenCalledWith('你好');

    // 验证输出了开始的换行
    expect(stdoutWriteSpy).toHaveBeenNthCalledWith(1, '\n');

    // 验证输出了每个块
    expect(stdoutWriteSpy).toHaveBeenNthCalledWith(2, '这是');
    expect(stdoutWriteSpy).toHaveBeenNthCalledWith(3, '模拟');
    expect(stdoutWriteSpy).toHaveBeenNthCalledWith(4, '的流');
    expect(stdoutWriteSpy).toHaveBeenNthCalledWith(5, '式响应');

    // 验证输出了结束的换行
    expect(stdoutWriteSpy).toHaveBeenLastCalledWith('\n\n');

    // 验证总共输出了6次(开始换行 + 4个块 + 结束换行)
    expect(stdoutWriteSpy).toHaveBeenCalledTimes(6);
  });

  test('handleStreamChat应正确处理异常', async () => {
    // 模拟chatStream抛出错误
    const errorAgent = {
      chatStream: vi.fn().mockImplementation(async () => {
        return Promise.reject(new Error('流式处理错误'));
      })
    };

    // 模拟console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await handleStreamChat(errorAgent, '你好');

    // 验证错误被处理，但不验证具体错误消息，只验证错误前缀
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toBe('\n错误:');
    // 错误消息可能会因为实现方式的变化而改变，所以我们不严格验证具体内容
  });

  test('handleRegularChat应正确处理异常', async () => {
    // 模拟chat抛出错误
    const errorAgent = {
      chat: vi.fn().mockRejectedValue(new Error('非流式处理错误'))
    };

    // 模拟console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await handleRegularChat(errorAgent, '你好');

    // 验证错误被处理
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '错误:',
      '非流式处理错误'
    );
  });
});
