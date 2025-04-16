import { describe, test, expect, beforeEach } from 'vitest';
import { 
  LoggerFactory, 
  LogLevel
} from '../../../src/logger/core';
import { JsonFormatter } from '../../../src/logger/formatters';

describe('UT-LOG-002: LoggerFactory', () => {
  let loggerFactory: LoggerFactory;
  
  beforeEach(() => {
    loggerFactory = new LoggerFactory();
  });
  
  describe('getLogger方法', () => {
    test('应创建并返回新的Logger实例', () => {
      const logger = loggerFactory.getLogger('test-package');
      
      expect(logger).toBeDefined();
      expect(logger.getLevel()).toBe(LogLevel.INFO); // 默认级别
    });
    
    test('相同包名应返回相同的Logger实例', () => {
      const logger1 = loggerFactory.getLogger('same-package');
      const logger2 = loggerFactory.getLogger('same-package');
      
      expect(logger1).toBe(logger2);
    });
    
    test('不同包名应返回不同的Logger实例', () => {
      const logger1 = loggerFactory.getLogger('package1');
      const logger2 = loggerFactory.getLogger('package2');
      
      expect(logger1).not.toBe(logger2);
    });
    
    test('应接受自定义选项', () => {
      const logger = loggerFactory.getLogger('custom-package', {
        level: LogLevel.ERROR
      });
      
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });
  
  describe('configure方法', () => {
    test('应更新默认日志级别', () => {
      loggerFactory.configure({ level: LogLevel.WARN });
      
      const logger = loggerFactory.getLogger('new-package');
      expect(logger.getLevel()).toBe(LogLevel.WARN);
    });
    
    test('应更新已创建的Logger实例', () => {
      // 先创建Logger
      const logger1 = loggerFactory.getLogger('package1');
      const logger2 = loggerFactory.getLogger('package2');
      
      // 然后配置工厂
      loggerFactory.configure({ level: LogLevel.ERROR });
      
      // 两个Logger实例都应更新
      expect(logger1.getLevel()).toBe(LogLevel.ERROR);
      expect(logger2.getLevel()).toBe(LogLevel.ERROR);
    });
    
    test('应更新格式化器', () => {
      const formatter = new JsonFormatter();
      
      // 先创建Logger
      const logger = loggerFactory.getLogger('test-package');
      
      // 模拟formatter的getter
      const originalFormatter = (logger as any).formatter;
      
      // 配置
      loggerFactory.configure({ formatter });
      
      // 验证格式化器已更改
      expect((logger as any).formatter).not.toBe(originalFormatter);
      expect((logger as any).formatter).toBeInstanceOf(JsonFormatter);
    });
  });
  
  describe('getAllLoggers方法', () => {
    test('应返回所有已创建的Logger实例', () => {
      // 创建几个Logger
      loggerFactory.getLogger('package1');
      loggerFactory.getLogger('package2');
      loggerFactory.getLogger('package3');
      
      const loggers = loggerFactory.getAllLoggers();
      
      expect(loggers.size).toBe(3);
      expect(loggers.has('package1')).toBe(true);
      expect(loggers.has('package2')).toBe(true);
      expect(loggers.has('package3')).toBe(true);
    });
    
    test('应返回Map副本而非引用', () => {
      loggerFactory.getLogger('test');
      
      const loggers1 = loggerFactory.getAllLoggers();
      const loggers2 = loggerFactory.getAllLoggers();
      
      expect(loggers1).not.toBe(loggers2);
      expect(loggers1.size).toBe(loggers2.size);
    });
  });
  
  describe('closeAll方法', () => {
    test('应清除所有Logger实例', async () => {
      // 创建几个Logger
      loggerFactory.getLogger('package1');
      loggerFactory.getLogger('package2');
      
      await loggerFactory.closeAll();
      
      const loggers = loggerFactory.getAllLoggers();
      expect(loggers.size).toBe(0);
    });
  });
}); 