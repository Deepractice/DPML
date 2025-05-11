import { of, throwError } from 'rxjs';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

import { handleChat } from '../../../../config/cli';

/**
 * Agent CLI输出单元测试 - 已适配RxJS
 */
describe('Agent CLI输出', () => {
  // 模拟控制台输出
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let stdoutWriteSpy: any;

  // 模拟AgentSession ID
  const mockSessionId = 'test-session-id';

  // 模拟Agent（RxJS风格）
  const mockAgent = {
    chat: vi.fn().mockReturnValue(of({
      content: {
        type: 'text',
        value: '这是模拟的非流式响应'
      }
    })),
    createSession: vi.fn().mockReturnValue(mockSessionId)
  };

  // 模拟流式响应的Agent
  const mockStreamingAgent = {
    chat: vi.fn().mockReturnValue(of(
      { content: { type: 'text', value: '这是' } },
      { content: { type: 'text', value: '模拟' } },
      { content: { type: 'text', value: '的流' } },
      { content: { type: 'text', value: '式响应' } }
    )),
    createSession: vi.fn().mockReturnValue(mockSessionId)
  };

  beforeEach(() => {
    // 模拟console.log, console.error和process.stdout.write
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    // 清理模拟
    vi.clearAllMocks();
  });

  test('handleChat应在非流式模式下正确输出完整响应', async () => {
    await handleChat(mockAgent, mockSessionId, '你好', false);

    // 验证调用了chat方法
    expect(mockAgent.chat).toHaveBeenCalledWith(mockSessionId, '你好');

    // 验证输出了响应
    expect(consoleLogSpy).toHaveBeenCalledWith('\n这是模拟的非流式响应\n');
  });

  test('handleChat应在流式模式下逐块输出响应', async () => {
    await handleChat(mockStreamingAgent, mockSessionId, '你好', true);

    // 验证调用了chat方法
    expect(mockStreamingAgent.chat).toHaveBeenCalledWith(mockSessionId, '你好');

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

  test('handleChat应在流式模式下正确处理异常', async () => {
    // 创建一个返回正确错误Observable的mock
    const errorAgent = {
      chat: vi.fn().mockReturnValue(throwError(() => new Error('流式处理错误'))),
      createSession: vi.fn().mockReturnValue(mockSessionId)
    };

    // 使用try-catch包装以模拟实际使用场景
    try {
      await handleChat(errorAgent, mockSessionId, '你好', true);
    } catch (e) {
      // 不处理错误，handleChat应该已经捕获它了
    }

    // 验证错误被处理并输出
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '\n错误:',
      '流式处理错误'
    );
  });

  test('handleChat应在非流式模式下正确处理异常', async () => {
    // 模拟chat抛出错误（RxJS风格，但使用Promise.reject包装）
    const errorAgent = {
      chat: vi.fn().mockImplementation(() => {
        return {
          subscribe: () => {
            throw new Error('source.subscribe is not a function');
          }
        };
      }),
      createSession: vi.fn().mockReturnValue(mockSessionId)
    };

    await handleChat(errorAgent, mockSessionId, '你好', false);

    // 验证错误被处理
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '错误:',
      'source.subscribe is not a function'
    );
  });
});
