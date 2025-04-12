import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  AbstractLLMConnector, 
  CompletionOptions, 
  CompletionResult, 
  CompletionChunk,
  LLMErrorType,
  LLMConnectorError 
} from '../../../src/connector';

// 创建一个具体的连接器实现用于测试
class TestConnector extends AbstractLLMConnector {
  constructor() {
    super('test');
  }
  
  // 实现抽象方法
  async getSupportedModels(): Promise<string[]> {
    return ['test-model-1', 'test-model-2'];
  }
  
  async countTokens(text: string, model: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }
  
  protected async executeCompletion(
    options: CompletionOptions, 
    abortSignal: AbortSignal,
    requestId: string
  ): Promise<CompletionResult> {
    // 检查信号是否已中止
    if (abortSignal.aborted) {
      throw new Error('AbortError');
    }
    
    // 模拟API调用
    return {
      content: 'Test response',
      usage: {
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15
      },
      finishReason: 'stop',
      requestId,
      model: options.model
    };
  }
  
  protected async *executeCompletionStream(
    options: CompletionOptions,
    abortSignal: AbortSignal,
    requestId: string
  ): AsyncIterable<CompletionChunk> {
    // 检查信号是否已中止
    if (abortSignal.aborted) {
      throw new Error('AbortError');
    }
    
    // 模拟流式响应
    const chunks = ['This', ' is', ' a', ' test', ' response'];
    for (let i = 0; i < chunks.length; i++) {
      yield {
        content: chunks[i],
        isLast: i === chunks.length - 1,
        model: options.model,
        requestId,
        finishReason: i === chunks.length - 1 ? 'stop' : undefined
      };
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 检查是否中止
      if (abortSignal.aborted) {
        throw new Error('AbortError');
      }
    }
  }
}

