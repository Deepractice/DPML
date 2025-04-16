/**
 * 浏览器兼容性测试
 *
 * 注意：这些测试主要在Node.js环境中模拟和测试浏览器兼容性
 * 实际的浏览器兼容性测试应在真实浏览器环境中进行
 */

import { describe, test, expect, vi } from 'vitest';
import * as utils from '@dpml/common/utils';
import { createLogger, LogLevel } from '@dpml/common/logger';

describe('IT-浏览器兼容性测试', () => {
  describe('平台检测', () => {
    test('IT-COMPAT-001: 平台检测工具应正确识别环境', () => {
      // 测试浏览器环境模拟
      const originalWindow = global.window;
      const originalNavigator = global.navigator;

      try {
        // 模拟浏览器环境
        const mockWindow = {} as any;
        const mockNavigator = {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        } as any;

        // 使用Object.defineProperty来模拟浏览器全局对象
        Object.defineProperty(global, 'window', {
          value: mockWindow,
          writable: true,
          configurable: true
        });

        // 使用Object.defineProperty来模拟浏览器navigator
        Object.defineProperty(global, 'navigator', {
          value: mockNavigator,
          writable: true,
          configurable: true
        });

        // 验证平台检测
        expect(utils.platform.isBrowser()).toBe(true);
        expect(utils.platform.isNode()).toBe(false);

        // 模拟IE浏览器
        Object.defineProperty(mockNavigator, 'userAgent', {
          value: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
          writable: true,
          configurable: true
        });

        expect(utils.platform.isBrowser()).toBe(true);
        expect(utils.platform.isIE()).toBe(true);
      } finally {
        // 恢复原始环境
        global.window = originalWindow;
        global.navigator = originalNavigator;
      }

      // 验证恢复Node环境后的检测
      expect(utils.platform.isNode()).toBe(true);
      expect(utils.platform.isBrowser()).toBe(false);
    });
  });

  describe('日志系统浏览器兼容性', () => {
    test('IT-COMPAT-002: 日志系统应在浏览器环境中工作', () => {
      const originalConsole = global.console;

      try {
        // 模拟浏览器console
        const mockConsole = {
          log: vi.fn(),
          error: vi.fn(),
          warn: vi.fn(),
          info: vi.fn(),
          debug: vi.fn(),
        };

        // @ts-ignore - 替换全局console
        global.console = mockConsole;

        // 创建日志器
        const logger = createLogger({
          name: 'browser-test',
          level: LogLevel.INFO
        });

        // 记录日志
        logger.info('浏览器信息消息');
        logger.error('浏览器错误消息');
        logger.debug('不应显示的调试信息');

        // 验证日志输出
        expect(mockConsole.info).toHaveBeenCalled();
        expect(mockConsole.error).toHaveBeenCalled();
        expect(mockConsole.debug).not.toHaveBeenCalled(); // 级别太低
      } finally {
        // 恢复原始console
        global.console = originalConsole;
      }
    });
  });

  describe('工具函数浏览器兼容性', () => {
    test('IT-COMPAT-003: URL处理工具应跨环境工作', () => {
      // 浏览器和Node.js环境中通用的URL处理
      const testUrl = 'https://example.com/path?query=value#fragment';

      const urlParts = utils.string.parseUrl(testUrl);

      expect(urlParts.protocol).toBe('https:');
      expect(urlParts.hostname).toBe('example.com');
      expect(urlParts.pathname).toBe('/path');
      expect(urlParts.searchParams.get('query')).toBe('value');
      expect(urlParts.hash).toBe('#fragment');
    });

    test('IT-COMPAT-004: 路径工具应处理不同平台路径格式', () => {
      // Windows风格路径
      const winPath = 'C:\\Users\\test\\file.txt';
      // Unix风格路径
      const unixPath = '/Users/test/file.txt';

      // 规范化路径
      const normalizedWin = utils.path.normalize(winPath);
      const normalizedUnix = utils.path.normalize(unixPath);

      // 验证路径兼容性
      expect(utils.path.basename(normalizedWin)).toBe('file.txt');
      expect(utils.path.basename(normalizedUnix)).toBe('file.txt');

      expect(utils.path.dirname(normalizedWin).includes('Users')).toBe(true);
      expect(utils.path.dirname(normalizedUnix).includes('Users')).toBe(true);
    });

    test('IT-COMPAT-005: 存储工具应适应不同环境', () => {
      // 模拟localStorage
      const mockStorage: Record<string, string> = {};
      const originalLocalStorage = global.localStorage;

      try {
        // 使用Object.defineProperty模拟浏览器localStorage
        const mockLocalStorage = {
          getItem: vi.fn((key) => mockStorage[key] || null),
          setItem: vi.fn((key, value) => { mockStorage[key] = String(value); }),
          removeItem: vi.fn((key) => { delete mockStorage[key]; }),
          clear: vi.fn(() => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }),
          key: vi.fn((index) => Object.keys(mockStorage)[index] || null),
          get length() { return Object.keys(mockStorage).length; }
        };

        Object.defineProperty(global, 'localStorage', {
          value: mockLocalStorage,
          writable: true,
          configurable: true
        });

        // 使用存储工具
        utils.storage.set('test-key', { value: 123 });
        const retrieved = utils.storage.get('test-key');

        // 验证存储工作正常
        expect(retrieved).toEqual({ value: 123 });
        expect(global.localStorage.setItem).toHaveBeenCalled();
        expect(global.localStorage.getItem).toHaveBeenCalled();

        // 清除数据
        utils.storage.remove('test-key');
        expect(global.localStorage.removeItem).toHaveBeenCalled();
        expect(utils.storage.get('test-key')).toBeNull();
      } finally {
        // 恢复原始环境
        global.localStorage = originalLocalStorage;
      }
    });
  });

  describe('错误处理兼容性', () => {
    test('IT-COMPAT-006: 错误处理应适应不同环境的错误格式', () => {
      // 测试Node.js风格错误
      const nodeError = new Error('Node错误');
      (nodeError as any).code = 'NODE_ERR';

      // 测试浏览器风格错误
      const browserError = new Error('浏览器错误');
      (browserError as any).fileName = 'script.js';
      (browserError as any).lineNumber = 42;

      // 测试DOMException
      const domError = {
        name: 'SecurityError',
        message: 'DOM错误',
        code: 18,
        toString: () => 'SecurityError: DOM错误'
      };

      // 验证错误消息提取
      expect(utils.error.getErrorMessage(nodeError)).toBe('Node错误');
      expect(utils.error.getErrorMessage(browserError)).toBe('浏览器错误');
      expect(utils.error.getErrorMessage(domError)).toContain('DOM错误');

      // 验证错误代码提取
      expect(utils.error.getErrorCode(nodeError)).toBe('NODE_ERR');
      expect(utils.error.getErrorCode(browserError)).toBeUndefined();
      expect(utils.error.getErrorCode(domError)).toBe(18);

      // 验证错误位置提取
      const nodeLoc = utils.error.getErrorLocation(nodeError);
      const browserLoc = utils.error.getErrorLocation(browserError);

      expect(browserLoc).toHaveProperty('fileName', 'script.js');
      expect(browserLoc).toHaveProperty('lineNumber', 42);
    });
  });
});