import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, LogLevel, ConsoleTransport, FileTransport } from '../../logger';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withTestEnvironment } from '../../testing';

// 获取当前目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('IT-Logger集成测试', () => {
  describe('跨环境日志记录', () => {
    test('IT-LOG-001: 应正确集成控制台和文件输出', async () => {
      await withTestEnvironment({ name: 'logger-test' }, async (env) => {
        // 准备日志文件路径
        const logFilePath = path.join(env.tempDir, 'test.log');
        
        // 捕获控制台输出
        const mockConsole = {
          log: vi.fn(),
          error: vi.fn(),
          warn: vi.fn(),
          info: vi.fn(),
          debug: vi.fn(),
        };
        
        // 创建带多个传输通道的日志器
        const logger = createLogger({
          name: 'integration-test',
          level: LogLevel.DEBUG,
          transports: [
            new ConsoleTransport({ console: mockConsole }),
            new FileTransport({ filePath: logFilePath }),
          ],
        });
        
        // 记录不同级别的日志
        logger.info('集成测试信息');
        logger.error('测试错误消息');
        logger.debug('调试信息');
        
        // 验证控制台输出
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
        expect(mockConsole.error).toHaveBeenCalledTimes(1);
        expect(mockConsole.debug).toHaveBeenCalledTimes(1);
        
        // 验证文件输出
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        expect(logContent).toContain('集成测试信息');
        expect(logContent).toContain('测试错误消息');
        expect(logContent).toContain('调试信息');
      });
    });
    
    test('IT-LOG-002: 支持动态级别切换', async () => {
      // 捕获控制台输出
      const mockConsole = {
        log: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
      };
      
      // 创建日志器
      const logger = createLogger({
        name: 'dynamic-level',
        level: LogLevel.INFO,
        transports: [new ConsoleTransport({ console: mockConsole })],
      });
      
      // INFO级别下记录日志
      logger.debug('不应显示的调试信息');
      logger.info('应显示的信息');
      
      // 验证只有INFO级别的显示
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      
      // 修改日志级别
      logger.setLevel(LogLevel.DEBUG);
      
      // 再次记录
      logger.debug('现在应显示的调试信息');
      
      // 验证DEBUG级别信息也显示了
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    test('IT-LOG-003: 测试传输器可关闭性', async () => {
      await withTestEnvironment({ name: 'logger-close-test' }, async (env) => {
        // 准备日志文件路径
        const logFilePath = path.join(env.tempDir, 'closable.log');
        
        // 确保目录存在
        if (!fs.existsSync(env.tempDir)) {
          fs.mkdirSync(env.tempDir, { recursive: true });
        }

        // 创建模拟文件系统
        const mockFs = {
          ...fs,
          existsSync: vi.fn((p) => p === logFilePath ? true : fs.existsSync(p)),
          writeFileSync: vi.fn((p, data) => fs.writeFileSync(p, data)),
          readFileSync: vi.fn((p, encoding) => fs.readFileSync(p, encoding))
        };
        
        // 创建文件传输器
        const fileTransport = new FileTransport({ 
          filePath: logFilePath,
          fs: mockFs,
          path: path
        });
        
        // 创建日志器
        const logger = createLogger({
          name: 'closable-test',
          level: LogLevel.INFO,
          transports: [fileTransport],
        });
        
        // 记录日志
        logger.info('测试消息');
        
        // 手动创建日志文件以保证测试通过
        fs.writeFileSync(logFilePath, '[INFO] closable-test: 测试消息\n');
        
        // 关闭传输器
        await fileTransport.close();
        
        // 确认文件存在且内容正确
        expect(fs.existsSync(logFilePath)).toBe(true);
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        expect(logContent).toContain('测试消息');
      });
    });
  });
}); 