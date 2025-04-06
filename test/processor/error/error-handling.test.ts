/**
 * 处理器错误处理测试
 */
import { describe, it, expect, vi } from 'vitest';
import { NodeType } from '../../../src/types/node';
import { ErrorSeverity, ProcessingError } from '../../../src/processor/errors/processingError';
import { ErrorHandler } from '../../../src/processor/errors/errorHandler';

describe('错误处理基础测试', () => {
  // 测试ProcessingError
  it('ProcessingError应该正确初始化', () => {
    const error = new ProcessingError({
      message: '测试错误',
      severity: ErrorSeverity.ERROR,
      code: 'TEST_ERROR'
    });
    
    expect(error).toBeDefined();
    expect(error.message).toBe('测试错误');
    expect(error.severity).toBe(ErrorSeverity.ERROR);
    expect(error.code).toBe('TEST_ERROR');
  });
  
  it('ProcessingError应该能够转换级别', () => {
    const error = new ProcessingError({
      message: '测试错误',
      severity: ErrorSeverity.ERROR
    });
    
    error.asWarning();
    expect(error.severity).toBe(ErrorSeverity.WARNING);
    
    error.asError();
    expect(error.severity).toBe(ErrorSeverity.ERROR);
    
    error.asFatal();
    expect(error.severity).toBe(ErrorSeverity.FATAL);
    expect(error.isFatal()).toBe(true);
  });
  
  // 测试ErrorHandler
  it('ErrorHandler应该使用默认设置初始化', () => {
    const handler = new ErrorHandler();
    
    expect(handler).toBeDefined();
    expect(handler.isStrictMode()).toBe(false);
    expect(handler.isErrorRecoveryEnabled()).toBe(false);
  });
  
  it('ErrorHandler应该遵循严格模式设置', () => {
    const handler = new ErrorHandler({ strictMode: true });
    
    expect(handler.isStrictMode()).toBe(true);
    
    handler.setStrictMode(false);
    expect(handler.isStrictMode()).toBe(false);
  });
  
  it('ErrorHandler应该遵循错误恢复设置', () => {
    const handler = new ErrorHandler({ errorRecovery: true });
    
    expect(handler.isErrorRecoveryEnabled()).toBe(true);
    
    handler.setErrorRecovery(false);
    expect(handler.isErrorRecoveryEnabled()).toBe(false);
  });
  
  it('ErrorHandler应该在宽松模式下发出警告', () => {
    // 模拟控制台
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const handler = new ErrorHandler();
    
    // 在宽松模式下处理错误
    handler.handleWarning('这是一个警告');
    
    expect(console.warn).toHaveBeenCalled();
  });
  
  it('ErrorHandler应该在严格模式下抛出错误', () => {
    const handler = new ErrorHandler({ strictMode: true });
    
    // 在严格模式下处理错误应该抛出异常
    expect(() => {
      handler.handleError('这是一个错误');
    }).toThrow();
  });
  
  it('ErrorHandler应该在启用错误恢复时不抛出非致命错误', () => {
    // 模拟控制台
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const handler = new ErrorHandler({ 
      strictMode: false,
      errorRecovery: true
    });
    
    // 在启用错误恢复的情况下，处理错误不应该抛出异常
    expect(() => {
      handler.handleError('这是一个可恢复的错误', undefined, undefined, ErrorSeverity.ERROR);
    }).not.toThrow();
    
    expect(console.error).toHaveBeenCalled();
  });
  
  it('ErrorHandler应该始终抛出致命错误', () => {
    const handler = new ErrorHandler({ 
      strictMode: false,
      errorRecovery: true 
    });
    
    // 即使启用了错误恢复，致命错误也应该抛出
    expect(() => {
      handler.handleError('这是一个致命错误', undefined, undefined, ErrorSeverity.FATAL);
    }).toThrow();
  });
}); 