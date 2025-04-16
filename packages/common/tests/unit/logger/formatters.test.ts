import { describe, test, expect } from 'vitest';
import { LogLevel } from '../../../src/logger/core';
import { TextFormatter, JsonFormatter } from '../../../src/logger/formatters';

describe('UT-LOG-003: Formatters', () => {
  const meta = {
    packageName: 'test-package',
    timestamp: '2023-06-15T12:34:56.789Z'
  };
  
  describe('TextFormatter', () => {
    test('默认格式化', () => {
      const formatter = new TextFormatter();
      const message = 'Test message';
      
      const formatted = formatter.format(LogLevel.INFO, message, meta);
      
      expect(formatted).toContain('[2023-06-15T12:34:56.789Z]');
      expect(formatted).toContain('[test-package]');
      expect(formatted).toContain('[INFO]');
      expect(formatted).toContain('Test message');
    });
    
    test('自定义模板', () => {
      const formatter = new TextFormatter({
        template: '{level} - {message} - {packageName}'
      });
      
      const formatted = formatter.format(LogLevel.ERROR, 'Error occurred', meta);
      
      expect(formatted).toBe('ERROR - Error occurred - test-package');
    });
    
    test('不显示时间戳', () => {
      const formatter = new TextFormatter({
        showTimestamp: false
      });
      
      const formatted = formatter.format(LogLevel.WARN, 'Warning', meta);
      
      expect(formatted).not.toContain('2023-06-15');
      expect(formatted).toContain('[test-package]');
      expect(formatted).toContain('[WARN]');
      expect(formatted).toContain('Warning');
    });
    
    test('不显示包名称', () => {
      const formatter = new TextFormatter({
        showPackageName: false
      });
      
      const formatted = formatter.format(LogLevel.DEBUG, 'Debug info', meta);
      
      expect(formatted).not.toContain('test-package');
      expect(formatted).toContain('[DEBUG]');
      expect(formatted).toContain('Debug info');
    });
    
    test('自定义时间戳格式', () => {
      const formatter = new TextFormatter({
        timestampFormatter: () => 'CUSTOM_TIME'
      });
      
      const formatted = formatter.format(LogLevel.INFO, 'Message', meta);
      
      expect(formatted).toContain('[CUSTOM_TIME]');
    });
  });
  
  describe('JsonFormatter', () => {
    test('默认格式化', () => {
      const formatter = new JsonFormatter();
      const message = 'Test message';
      
      const formatted = formatter.format(LogLevel.INFO, message, meta);
      const parsed = JSON.parse(formatted);
      
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.packageName).toBe('test-package');
      expect(parsed.timestamp).toBe('2023-06-15T12:34:56.789Z');
    });
    
    test('美化输出', () => {
      const formatter = new JsonFormatter({ pretty: true });
      
      const formatted = formatter.format(LogLevel.ERROR, 'Error', meta);
      
      // 美化输出应包含换行符
      expect(formatted).toContain('\n');
    });
    
    test('不包含元数据', () => {
      const formatter = new JsonFormatter({ includeMeta: false });
      
      const formatted = formatter.format(LogLevel.WARN, 'Warning', meta);
      const parsed = JSON.parse(formatted);
      
      expect(parsed.level).toBe('WARN');
      expect(parsed.message).toBe('Warning');
      expect(parsed.packageName).toBeUndefined();
      expect(parsed.timestamp).toBeUndefined();
    });
    
    test('自定义缩进', () => {
      const formatter = new JsonFormatter({ 
        pretty: true,
        indent: 4
      });
      
      const formatted = formatter.format(LogLevel.DEBUG, 'Debug', meta);
      
      // 应包含4个空格的缩进
      expect(formatted).toContain('\n    ');
    });
  });
}); 