describe('AbstractLLMConnector', () => {
  let connector: TestConnector;
  
  beforeEach(() => {
    connector = new TestConnector();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  describe('基础功能', () => {
    it('应返回正确的连接器类型', () => {
      expect(connector.getType()).toBe('test');
    });
    
    it('应验证模型是否受支持', async () => {
      expect(await connector.isModelSupported('test-model-1')).toBe(true);
      expect(await connector.isModelSupported('unsupported-model')).toBe(false);
    });
    
    it('应正确计算token数量', async () => {
      expect(await connector.countTokens('Hello world', 'test-model')).toBe(3); // 11/4 = 2.75, 向上取整为3
    });
  });
  
  describe('complete方法', () => {
    it('应处理成功响应', async () => {
      const options: CompletionOptions = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model'
      };
      
      const result = await connector.complete(options);
      
      expect(result.content).toBe('Test response');
      expect(result.usage.totalTokens).toBe(15);
      expect(result.model).toBe('test-model');
    });
    
    it('应处理中止请求', async () => {
      const options: CompletionOptions = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model'
      };
      
      // 设置执行抛出中止错误的模拟
      vi.spyOn(connector as any, 'executeCompletion').mockImplementationOnce(() => {
        throw new Error('AbortError');
      });
      
      try {
        await connector.complete(options);
        expect(true).toBe(false); // 不应该到达这里
      } catch (error) {
        expect(error).toBeInstanceOf(LLMConnectorError);
        expect((error as LLMConnectorError).type).toBe(LLMErrorType.ABORTED);
      }
    });
    
    it('应处理重试逻辑', async () => {
      const options: CompletionOptions = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model',
        retry: {
          maxRetries: 2,
          initialDelay: 100,
          maxDelay: 1000
        }
      };
      
      // 设置前两次抛出可重试错误，第三次成功
      const executeSpy = vi.spyOn(connector as any, 'executeCompletion');
      
      executeSpy.mockImplementationOnce(() => {
        throw new LLMConnectorError('Rate limit', LLMErrorType.RATE_LIMIT, { retryable: true });
      });
      
      executeSpy.mockImplementationOnce(() => {
        throw new LLMConnectorError('Server error', LLMErrorType.SERVER, { retryable: true });
      });
      
      executeSpy.mockImplementationOnce(() => {
        return {
          content: 'Success after retry',
          usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
          finishReason: 'stop',
          requestId: 'test-id',
          model: options.model
        };
      });
      
      // 使用异步计时器
      const result = connector.complete(options);
      
      // 快进第一次重试的延迟
      await vi.advanceTimersByTimeAsync(100);
      
      // 快进第二次重试的延迟
      await vi.advanceTimersByTimeAsync(200);
      
      // 等待结果
      const finalResult = await result;
      
      expect(executeSpy).toHaveBeenCalledTimes(3);
      expect(finalResult.content).toBe('Success after retry');
    });
  });
  
  describe('completeStream方法', () => {
    it('应处理流式响应', async () => {
      // 切换到真实计时器
      vi.useRealTimers();
      
      const options: CompletionOptions = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model'
      };
      
      const chunks: string[] = [];
      
      // 使用普通的流式处理方式
      for await (const chunk of connector.completeStream(options)) {
        chunks.push(chunk.content);
      }
      
      expect(chunks.join('')).toBe('This is a test response');
      
      // 测试后切回到假计时器
      vi.useFakeTimers();
    }, 10000); // 增加超时时间
    
    it('应处理中止请求', async () => {
      const options: CompletionOptions = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model'
      };
      
      // 设置执行抛出中止错误的模拟
      vi.spyOn(connector as any, 'executeCompletionStream').mockImplementationOnce(async function*() {
        throw new Error('AbortError');
      });
      
      try {
        // 获取迭代器并尝试读取第一个值
        const asyncIterator = connector.completeStream(options)[Symbol.asyncIterator]();
        await asyncIterator.next();
        expect(true).toBe(false); // 不应该到达这里
      } catch (error) {
        expect(error).toBeInstanceOf(LLMConnectorError);
        expect((error as LLMConnectorError).type).toBe(LLMErrorType.ABORTED);
      }
    });
  });
  
  describe('abortRequest方法', () => {
    it('应中止指定请求', async () => {
      // 使用延迟以允许请求ID生成
      const options: CompletionOptions = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model'
      };
      
      // 修改executeCompletion方法，使其在检测到取消信号时抛出错误
      vi.spyOn(connector as any, 'executeCompletion').mockImplementationOnce(
        async (opts: any, abortSignal: AbortSignal) => {
          // 返回一个永不完成的Promise，这样我们可以在它完成前取消它
          return new Promise((resolve, reject) => {
            // 添加取消监听器
            abortSignal.addEventListener('abort', () => {
              reject(new Error('AbortError'));
            });
            
            // 添加一个超时，以防测试卡住
            setTimeout(() => {
              resolve({
                content: 'This should not be returned',
                usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
                finishReason: 'stop',
                requestId: 'test-request',
                model: 'test-model'
              });
            }, 5000);
          });
        }
      );
      
      // 开始请求但不等待完成
      const promise = connector.complete(options);
      
      // 获取活跃请求ID
      const activeRequests = (connector as any).activeRequests;
      const requestId = [...activeRequests.keys()][0];
      
      // 中止请求
      await connector.abortRequest(requestId);
      
      // 验证请求被移除
      expect(activeRequests.has(requestId)).toBe(false);
      
      // 验证promise被拒绝并且抛出正确类型的错误
      await expect(promise).rejects.toThrow(LLMConnectorError);
      await expect(promise).rejects.toMatchObject({
        type: LLMErrorType.ABORTED
      });
    });
    
    it('应中止所有请求', async () => {
      // 修改executeCompletion方法，使其在检测到取消信号时抛出错误
      const executeSpy = vi.spyOn(connector as any, 'executeCompletion');
      
      executeSpy.mockImplementation(
        async (opts: any, abortSignal: AbortSignal) => {
          // 返回一个永不完成的Promise，这样我们可以在它完成前取消它
          return new Promise((resolve, reject) => {
            // 添加取消监听器
            abortSignal.addEventListener('abort', () => {
              reject(new Error('AbortError'));
            });
            
            // 添加一个超时，以防测试卡住
            setTimeout(() => {
              resolve({
                content: 'This should not be returned',
                usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
                finishReason: 'stop',
                requestId: 'test-request',
                model: 'test-model'
              });
            }, 5000);
          });
        }
      );
      
      // 启动多个请求
      const options1: CompletionOptions = {
        messages: [{ role: 'user', content: 'Hello 1' }],
        model: 'test-model'
      };
      
      const options2: CompletionOptions = {
        messages: [{ role: 'user', content: 'Hello 2' }],
        model: 'test-model'
      };
      
      // 开始请求但不等待完成
      const promise1 = connector.complete(options1);
      const promise2 = connector.complete(options2);
      
      // 获取活跃请求数量
      const activeRequests = (connector as any).activeRequests;
      expect(activeRequests.size).toBe(2);
      
      // 中止所有请求
      await connector.abortRequest();
      
      // 验证所有请求被移除
      expect(activeRequests.size).toBe(0);
      
      // 验证promise被拒绝并且抛出正确类型的错误
      await expect(promise1).rejects.toThrow(LLMConnectorError);
      await expect(promise1).rejects.toMatchObject({
        type: LLMErrorType.ABORTED
      });
      
      await expect(promise2).rejects.toThrow(LLMConnectorError);
      await expect(promise2).rejects.toMatchObject({
        type: LLMErrorType.ABORTED
      });
    });
  });
  
  describe('错误处理', () => {
    it('应正确规范化不同类型的错误', () => {
      // 测试标准Error对象
      const error1 = new Error('Standard error');
      const result1 = (connector as any).normalizeError(error1);
      expect(result1).toBeInstanceOf(LLMConnectorError);
      expect(result1.type).toBe(LLMErrorType.UNKNOWN);
      expect(result1.message).toBe('Standard error');
      
      // 测试中止错误
      const abortError = new Error('Operation aborted');
      abortError.name = 'AbortError';
      const result2 = (connector as any).normalizeError(abortError);
      expect(result2.type).toBe(LLMErrorType.ABORTED);
      
      // 测试超时错误
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      const result3 = (connector as any).normalizeError(timeoutError);
      expect(result3.type).toBe(LLMErrorType.TIMEOUT);
      expect(result3.retry?.retryable).toBe(true);
      
      // 测试网络错误
      const networkError = new Error('network error');
      const result4 = (connector as any).normalizeError(networkError);
      expect(result4.type).toBe(LLMErrorType.CONNECTION);
      expect(result4.retry?.retryable).toBe(true);
      
      // 测试字符串错误
      const result5 = (connector as any).normalizeError('String error');
      expect(result5.type).toBe(LLMErrorType.UNKNOWN);
      expect(result5.message).toBe('String error');
    });
    
    it('应正确识别可重试的错误类型', () => {
      // 可重试错误类型
      expect((connector as any).isRetryableError(
        new LLMConnectorError('Timeout', LLMErrorType.TIMEOUT)
      )).toBe(true);
      
      expect((connector as any).isRetryableError(
        new LLMConnectorError('Connection', LLMErrorType.CONNECTION)
      )).toBe(true);
      
      expect((connector as any).isRetryableError(
        new LLMConnectorError('Rate limit', LLMErrorType.RATE_LIMIT)
      )).toBe(true);
      
      expect((connector as any).isRetryableError(
        new LLMConnectorError('Server', LLMErrorType.SERVER)
      )).toBe(true);
      
      // 不可重试错误类型
      expect((connector as any).isRetryableError(
        new LLMConnectorError('Authentication', LLMErrorType.AUTHENTICATION)
      )).toBe(false);
      
      expect((connector as any).isRetryableError(
        new LLMConnectorError('Aborted', LLMErrorType.ABORTED)
      )).toBe(false);
      
      // 明确设置重试属性的错误
      expect((connector as any).isRetryableError(
        new LLMConnectorError('Custom', LLMErrorType.UNKNOWN, { retryable: true })
      )).toBe(true);
      
      expect((connector as any).isRetryableError(
        new LLMConnectorError('Custom', LLMErrorType.TIMEOUT, { retryable: false })
      )).toBe(false);
    });
  });
}); 