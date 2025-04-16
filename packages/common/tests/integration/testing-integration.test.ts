import { describe, test, expect, vi } from 'vitest';
import { withTestEnvironment, createMockFileSystem, createMockHttpClient } from '@dpml/common/testing';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 获取当前目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('IT-Testing工具集成测试', () => {
  describe('测试环境工具', () => {
    test('IT-TEST-001: withTestEnvironment应创建和清理临时环境', async () => {
      let tempDirPath: string | undefined;
      
      await withTestEnvironment({ name: 'env-test' }, async (env) => {
        // 保存临时目录路径
        tempDirPath = env.tempDir;
        
        // 验证临时目录存在
        expect(fs.existsSync(tempDirPath)).toBe(true);
        
        // 创建测试文件
        const testFilePath = path.join(tempDirPath, 'test.txt');
        fs.writeFileSync(testFilePath, 'test content');
        
        // 验证文件已创建
        expect(fs.existsSync(testFilePath)).toBe(true);
      });
      
      // 测试环境应被清理
      expect(tempDirPath).toBeDefined();
      expect(fs.existsSync(tempDirPath!)).toBe(false);
    });
    
    test('IT-TEST-002: 测试环境应支持模拟时间', async () => {
      const realNow = Date.now;
      
      await withTestEnvironment({ name: 'time-test', mockTime: true }, async (env) => {
        // 验证Date.now被模拟
        expect(Date.now).not.toBe(realNow);
        
        // 设置当前时间
        const mockTime = new Date('2023-01-01T00:00:00Z').getTime();
        env.setCurrentTime(mockTime);
        
        // 验证模拟时间生效
        expect(Date.now()).toBe(mockTime);
        
        // 推进时间
        env.advanceTimeBy(60000); // 推进1分钟
        expect(Date.now()).toBe(mockTime + 60000);
      });
      
      // 验证原始时间函数已恢复
      expect(Date.now).toBe(realNow);
    });
  });
  
  describe('模拟对象集成', () => {
    test('IT-TEST-003: 文件系统模拟应与真实文件系统API保持一致', async () => {
      // 创建模拟文件系统
      const mockFs = createMockFileSystem({
        '/test/file.txt': 'test content',
        '/test/empty-dir': null
      });
      
      // 测试基本操作
      expect(await mockFs.exists('/test/file.txt')).toBe(true);
      expect(await mockFs.exists('/nonexistent')).toBe(false);
      expect(await mockFs.readFile('/test/file.txt')).toBe('test content');
      
      // 测试目录操作
      expect(await mockFs.isDirectory('/test/empty-dir')).toBe(true);
      const dirContents = await mockFs.readdir('/test');
      expect(dirContents).toContain('file.txt');
      expect(dirContents).toContain('empty-dir');
      
      // 测试写入操作
      await mockFs.writeFile('/new-file.txt', 'new content');
      expect(await mockFs.exists('/new-file.txt')).toBe(true);
      expect(await mockFs.readFile('/new-file.txt')).toBe('new content');
    });
    
    test('IT-TEST-004: HTTP客户端模拟应支持请求匹配和响应模拟', async () => {
      // 创建模拟HTTP客户端
      const mockHttp = createMockHttpClient();
      
      // 配置请求响应
      mockHttp.onGet('https://api.example.com/data').reply(200, { success: true, data: [1, 2, 3] });
      mockHttp.onPost('https://api.example.com/submit').reply(201, { id: '123' });
      mockHttp.onAny('https://api.example.com/error').reply(500, { error: 'Internal error' });
      
      // 测试GET请求
      const getResponse = await mockHttp.get('https://api.example.com/data');
      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toEqual({ success: true, data: [1, 2, 3] });
      
      // 测试POST请求
      const postResponse = await mockHttp.post('https://api.example.com/submit', { name: 'test' });
      expect(postResponse.status).toBe(201);
      expect(postResponse.data).toEqual({ id: '123' });
      
      // 测试错误响应
      try {
        await mockHttp.get('https://api.example.com/error');
        // 应该不会执行到这里
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toEqual({ error: 'Internal error' });
      }
      
      // 验证请求历史
      expect(mockHttp.history.get.length).toBe(2); // data和error
      expect(mockHttp.history.post.length).toBe(1);
    });
  });
}); 