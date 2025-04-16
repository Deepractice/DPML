import { describe, test, expect, vi } from 'vitest';
import { withTestEnvironment } from '@dpml/common/testing';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as utils from '@dpml/common/utils';

// 获取当前目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('IT-Utils工具集成测试', () => {
  describe('路径和文件操作', () => {
    test('IT-UTILS-001: 路径操作工具在不同平台应表现一致', () => {
      // 测试路径规范化
      const winPath = 'C:\\Users\\test\\file.txt';
      const unixPath = '/Users/test/file.txt';
      
      // 转换为当前平台路径
      const normalizedWinPath = utils.path.normalize(winPath);
      const normalizedUnixPath = utils.path.normalize(unixPath);
      
      // 验证路径有效
      expect(utils.path.isAbsolute(normalizedWinPath) || utils.path.isAbsolute(normalizedUnixPath)).toBe(true);
      
      // 测试路径合并
      const basePath = utils.path.normalize('/base/path');
      const relativePath = 'relative/file.txt';
      const joinedPath = utils.path.join(basePath, relativePath);
      
      expect(joinedPath.includes('base')).toBe(true);
      expect(joinedPath.includes('relative')).toBe(true);
      expect(joinedPath.includes('file.txt')).toBe(true);
    });
    
    test('IT-UTILS-002: 路径操作工具与Node.js内置模块功能一致', () => {
      const relativePath = '../test/file.txt';
      const basePath = '/base/path';
      
      // 比较自定义工具与Node.js内置功能
      const utilsResult = utils.path.resolve(basePath, relativePath);
      const nodeResult = path.resolve(basePath, relativePath);
      
      expect(utils.path.normalize(utilsResult)).toBe(utils.path.normalize(nodeResult));
    });
  });
  
  describe('异步操作工具', () => {
    test('IT-UTILS-003: 重试机制应正确处理临时失败', async () => {
      // 创建一个会失败几次然后成功的函数
      let attempts = 0;
      const flakeyFunction = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('暂时性失败');
        }
        return 'success';
      };
      
      // 使用重试工具
      const result = await utils.async.retry(flakeyFunction, {
        retries: 5,
        minTimeout: 10,
        maxTimeout: 50,
        factor: 2
      });
      
      // 验证最终成功
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
    
    test('IT-UTILS-004: 并行控制应限制并发任务数', async () => {
      const results: number[] = [];
      const executingTasks = new Set<number>();
      let maxConcurrent = 0;
      
      // 创建10个任务
      const tasks = Array.from({ length: 10 }, (_, i) => async () => {
        executingTasks.add(i);
        maxConcurrent = Math.max(maxConcurrent, executingTasks.size);
        
        // 模拟异步工作
        await new Promise(resolve => setTimeout(resolve, 50));
        
        executingTasks.delete(i);
        results.push(i);
        return i;
      });
      
      // 限制并发数为3
      await utils.async.parallelLimit(tasks, 3);
      
      // 验证结果
      expect(results.length).toBe(10);
      expect(maxConcurrent).toBe(3); // 最大并发应该是3
    });
  });
  
  describe('对象和数组处理', () => {
    test('IT-UTILS-005: 深拷贝应创建独立的对象副本', () => {
      // 创建复杂对象
      const original = {
        name: 'test',
        details: {
          id: 123,
          tags: ['a', 'b', 'c']
        },
        date: new Date('2023-01-01')
      };
      
      // 深拷贝
      const copy = utils.object.deepClone(original);
      
      // 验证拷贝独立性
      expect(copy).toEqual(original); // 值相等
      expect(copy).not.toBe(original); // 引用不同
      expect(copy.details).not.toBe(original.details); // 嵌套对象引用不同
      expect(copy.details.tags).not.toBe(original.details.tags); // 数组引用不同
      
      // 修改不影响原对象
      copy.name = 'modified';
      copy.details.id = 456;
      copy.details.tags.push('d');
      
      expect(original.name).toBe('test');
      expect(original.details.id).toBe(123);
      expect(original.details.tags.length).toBe(3);
    });
    
    test('IT-UTILS-006: 数组分组应正确分类元素', () => {
      const items = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 },
        { type: 'C', value: 4 },
        { type: 'B', value: 5 }
      ];
      
      // 按type分组
      const grouped = utils.array.groupBy(items, item => item.type);
      
      // 验证分组结果
      expect(Object.keys(grouped).length).toBe(3); // A, B, C三组
      expect(grouped['A'].length).toBe(2);
      expect(grouped['B'].length).toBe(2);
      expect(grouped['C'].length).toBe(1);
      
      // 验证元素在正确的组
      expect(grouped['A'].map(item => item.value)).toEqual([1, 3]);
      expect(grouped['B'].map(item => item.value)).toEqual([2, 5]);
      expect(grouped['C'].map(item => item.value)).toEqual([4]);
    });
  });
  
  describe('错误处理', () => {
    test('IT-UTILS-007: 错误处理工具应捕获并转换错误', async () => {
      // 创建可能抛出不同类型错误的函数
      const riskyFunction = (errorType: string) => {
        if (errorType === 'standard') {
          throw new Error('标准错误');
        } else if (errorType === 'custom') {
          throw { code: 'CUSTOM_ERROR', message: '自定义错误对象' };
        }
        return 'success';
      };
      
      // 使用错误包装工具
      const safeFunction = utils.error.safeCatch(riskyFunction, (err) => {
        return { 
          handled: true, 
          originalError: err,
          message: err instanceof Error ? err.message : String(err)
        };
      });
      
      // 测试标准错误
      const result1 = safeFunction('standard');
      expect(result1).toHaveProperty('handled', true);
      expect(result1.message).toBe('标准错误');
      
      // 测试自定义错误
      const result2 = safeFunction('custom');
      expect(result2).toHaveProperty('handled', true);
      expect(result2.originalError).toHaveProperty('code', 'CUSTOM_ERROR');
      
      // 测试无错误情况
      const result3 = safeFunction('none');
      expect(result3).toBe('success');
    });
  });
}); 