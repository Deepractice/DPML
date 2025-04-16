import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sleep,
  waitForCondition,
  withTimeout,
  retry,
  parallel,
  serial,
  createCancellablePromise,
  waitForEvent
} from '../../../src/testing/async';

describe('异步测试工具', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('sleep', () => {
    it('应该在指定时间后解决', async () => {
      const promise = sleep(1000);
      
      vi.advanceTimersByTime(999);
      expect(await Promise.race([promise, Promise.resolve('not-resolved')])).toBe('not-resolved');
      
      vi.advanceTimersByTime(1);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('waitForCondition', () => {
    it('当条件立即满足时应该立即解决', async () => {
      const condition = vi.fn().mockReturnValue(true);
      
      await waitForCondition(condition);
      
      expect(condition).toHaveBeenCalledTimes(1);
    });

    it('应该定期检查条件直到满足', async () => {
      const condition = vi.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      
      const promise = waitForCondition(condition, { interval: 100 });
      
      vi.advanceTimersByTime(200);
      await promise;
      
      expect(condition).toHaveBeenCalledTimes(3);
    });

    it('当超时时应该抛出错误', async () => {
      const condition = vi.fn().mockReturnValue(false);
      
      const promise = waitForCondition(condition, { 
        timeout: 500, 
        interval: 100,
        timeoutMessage: '自定义超时消息'
      });
      
      vi.advanceTimersByTime(500);
      
      await expect(promise).rejects.toThrow('自定义超时消息');
      expect(condition).toHaveBeenCalled();
    });
  });

  describe('withTimeout', () => {
    it('应该在原始Promise解决前解决', async () => {
      const originalPromise = new Promise<string>(resolve => {
        setTimeout(() => resolve('success'), 100);
      });
      
      const promise = withTimeout(originalPromise, 500);
      
      vi.advanceTimersByTime(100);
      await expect(promise).resolves.toBe('success');
    });

    it('当Promise超时时应该拒绝', async () => {
      const originalPromise = new Promise<string>(resolve => {
        setTimeout(() => resolve('success'), 1000);
      });
      
      const promise = withTimeout(originalPromise, 500, '自定义超时消息');
      
      vi.advanceTimersByTime(500);
      await expect(promise).rejects.toThrow('自定义超时消息');
    });
  });

  describe('retry', () => {
    it('成功时应该直接返回结果', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await retry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('失败时应该重试到指定次数', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('失败1'))
        .mockRejectedValueOnce(new Error('失败2'))
        .mockResolvedValueOnce('success');
      
      const onRetry = vi.fn();
      
      const result = await retry(fn, { 
        maxAttempts: 3, 
        delay: 100,
        onRetry
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1);
      expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2);
    });

    it('超过最大尝试次数时应该抛出最后的错误', async () => {
      const finalError = new Error('最终错误');
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('错误1'))
        .mockRejectedValueOnce(new Error('错误2'))
        .mockRejectedValueOnce(finalError);
      
      await expect(retry(fn, { maxAttempts: 3 })).rejects.toThrow(finalError);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('backoff参数应该增加重试间隔', async () => {
      vi.useRealTimers();
      const start = Date.now();
      
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('错误1'))
        .mockRejectedValueOnce(new Error('错误2'))
        .mockResolvedValueOnce('success');
      
      await retry(fn, { 
        maxAttempts: 3, 
        delay: 10,
        backoff: true
      });
      
      const duration = Date.now() - start;
      // 第一次重试延迟10ms，第二次重试延迟20ms
      expect(duration).toBeGreaterThanOrEqual(25);
    });
  });

  describe('parallel', () => {
    it('应该并行执行所有函数', async () => {
      const fn1 = vi.fn().mockResolvedValue('result1');
      const fn2 = vi.fn().mockResolvedValue('result2');
      const fn3 = vi.fn().mockResolvedValue('result3');
      
      const result = await parallel([fn1, fn2, fn3]);
      
      expect(result.successes).toEqual(['result1', 'result2', 'result3']);
      expect(result.errors).toEqual([]);
      expect(result.allSucceeded).toBe(true);
      expect(result.someSucceeded).toBe(true);
    });

    it('应该收集成功和失败的结果', async () => {
      const fn1 = vi.fn().mockResolvedValue('result1');
      const fn2 = vi.fn().mockRejectedValue(new Error('错误2'));
      const fn3 = vi.fn().mockResolvedValue('result3');
      
      const result = await parallel([fn1, fn2, fn3]);
      
      expect(result.successes).toEqual(['result1', 'result3']);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toBe('错误2');
      expect(result.allSucceeded).toBe(false);
      expect(result.someSucceeded).toBe(true);
    });

    it('所有函数失败时应该返回正确的结果', async () => {
      const fn1 = vi.fn().mockRejectedValue(new Error('错误1'));
      const fn2 = vi.fn().mockRejectedValue(new Error('错误2'));
      
      const result = await parallel([fn1, fn2]);
      
      expect(result.successes).toEqual([]);
      expect(result.errors.length).toBe(2);
      expect(result.allSucceeded).toBe(false);
      expect(result.someSucceeded).toBe(false);
    });
  });

  describe('serial', () => {
    it('应该按顺序执行所有函数', async () => {
      const sequence: number[] = [];
      
      const fn1 = vi.fn().mockImplementation(async () => {
        sequence.push(1);
        return 'result1';
      });
      
      const fn2 = vi.fn().mockImplementation(async () => {
        sequence.push(2);
        return 'result2';
      });
      
      const fn3 = vi.fn().mockImplementation(async () => {
        sequence.push(3);
        return 'result3';
      });
      
      const results = await serial([fn1, fn2, fn3]);
      
      expect(results).toEqual(['result1', 'result2', 'result3']);
      expect(sequence).toEqual([1, 2, 3]);
    });

    it('当函数抛出错误时应该中断执行', async () => {
      const fn1 = vi.fn().mockResolvedValue('result1');
      const fn2 = vi.fn().mockRejectedValue(new Error('错误'));
      const fn3 = vi.fn();
      
      await expect(serial([fn1, fn2, fn3])).rejects.toThrow('错误');
      
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalled();
      expect(fn3).not.toHaveBeenCalled();
    });
  });

  describe('createCancellablePromise', () => {
    it('应该正常解决Promise', async () => {
      const { promise } = createCancellablePromise((resolve) => {
        setTimeout(() => resolve('success'), 100);
      });
      
      vi.advanceTimersByTime(100);
      await expect(promise).resolves.toBe('success');
    });

    it('取消后应该拒绝Promise', async () => {
      let cancelHandlerCalled = false;
      
      const { promise, cancel } = createCancellablePromise((resolve, reject, onCancel) => {
        const timer = setTimeout(() => resolve('success'), 100);
        
        onCancel(() => {
          cancelHandlerCalled = true;
          clearTimeout(timer);
        });
      });
      
      cancel();
      
      // 使用try/catch是因为取消的Promise会被拒绝
      try {
        await promise;
        expect.fail('Promise应该被拒绝');
      } catch (error) {
        expect((error as Error).message).toBe('Promise已被取消');
        expect(cancelHandlerCalled).toBe(true);
      }
    });
  });

  describe('waitForEvent', () => {
    it('应该等待事件触发', async () => {
      // 创建模拟事件发射器
      const emitter = {
        handlers: {} as Record<string, Array<(data: any) => void>>,
        on(event: string, handler: (data: any) => void) {
          if (!this.handlers[event]) {
            this.handlers[event] = [];
          }
          this.handlers[event].push(handler);
        },
        off(event: string, handler: (data: any) => void) {
          if (this.handlers[event]) {
            this.handlers[event] = this.handlers[event].filter(h => h !== handler);
          }
        },
        emit(event: string, data: any) {
          if (this.handlers[event]) {
            this.handlers[event].forEach(handler => handler(data));
          }
        }
      };
      
      const eventPromise = waitForEvent<{value: string}, typeof emitter>(emitter, 'test-event');
      
      // 触发事件
      emitter.emit('test-event', { value: 'event-data' });
      
      await expect(eventPromise).resolves.toEqual({ value: 'event-data' });
    });

    it('使用过滤器时应该只响应匹配的事件', async () => {
      // 创建模拟事件发射器
      const emitter = {
        handlers: {} as Record<string, Array<(data: any) => void>>,
        on(event: string, handler: (data: any) => void) {
          if (!this.handlers[event]) {
            this.handlers[event] = [];
          }
          this.handlers[event].push(handler);
        },
        off(event: string, handler: (data: any) => void) {
          if (this.handlers[event]) {
            this.handlers[event] = this.handlers[event].filter(h => h !== handler);
          }
        },
        emit(event: string, data: any) {
          if (this.handlers[event]) {
            this.handlers[event].forEach(handler => handler(data));
          }
        }
      };
      
      const eventPromise = waitForEvent<{id: number}, typeof emitter>(emitter, 'test-event', {
        filter: (data) => data.id === 2
      });
      
      // 触发不匹配的事件
      emitter.emit('test-event', { id: 1 });
      
      // 触发匹配的事件
      emitter.emit('test-event', { id: 2 });
      
      await expect(eventPromise).resolves.toEqual({ id: 2 });
    });

    it('超时时应该拒绝Promise', async () => {
      // 创建模拟事件发射器
      const emitter = {
        handlers: {} as Record<string, Array<(data: any) => void>>,
        on(event: string, handler: (data: any) => void) {
          if (!this.handlers[event]) {
            this.handlers[event] = [];
          }
          this.handlers[event].push(handler);
        },
        off(event: string, handler: (data: any) => void) {
          if (this.handlers[event]) {
            this.handlers[event] = this.handlers[event].filter(h => h !== handler);
          }
        }
      };
      
      const eventPromise = waitForEvent<unknown, typeof emitter>(emitter, 'test-event', {
        timeout: 500,
        timeoutMessage: '等待事件超时'
      });
      
      vi.advanceTimersByTime(500);
      
      await expect(eventPromise).rejects.toThrow('等待事件超时');
    });
  });
}); 