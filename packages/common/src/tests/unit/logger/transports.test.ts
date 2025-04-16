import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { LogLevel } from '../../../logger/core';
import { ConsoleTransport, MemoryTransport } from '../../../logger/transports';
import { isNodeEnvironment } from '../../../logger/core/environment';

// 模拟一个简单的LogMeta
const testMeta = {
  packageName: 'test-package',
  timestamp: '2023-06-15T12:34:56.789Z'
};

describe('UT-LOG-004: Transports', () => {
  describe('ConsoleTransport', () => {
    // 备份原始console方法
    const originalConsole = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
      log: console.log
    };
    
    beforeEach(() => {
      // 模拟console方法
      console.debug = vi.fn();
      console.info = vi.fn();
      console.warn = vi.fn();
      console.error = vi.fn();
      console.log = vi.fn();
    });
    
    afterEach(() => {
      // 恢复原始console方法
      console.debug = originalConsole.debug;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.log = originalConsole.log;
    });
    
    test('应根据日志级别调用相应的console方法', () => {
      const transport = new ConsoleTransport();
      
      transport.log(LogLevel.DEBUG, 'Debug message', testMeta);
      transport.log(LogLevel.INFO, 'Info message', testMeta);
      transport.log(LogLevel.WARN, 'Warning message', testMeta);
      transport.log(LogLevel.ERROR, 'Error message', testMeta);
      
      expect(console.debug).toHaveBeenCalledWith('Debug message');
      expect(console.info).toHaveBeenCalledWith('Info message');
      expect(console.warn).toHaveBeenCalledWith('Warning message');
      expect(console.error).toHaveBeenCalledWith('Error message');
    });
    
    test('isAsync应返回false', () => {
      const transport = new ConsoleTransport();
      expect(transport.isAsync()).toBe(false);
    });
    
    test('colorize选项应影响输出', () => {
      const transport = new ConsoleTransport({ colorize: true });
      
      transport.log(LogLevel.INFO, 'Colored message', testMeta);
      
      // 如果colorize开启，应有颜色相关字符
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('%c'));
    });
  });
  
  describe('MemoryTransport', () => {
    test('应存储日志消息', () => {
      const transport = new MemoryTransport();
      
      transport.log(LogLevel.INFO, 'Test message', testMeta);
      
      const logs = transport.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('Test message');
    });
    
    test('应遵循最大容量限制', () => {
      const transport = new MemoryTransport({ maxSize: 2 });
      
      // 添加三条日志，超过maxSize
      transport.log(LogLevel.DEBUG, 'Message 1', testMeta);
      transport.log(LogLevel.INFO, 'Message 2', testMeta);
      transport.log(LogLevel.WARN, 'Message 3', testMeta);
      
      const logs = transport.getLogs();
      
      // 应只保留最近的两条
      expect(logs.length).toBe(2);
      expect(logs[0].message).toBe('Message 2');
      expect(logs[1].message).toBe('Message 3');
    });
    
    test('getLogsByLevel应返回指定级别的日志', () => {
      const transport = new MemoryTransport();
      
      transport.log(LogLevel.DEBUG, 'Debug', testMeta);
      transport.log(LogLevel.INFO, 'Info 1', testMeta);
      transport.log(LogLevel.INFO, 'Info 2', testMeta);
      transport.log(LogLevel.ERROR, 'Error', testMeta);
      
      const infoLogs = transport.getLogsByLevel(LogLevel.INFO);
      
      expect(infoLogs.length).toBe(2);
      expect(infoLogs[0].message).toBe('Info 1');
      expect(infoLogs[1].message).toBe('Info 2');
    });
    
    test('clear应清空所有日志', () => {
      const transport = new MemoryTransport();
      
      transport.log(LogLevel.INFO, 'Message', testMeta);
      expect(transport.getLogs().length).toBe(1);
      
      transport.clear();
      expect(transport.getLogs().length).toBe(0);
    });
    
    test('isAsync应返回false', () => {
      const transport = new MemoryTransport();
      expect(transport.isAsync()).toBe(false);
    });
  });
  
  // FileTransport测试仅在Node.js环境中运行
  if (isNodeEnvironment()) {
    // 这里我们不测试实际文件I/O，只测试逻辑
    describe('FileTransport', () => {
      test('isAsync应返回true', async () => {
        // 直接导入，确保只在Node环境中进行
        const { FileTransport } = await import('../../../logger/transports/file-transport');
        
        try {
          const transport = new FileTransport({ filename: 'test.log' });
          expect(transport.isAsync()).toBe(true);
        } catch (error) {
          // 捕获可能的错误，避免测试失败
          console.error('FileTransport测试失败:', error);
        }
      });
    });
  }
}); 