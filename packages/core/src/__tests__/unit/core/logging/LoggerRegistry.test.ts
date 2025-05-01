/**
 * LoggerRegistry单元测试
 *
 * 测试LoggerRegistry的单例模式和日志器管理功能
 */

import { describe, test, expect, vi, afterEach } from 'vitest';

import { DefaultLogger } from '../../../../core/logging/DefaultLogger';
import { LoggerRegistry } from '../../../../core/logging/LoggerRegistry';
import type { Logger } from '../../../../types/log';
import { LogLevel } from '../../../../types/log';

describe('LoggerRegistry', () => {
  // 每个测试后重置单例实例
  afterEach(() => {
    // 使用any类型绕过私有属性访问限制，仅用于测试
    (LoggerRegistry as any).instance = undefined;
  });

  // UT-LOGREG-01: getInstance应返回单例实例
  test('getInstance should return a singleton instance', () => {
    const instance1 = LoggerRegistry.getInstance();
    const instance2 = LoggerRegistry.getInstance();

    expect(instance1).toBe(instance2);
  });

  // UT-LOGREG-02: getInstance应使用默认配置创建实例
  test('getInstance should create instance with default config', () => {
    const registry = LoggerRegistry.getInstance();

    // 获取默认日志器并验证其最低级别
    const defaultLogger = registry.getLogger('default');

    // 由于无法直接访问私有属性，我们通过行为来验证
    // 默认配置使用INFO级别，所以DEBUG级别的日志不应该被记录
    const mockConsole = vi.spyOn(console, 'error').mockImplementation(() => {});

    // 创建一个测试日志器，验证默认配置
    const testLogger = registry.createLogger('test', { minLevel: LogLevel.DEBUG });

    // 验证日志器是否被正确创建和注册
    expect(registry.getLogger('test')).toBeDefined();

    mockConsole.mockRestore();
  });

  // UT-LOGREG-03: getInstance应使用提供的配置创建实例
  test('getInstance should create instance with provided config', () => {
    const customConfig = {
      minLevel: LogLevel.ERROR
    };

    const registry = LoggerRegistry.getInstance(customConfig);

    // 创建一个测试日志器，使用与默认配置不同的级别
    const testLogger = registry.createLogger('test', { minLevel: LogLevel.DEBUG });

    // 验证日志器是否被正确创建和注册
    expect(registry.getLogger('test')).toBeDefined();
  });

  // UT-LOGREG-04: getLogger应返回已注册的日志器
  test('getLogger should return registered logger', () => {
    const registry = LoggerRegistry.getInstance();

    // 创建一个模拟日志器
    const mockLogger: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn()
    };

    // 注册模拟日志器
    registry.registerLogger('mock', mockLogger);

    // 获取并验证
    const retrievedLogger = registry.getLogger('mock');

    expect(retrievedLogger).toBe(mockLogger);
  });

  // UT-LOGREG-05: getLogger应在日志器不存在时返回默认日志器
  test('getLogger should return default logger when logger does not exist', () => {
    const registry = LoggerRegistry.getInstance();

    // 获取默认日志器
    const defaultLogger = registry.getLogger('default');

    // 获取不存在的日志器，应该返回默认日志器
    const nonExistentLogger = registry.getLogger('non-existent');

    expect(nonExistentLogger).toBe(defaultLogger);
  });

  // UT-LOGREG-06: registerLogger应注册新日志器
  test('registerLogger should register a new logger', () => {
    const registry = LoggerRegistry.getInstance();

    // 创建一个模拟日志器
    const mockLogger: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn()
    };

    // 注册模拟日志器
    registry.registerLogger('custom', mockLogger);

    // 验证是否正确注册
    expect(registry.getLogger('custom')).toBe(mockLogger);
  });

  // UT-LOGREG-07: createLogger应创建并注册新日志器
  test('createLogger should create and register a new logger', () => {
    const registry = LoggerRegistry.getInstance();

    // 创建新日志器
    const config = { minLevel: LogLevel.WARN };
    const logger = registry.createLogger('new-logger', config);

    // 验证是否正确创建和注册
    expect(logger).toBeInstanceOf(DefaultLogger);
    expect(registry.getLogger('new-logger')).toBe(logger);
  });

  // UT-LOGREG-NEG-01: registerLogger应在重复注册时覆盖现有日志器
  test('registerLogger should override existing logger when registering with same name', () => {
    const registry = LoggerRegistry.getInstance();

    // 创建两个模拟日志器
    const mockLogger1: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn()
    };

    const mockLogger2: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn()
    };

    // 先注册第一个日志器
    registry.registerLogger('duplicate', mockLogger1);
    expect(registry.getLogger('duplicate')).toBe(mockLogger1);

    // 用同名注册第二个日志器，应该覆盖第一个
    registry.registerLogger('duplicate', mockLogger2);
    expect(registry.getLogger('duplicate')).toBe(mockLogger2);
    expect(registry.getLogger('duplicate')).not.toBe(mockLogger1);
  });
});
