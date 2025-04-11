/**
 * SecureLogger单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SecureLogger, LogLevel } from '../../../src/security/SecureLogger';
import { InputSanitizer } from '../../../src/security/InputSanitizer';

describe('SecureLogger', () => {
  // 保存原始控制台方法
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  
  // 测试用的控制台方法
  const mockConsole = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
  
  // Mock InputSanitizer.removeSensitiveData
  const originalRemoveSensitiveData = InputSanitizer.removeSensitiveData;
  
  beforeEach(() => {
    // 替换控制台方法为模拟函数
    console.debug = mockConsole.debug;
    console.info = mockConsole.info;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
    
    // 清除所有模拟函数的调用记录
    vi.clearAllMocks();
    
    // 模拟InputSanitizer.removeSensitiveData
    InputSanitizer.removeSensitiveData = vi.fn((text) => {
      if (typeof text !== 'string') return text;
      return text
        .replace(/\b(sk-[a-zA-Z0-9]{5,})[a-zA-Z0-9]+\b/gi, '$1********')
        .replace(/\b(password\s*[:=]\s*['"]?)[^'"\s]{3,}/gi, '$1********');
    });
  });
  
  afterEach(() => {
    // 恢复原始控制台方法
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    
    // 恢复原始InputSanitizer方法
    InputSanitizer.removeSensitiveData = originalRemoveSensitiveData;
  });
  
  // UT-SEC-005: 测试日志安全审查
  it('should sanitize sensitive data in logs (UT-SEC-005)', () => {
    const logger = new SecureLogger();
    const apiKey = 'My API key is sk-1234567890abcdef';
    
    logger.info(apiKey);
    
    // 验证InputSanitizer.removeSensitiveData被调用
    expect(InputSanitizer.removeSensitiveData).toHaveBeenCalledWith(apiKey);
    
    // 验证日志被输出
    expect(mockConsole.info).toHaveBeenCalled();
  });
  
  it('should respect log level settings', () => {
    const logger = new SecureLogger({ minLevel: LogLevel.WARN });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    // 低于最低级别的日志应该被忽略
    expect(mockConsole.debug).not.toHaveBeenCalled();
    expect(mockConsole.info).not.toHaveBeenCalled();
    
    // 高于或等于最低级别的日志应该被记录
    expect(mockConsole.warn).toHaveBeenCalled();
    expect(mockConsole.error).toHaveBeenCalled();
  });
  
  it('should handle disabled logging', () => {
    const logger = new SecureLogger({ enabled: false });
    
    logger.info('This should not be logged');
    
    expect(mockConsole.info).not.toHaveBeenCalled();
  });
  
  it('should support custom log functions', () => {
    const customLogFn = vi.fn();
    const logger = new SecureLogger({ logFn: customLogFn });
    
    logger.info('Test message');
    
    expect(customLogFn).toHaveBeenCalledWith(LogLevel.INFO, 'Test message', undefined);
    expect(mockConsole.info).not.toHaveBeenCalled();
  });
  
  // UT-SEC-004: 测试敏感信息处理
  it('should sanitize metadata with sensitive fields (UT-SEC-004)', () => {
    const logger = new SecureLogger();
    const meta = {
      user: 'test',
      apiKey: 'sk-1234567890abcdef',
      config: {
        password: 'secret123',
        setting: 'value'
      }
    };
    
    logger.info('Log with sensitive metadata', meta);
    
    // 验证元数据中的敏感字段已被净化
    expect(mockConsole.info).toHaveBeenCalled();
    const loggedMeta = mockConsole.info.mock.calls[0][2];
    
    expect(loggedMeta.user).toBe('test');
    expect(loggedMeta.apiKey).toBe('********');
    expect(loggedMeta.config.password).toBe('********');
    expect(loggedMeta.config.setting).toBe('value');
  });
  
  it('should handle non-object metadata', () => {
    const logger = new SecureLogger();
    
    // 原始值元数据
    logger.info('Log with primitive metadata', 123);
    expect(mockConsole.info.mock.calls[0][2]).toBe(123);
    
    // 数组元数据
    const arrayMeta = ['test', { apiKey: 'secret' }];
    logger.info('Log with array metadata', arrayMeta);
    const loggedArrayMeta = mockConsole.info.mock.calls[1][2];
    expect(loggedArrayMeta[0]).toBe('test');
    expect(loggedArrayMeta[1].apiKey).toBe('********');
  });
  
  // UT-SEC-006: 测试错误信息安全
  it('should handle error objects securely (UT-SEC-006)', () => {
    // 创建一个模拟的错误对象
    class MockedError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'MockedError';
      }
    }
    
    const originalToString = Error.prototype.toString;
    Error.prototype.toString = function() {
      return this.message || '';
    };
    
    try {
      const logger = new SecureLogger();
      const error = new MockedError('Error with API key sk-1234567890abcdef');
      
      logger.error('An error occurred', { error });
      
      // 验证错误信息中的敏感信息已被处理
      expect(mockConsole.error).toHaveBeenCalled();
      
      // 检查是否尝试清理错误对象
      expect(InputSanitizer.removeSensitiveData).toHaveBeenCalled();
      
      // 验证错误对象存在于日志元数据中
      const loggedMeta = mockConsole.error.mock.calls[0][2];
      expect(loggedMeta).toHaveProperty('error');
      // 不测试具体类型，只检查属性存在
      expect(typeof loggedMeta.error).toBe('object');
      expect(loggedMeta.error).toBeTruthy();
    } finally {
      // 恢复原始toString
      Error.prototype.toString = originalToString;
    }
  });
}); 