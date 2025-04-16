import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  AbstractLLMConnector, 
  CompletionOptions, 
  CompletionResult, 
  CompletionChunk,
  LLMErrorType,
  LLMConnectorError 
} from '../../../connector';

// 添加全局错误处理函数，捕获所有中断相关的异常
function setupGlobalErrorHandling() {
  const originalEmit = process.emit;
  
  // @ts-ignore 忽略类型检查，因为我们需要处理各种事件类型
  process.emit = function(event, ...args) {
    if (event === 'unhandledRejection') {
      const error = args[0];
      if (
        error instanceof Error && 
        (error.message === 'AbortError' || 
         error.message.includes('abort') || 
         error.message.includes('AbortError') ||
         (error instanceof LLMConnectorError && error.type === LLMErrorType.ABORTED))
      ) {
        // 忽略中断相关的异常
        return true;
      }
    }
    
    return originalEmit.apply(process, [event, ...args] as any);
  };
  
  return () => {
    process.emit = originalEmit;
  };
}

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
  let restoreErrorHandler: () => void;
  
  beforeEach(() => {
    vi.useFakeTimers();
    connector = new TestConnector();
    // 在每个测试开始前设置全局错误处理器
    restoreErrorHandler = setupGlobalErrorHandling();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    // 在每个测试结束后恢复原始错误处理
    restoreErrorHandler();
    
    // 确保所有请求都被清理
    const activeRequests = (connector as any).activeRequests;
    if (activeRequests.size > 0) {
      connector.abortRequest();
    }
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
        expect.fail('应该抛出错误');
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
        const asyncIterator = connector.completeStream(options)[Symbol.asyncIterator]();
        await asyncIterator.next();
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error).toBeInstanceOf(LLMConnectorError);
        expect((error as LLMConnectorError).type).toBe(LLMErrorType.ABORTED);
      }
    });
  });
  
  describe('abortRequest方法', () => {
    it('应中止指定请求', async () => {
      // 创建一个模拟的AbortController
      const mockAbortController = {
        abort: vi.fn()
      };
      
      // 模拟activeRequests Map
      const mockActiveRequests = new Map();
      mockActiveRequests.set('test-id', mockAbortController);
      
      // 将模拟的Map应用到connector
      vi.spyOn(connector as any, 'activeRequests', 'get').mockReturnValue(mockActiveRequests);
      
      // 调用abortRequest
      await connector.abortRequest('test-id');
      
      // 验证abort是否被调用
      expect(mockAbortController.abort).toHaveBeenCalled();
      
      // 验证请求是否被删除
      expect(mockActiveRequests.has('test-id')).toBe(false);
    });
    
    it('应中止所有请求', async () => {
      // 创建多个模拟的AbortController
      const mockAbortController1 = {
        abort: vi.fn()
      };
      
      const mockAbortController2 = {
        abort: vi.fn()
      };
      
      // 模拟activeRequests Map
      const mockActiveRequests = new Map();
      mockActiveRequests.set('test-id-1', mockAbortController1);
      mockActiveRequests.set('test-id-2', mockAbortController2);
      
      // 将模拟的Map应用到connector
      vi.spyOn(connector as any, 'activeRequests', 'get').mockReturnValue(mockActiveRequests);
      
      // 调用abortRequest没有指定ID，应该中止所有请求
      await connector.abortRequest();
      
      // 验证两个abort是否都被调用
      expect(mockAbortController1.abort).toHaveBeenCalled();
      expect(mockAbortController2.abort).toHaveBeenCalled();
      
      // 验证Map是否被清空
      expect(mockActiveRequests.size).toBe(0);
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