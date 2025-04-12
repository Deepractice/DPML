import { describe, expect, test, beforeEach, vi, afterEach } from 'vitest';
import { AbstractLLMConnector } from '../../src/connector/AbstractLLMConnector';
import { CompletionOptions, CompletionResult, CompletionChunk, LLMConnectorError, LLMErrorType } from '../../src/connector/LLMConnector';

/**
 * 模拟LLM连接器，用于性能测试
 */
class MockLLMConnector extends AbstractLLMConnector {
  private delay: number;
  private mockResponses: Map<string, CompletionResult> = new Map();
  private mockErrors: Map<string, Error> = new Map();
  private callCount: number = 0;
  
  constructor(delay: number = 100) {
    super('mock');
    this.delay = delay;
  }
  
  /**
   * 设置特定请求的模拟响应
   */
  setMockResponse(request: string, response: CompletionResult): void {
    this.mockResponses.set(request, response);
  }
  
  /**
   * 设置特定请求的模拟错误
   */
  setMockError(request: string, error: Error): void {
    this.mockErrors.set(request, error);
  }
  
  /**
   * 获取调用次数
   */
  getCallCount(): number {
    return this.callCount;
  }
  
  /**
   * 重置调用次数
   */
  resetCallCount(): void {
    this.callCount = 0;
  }
  
  /**
   * 设置模拟延迟
   */
  setDelay(delay: number): void {
    this.delay = delay;
  }
  
  async getSupportedModels(): Promise<string[]> {
    return ['gpt-3.5-turbo', 'gpt-4'];
  }
  
  async countTokens(text: string, model: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }
  
  protected async executeCompletion(
    options: CompletionOptions, 
    abortSignal: AbortSignal,
    requestId: string
  ): Promise<CompletionResult> {
    this.callCount++;
    
    // 检查中止信号
    if (abortSignal.aborted) {
      throw new LLMConnectorError('请求已中止', LLMErrorType.ABORTED);
    }
    
    // 生成请求键
    const requestKey = JSON.stringify(options.messages);
    
    // 检查是否有模拟错误
    if (this.mockErrors.has(requestKey)) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
      throw this.mockErrors.get(requestKey)!;
    }
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    // 检查中止信号
    if (abortSignal.aborted) {
      throw new LLMConnectorError('请求已中止', LLMErrorType.ABORTED);
    }
    
    // 返回模拟响应
    if (this.mockResponses.has(requestKey)) {
      return this.mockResponses.get(requestKey)!;
    }
    
    // 默认响应
    return {
      content: '这是模拟响应',
      model: options.model,
      usage: {
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15
      }
    };
  }
  
  protected async *executeCompletionStream(
    options: CompletionOptions,
    abortSignal: AbortSignal,
    requestId: string
  ): AsyncIterable<CompletionChunk> {
    this.callCount++;
    
    // 检查中止信号
    if (abortSignal.aborted) {
      throw new LLMConnectorError('请求已中止', LLMErrorType.ABORTED);
    }
    
    // 生成请求键
    const requestKey = JSON.stringify(options.messages);
    
    // 检查是否有模拟错误
    if (this.mockErrors.has(requestKey)) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
      throw this.mockErrors.get(requestKey)!;
    }
    
    // 模拟流式响应
    const response = this.mockResponses.has(requestKey) ? 
      this.mockResponses.get(requestKey)!.content : 
      '这是模拟流式响应';
    
    // 将响应分成多个块
    const chunks = response.split(' ');
    
    for (let i = 0; i < chunks.length; i++) {
      // 检查中止信号
      if (abortSignal.aborted) {
        throw new LLMConnectorError('请求已中止', LLMErrorType.ABORTED);
      }
      
      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, this.delay / chunks.length));
      
      // 生成块
      yield {
        content: chunks[i] + (i < chunks.length - 1 ? ' ' : ''),
        isLast: i === chunks.length - 1,
        model: options.model,
        requestId: requestId
      };
    }
  }
}

