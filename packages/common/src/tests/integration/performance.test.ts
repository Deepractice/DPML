import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createLogger, LogLevel } from '../../logger';
import { createMockFileSystem, createMockHttpClient } from '../../testing';
import * as utils from '../../utils';

// 性能测试辅助函数
const measurePerformance = async (
  name: string,
  fn: () => Promise<any> | any,
  iterations: number = 1000
): Promise<{ name: string, average: number, min: number, max: number }> => {
  const times: number[] = [];
  
  // 预热
  for (let i = 0; i < 10; i++) {
    await fn();
  }
  
  // 执行测试
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  // 计算统计数据
  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`性能测试 [${name}]: 平均: ${average.toFixed(3)}ms, 最小: ${min.toFixed(3)}ms, 最大: ${max.toFixed(3)}ms`);
  
  return { name, average, min, max };
};

describe('IT-性能测试', () => {
  describe('日志系统性能', () => {
    test('IT-PERF-001: 日志记录应满足性能要求', () => {
      // 创建一个空的传输对象用于性能测试
      const emptyTransport = {
        log: vi.fn((level, message, meta) => {}),
        isAsync: () => false
      };
      
      // 创建日志记录器
      const logger = createLogger({
        name: 'perf-test',
        level: LogLevel.INFO,
        transports: [emptyTransport]
      });
      
      // 预热
      for (let i = 0; i < 10; i++) {
        logger.info('预热消息');
      }
      
      // 性能测试
      const startTime = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        logger.info(`性能测试消息 ${i}`);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 10000;
      
      const result = {
        total: totalTime,
        average: averageTime,
        count: 10000
      };
      
      console.log(`日志性能测试: 平均: ${averageTime.toFixed(3)}ms, 总时间: ${totalTime.toFixed(3)}ms, 数量: 10000`);
      
      // 验证性能目标
      expect(result.average).toBeLessThan(0.1); // 平均不超过0.1ms
      expect(emptyTransport.log).toHaveBeenCalledTimes(10010); // 10预热 + 10000测试
    });
  });
  
  describe('工具函数性能', () => {
    test('IT-PERF-002: 深拷贝性能测试', async () => {
      // 创建复杂对象
      const complexObject = {
        id: 12345,
        name: '测试对象',
        properties: {
          type: 'complex',
          nested: {
            array: Array.from({ length: 100 }, (_, i) => ({
              id: i,
              name: `Item ${i}`,
              active: i % 2 === 0
            }))
          }
        },
        metadata: {
          created: new Date(),
          tags: ['performance', 'test', 'deepclone']
        }
      };
      
      // 测量性能
      const result = await measurePerformance(
        '对象深拷贝',
        () => utils.object.deepClone(complexObject),
        1000 // 1000次迭代
      );
      
      // 验证性能目标
      expect(result.average).toBeLessThan(5); // 平均不超过5ms
    });
    
    test('IT-PERF-003: 路径操作性能测试', async () => {
      // 测量性能
      const pathSegments = Array.from({ length: 10 }, (_, i) => `segment${i}`);
      
      const result = await measurePerformance(
        '路径合并操作',
        () => {
          for (let i = 1; i <= 10; i++) {
            utils.path.join('/base/path', ...pathSegments.slice(0, i));
          }
        },
        10000 // 1万次迭代
      );
      
      // 验证性能目标
      expect(result.average).toBeLessThan(0.5); // 平均不超过0.5ms
    });
    
    test('IT-PERF-004: 数组操作性能测试', async () => {
      // 创建大型数组
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        category: `category-${i % 10}`,
        value: Math.random() * 1000
      }));
      
      // 测量分组操作性能
      const result = await measurePerformance(
        '数组分组操作',
        () => utils.array.groupBy(largeArray, item => item.category),
        100 // 100次迭代
      );
      
      // 验证性能目标
      expect(result.average).toBeLessThan(50); // 平均不超过50ms
    });
  });
  
  describe('模拟对象性能', () => {
    test('IT-PERF-005: 文件系统模拟性能测试', async () => {
      // 创建大型模拟文件系统
      const fileContents: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        fileContents[`/test/file-${i}.txt`] = `Content of file ${i}`;
      }
      
      const mockFs = createMockFileSystem(fileContents);
      
      // 测量文件读取性能
      const result = await measurePerformance(
        '模拟文件系统读取',
        async () => {
          const fileNum = Math.floor(Math.random() * 1000);
          const path = `/test/file-${fileNum}.txt`;
          return await mockFs.readFile(path);
        },
        1000 // 1000次迭代
      );
      
      // 验证性能目标
      expect(result.average).toBeLessThan(1); // 平均不超过1ms
    });
    
    test('IT-PERF-006: HTTP客户端模拟性能测试', async () => {
      // 创建模拟HTTP客户端
      const mockHttp = createMockHttpClient();
      
      // 配置多个端点
      for (let i = 0; i < 100; i++) {
        mockHttp.onGet(`https://api.example.com/resource/${i}`).reply(200, {
          id: i,
          name: `Resource ${i}`,
          data: Array.from({ length: 10 }, (_, j) => ({ key: j, value: `Value ${j}` }))
        });
      }
      
      // 测量HTTP请求性能
      const result = await measurePerformance(
        '模拟HTTP请求',
        async () => {
          const resourceId = Math.floor(Math.random() * 100);
          return await mockHttp.get(`https://api.example.com/resource/${resourceId}`);
        },
        1000 // 1000次迭代
      );
      
      // 验证性能目标
      expect(result.average).toBeLessThan(2); // 平均不超过2ms
    });
  });
}); 