import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, withTestEnvironment } from '../../../src/testing/environment';

describe('测试环境管理工具', () => {
  describe('基本环境功能', () => {
    it('应该创建一个带有默认值的测试环境', () => {
      const env = createTestEnvironment({ name: 'test' });
      expect(env.config.name).toBe('test');
      expect(env.config.mockTime).toBe(false);
      expect(env.config.isolateGlobals).toBe(false);
      expect(env.config.env).toEqual({});
    });

    it('应该接受自定义配置', () => {
      const env = createTestEnvironment({
        name: 'custom',
        mockTime: true,
        isolateGlobals: true,
        env: { TEST_VAR: 'value' }
      });

      expect(env.config.name).toBe('custom');
      expect(env.config.mockTime).toBe(true);
      expect(env.config.isolateGlobals).toBe(true);
      expect(env.config.env).toEqual({ TEST_VAR: 'value' });
    });
  });

  describe('环境变量管理', () => {
    let originalEnv: Record<string, string | undefined>;
    
    beforeEach(() => {
      originalEnv = {
        TEST_VAR1: process.env.TEST_VAR1,
        TEST_VAR2: process.env.TEST_VAR2
      };
    });
    
    afterEach(() => {
      process.env.TEST_VAR1 = originalEnv.TEST_VAR1;
      process.env.TEST_VAR2 = originalEnv.TEST_VAR2;
    });

    it('setup应该设置环境变量', async () => {
      const env = createTestEnvironment({
        name: 'env-test',
        env: {
          TEST_VAR1: 'value1',
          TEST_VAR2: 'value2'
        }
      });

      await env.setup();
      
      expect(process.env.TEST_VAR1).toBe('value1');
      expect(process.env.TEST_VAR2).toBe('value2');
      
      await env.teardown();
    });

    it('teardown应该恢复环境变量', async () => {
      process.env.TEST_VAR1 = 'original1';
      delete process.env.TEST_VAR2;

      const env = createTestEnvironment({
        name: 'env-test',
        env: {
          TEST_VAR1: 'value1',
          TEST_VAR2: 'value2'
        }
      });

      await env.setup();
      await env.teardown();
      
      expect(process.env.TEST_VAR1).toBe('original1');
      expect(process.env.TEST_VAR2).toBeUndefined();
    });

    it('getEnv应该返回环境变量值', async () => {
      const env = createTestEnvironment({
        name: 'env-test',
        env: { TEST_VAR: 'value' }
      });

      await env.setup();
      
      expect(env.getEnv('TEST_VAR')).toBe('value');
      
      await env.teardown();
    });

    it('setEnv应该设置新的环境变量', async () => {
      const env = createTestEnvironment({
        name: 'env-test'
      });

      await env.setup();
      
      env.setEnv('DYNAMIC_VAR', 'dynamic-value');
      expect(process.env.DYNAMIC_VAR).toBe('dynamic-value');
      
      await env.teardown();
      expect(process.env.DYNAMIC_VAR).toBeUndefined();
    });
  });

  describe('模拟时间功能', () => {
    it('默认情况下模拟时间应该未启用', () => {
      const env = createTestEnvironment({ name: 'time-test' });
      expect(env.getCurrentTime()).toBeNull();
      expect(() => env.setCurrentTime(new Date())).toThrow('模拟时间未启用');
      expect(() => env.advanceTimeBy(1000)).toThrow('模拟时间未启用');
    });

    it('启用模拟时间后应该能控制时间', async () => {
      const env = createTestEnvironment({
        name: 'time-test',
        mockTime: true
      });

      await env.setup();
      
      // 获取当前模拟时间
      const current = env.getCurrentTime();
      expect(current).not.toBeNull();
      
      // 设置特定时间
      const testDate = new Date('2023-01-01T00:00:00Z');
      env.setCurrentTime(testDate);
      expect(env.getCurrentTime()?.getTime()).toBe(testDate.getTime());
      
      // 前进时间
      env.advanceTimeBy(5000);
      expect(env.getCurrentTime()?.getTime()).toBe(testDate.getTime() + 5000);
      
      // 确保Date.now()使用模拟时间
      expect(Date.now()).toBe(env.getCurrentTime()?.getTime());
      
      await env.teardown();
    });

    it('teardown后应该恢复真实时间', async () => {
      // 存储原始的Date和Date.now实现
      const originalDate = global.Date;
      const originalNow = Date.now;
      
      const env = createTestEnvironment({
        name: 'time-test',
        mockTime: true
      });

      await env.setup();
      expect(Date.now).not.toBe(originalNow);
      
      await env.teardown();
      expect(global.Date).toBe(originalDate);
      expect(Date.now).toBe(originalNow);
    });
  });

  describe('withTestEnvironment', () => {
    it('应该在函数执行前后设置和清理环境', async () => {
      const setupSpy = vi.fn();
      const teardownSpy = vi.fn();
      
      const createTestEnvWithSpies = (config: any) => {
        const env = createTestEnvironment(config);
        const originalSetup = env.setup;
        const originalTeardown = env.teardown;
        
        env.setup = async () => {
          setupSpy();
          return originalSetup.call(env);
        };
        
        env.teardown = async () => {
          teardownSpy();
          return originalTeardown.call(env);
        };
        
        return env;
      };
      
      // 替换原始函数以使用我们的spy版本
      vi.mock('../../../src/testing/environment', async () => {
        return {
          createTestEnvironment: (config: any) => createTestEnvWithSpies(config),
          withTestEnvironment: (config: any, fn: any) => {
            const env = createTestEnvWithSpies(config);
            return env.setup()
              .then(() => fn(env))
              .finally(() => env.teardown());
          }
        };
      });
      
      const result = await withTestEnvironment(
        { name: 'test-with' },
        async (env) => {
          expect(env.config.name).toBe('test-with');
          return 'test-result';
        }
      );
      
      expect(result).toBe('test-result');
      expect(setupSpy).toHaveBeenCalledTimes(1);
      expect(teardownSpy).toHaveBeenCalledTimes(1);
    });

    it('即使函数抛出错误也应该清理环境', async () => {
      const teardownSpy = vi.fn();
      
      const createTestEnvWithSpies = (config: any) => {
        const env = createTestEnvironment(config);
        const originalTeardown = env.teardown;
        
        env.teardown = async () => {
          teardownSpy();
          return originalTeardown.call(env);
        };
        
        return env;
      };
      
      // 替换原始函数以使用我们的spy版本
      vi.mock('../../../src/testing/environment', async () => {
        return {
          createTestEnvironment: (config: any) => createTestEnvWithSpies(config),
          withTestEnvironment: (config: any, fn: any) => {
            const env = createTestEnvWithSpies(config);
            return env.setup()
              .then(() => fn(env))
              .finally(() => env.teardown());
          }
        };
      });
      
      await expect(withTestEnvironment(
        { name: 'test-error' },
        async () => {
          throw new Error('测试错误');
        }
      )).rejects.toThrow('测试错误');
      
      expect(teardownSpy).toHaveBeenCalledTimes(1);
    });
  });
}); 