describe('LLM连接器性能测试', () => {
  let connector: MockLLMConnector;
  
  beforeEach(() => {
    connector = new MockLLMConnector(50);
    
    // 设置一些模拟响应
    connector.setMockResponse(JSON.stringify([
      { role: 'user', content: '你好' }
    ]), {
      content: '你好！有什么我可以帮助你的吗？',
      model: 'gpt-3.5-turbo',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      }
    });
    
    // 设置模拟错误
    connector.setMockError(JSON.stringify([
      { role: 'user', content: '触发错误' }
    ]), new LLMConnectorError('模拟错误', LLMErrorType.UNKNOWN));
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  test('缓存机制能够减少重复请求', async () => {
    const options: CompletionOptions = {
      messages: [{ role: 'user', content: '你好' }],
      model: 'gpt-3.5-turbo'
    };
    
    // 第一次请求
    const result1 = await connector.complete(options);
    expect(result1.content).toBe('你好！有什么我可以帮助你的吗？');
    expect(connector.getCallCount()).toBe(1);
    
    // 第二次相同请求（应该使用缓存）
    const result2 = await connector.complete(options);
    expect(result2.content).toBe('你好！有什么我可以帮助你的吗？');
    expect(connector.getCallCount()).toBe(1); // 调用次数不变
    
    // 不同请求
    const result3 = await connector.complete({
      messages: [{ role: 'user', content: '另一个请求' }],
      model: 'gpt-3.5-turbo'
    });
    expect(result3.content).toBe('这是模拟响应');
    expect(connector.getCallCount()).toBe(2);
    
    // 关闭缓存的请求
    const result4 = await connector.complete({
      ...options,
      useCache: false
    });
    expect(result4.content).toBe('你好！有什么我可以帮助你的吗？');
    expect(connector.getCallCount()).toBe(3);
  });
  
  test('缓存TTL过期后会重新发起请求', async () => {
    const options: CompletionOptions = {
      messages: [{ role: 'user', content: '你好' }],
      model: 'gpt-3.5-turbo'
    };
    
    // 第一次请求
    await connector.complete(options);
    expect(connector.getCallCount()).toBe(1);
    
    // 设置较短的缓存TTL
    connector.setCacheTTL(100);
    
    // 等待缓存过期
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 第二次相同请求（缓存应已过期）
    await connector.complete(options);
    expect(connector.getCallCount()).toBe(2);
  });
  
  test('并发控制能够限制同时请求数', async () => {
    // 设置最大并发请求数为2
    connector.setMaxConcurrentRequests(2);
    
    // 设置较长的延迟确保请求重叠
    connector.setDelay(300);
    
    // 创建5个不同的请求
    const requests = Array.from({ length: 5 }, (_, i) => ({
      messages: [{ role: 'user', content: `请求 ${i}` }],
      model: 'gpt-3.5-turbo'
    }));
    
    // 开始计时
    const startTime = Date.now();
    
    // 同时发起所有请求
    const results = await Promise.all(
      requests.map(req => connector.complete(req))
    );
    
    // 计算总耗时
    const totalTime = Date.now() - startTime;
    
    // 验证所有请求都成功完成
    expect(results.length).toBe(5);
    expect(connector.getCallCount()).toBe(5);
    
    // 理论上，5个请求分为3批执行（2+2+1），每批需要300ms
    // 考虑到测试环境和JS异步执行的不确定性，我们只做大致验证
    // 如果没有并发控制，所有请求应该在300ms左右完成
    // 有并发控制，应该在900ms左右
    expect(totalTime).toBeGreaterThan(600); // 至少需要执行3批
  });
  
  test('重试机制能够处理临时错误', async () => {
    // 创建一个会先失败然后成功的响应
    const requestKey = JSON.stringify([
      { role: 'user', content: '重试测试' }
    ]);
    
    // 跟踪调用次数
    let callCount = 0;
    
    // 模拟执行逻辑
    const originalExecute = connector.executeCompletion;
    connector.executeCompletion = vi.fn(async (options, signal, requestId) => {
      callCount++;
      if (JSON.stringify(options.messages) === requestKey && callCount <= 2) {
        throw new LLMConnectorError('临时错误', LLMErrorType.SERVER, {
          retryable: true,
          retryAfter: 50
        });
      }
      return {
        content: '重试成功',
        model: options.model,
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15
        }
      };
    }) as any;
    
    // 执行请求
    const result = await connector.complete({
      messages: [{ role: 'user', content: '重试测试' }],
      model: 'gpt-3.5-turbo',
      retry: {
        maxRetries: 3,
        initialDelay: 10,
        maxDelay: 100
      }
    });
    
    // 验证结果
    expect(result.content).toBe('重试成功');
    expect(callCount).toBe(3); // 前两次失败，第三次成功
    
    // 恢复原始实现
    connector.executeCompletion = originalExecute;
  });
  
  test('多个相同请求同时发起只会执行一次API调用并共享结果', async () => {
    const options: CompletionOptions = {
      messages: [{ role: 'user', content: '并发请求测试' }],
      model: 'gpt-3.5-turbo'
    };
    
    // 设置较长的延迟
    connector.setDelay(300);
    
    // 同时发起5个相同的请求
    const startTime = Date.now();
    const results = await Promise.all(
      Array(5).fill(null).map(() => connector.complete(options))
    );
    const totalTime = Date.now() - startTime;
    
    // 验证结果
    expect(results.length).toBe(5);
    expect(connector.getCallCount()).toBe(1); // 只应该有一次实际调用
    
    // 所有结果应该相同
    results.forEach(res => {
      expect(res.content).toBe('这是模拟响应');
    });
    
    // 总时间应该接近单个请求的时间
    expect(totalTime).toBeLessThan(400); // 单个请求时间300ms + 一些误差
  });
}); 