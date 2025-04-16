import { describe, test, expect, vi } from 'vitest';
import { createLogger, LogLevel, ConsoleTransport } from '../../logger';
import { createMockFileSystem, createMockHttpClient } from '../../testing';
import * as utils from '../../utils';
import fs from 'node:fs';
import path from 'node:path';

describe('IT-跨包集成测试', () => {
  test('IT-CROSS-001: common包应能被其他包正确集成', async () => {
    // 模拟其他包使用common的logger
    const mockConsole = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    };
    
    // 创建日志器
    const logger = createLogger({
      name: 'cross-package-test',
      level: LogLevel.INFO,
      transports: [
        new ConsoleTransport({ console: mockConsole })
      ]
    });
    
    // 记录日志
    logger.info('测试信息');
    
    // 验证日志正确记录
    expect(mockConsole.info).toHaveBeenCalledWith('测试信息');
  });
  
  test('IT-CROSS-002: 测试工具应支持跨包使用', async () => {
    // 创建模拟文件系统
    const mockFs = createMockFileSystem({
      '/config.json': '{"setting":"value"}',
      '/data/file.txt': 'content'
    });
    
    // 模拟另一个包使用模拟文件系统
    // 例如，模拟核心包的配置加载器
    class ConfigLoader {
      constructor(private fs: any) {}
      
      async loadConfig(path: string): Promise<any> {
        if (!await this.fs.exists(path)) {
          throw new Error(`配置文件 ${path} 不存在`);
        }
        
        const content = await this.fs.readFile(path);
        return JSON.parse(content);
      }
    }
    
    // 使用模拟文件系统
    const loader = new ConfigLoader(mockFs);
    const config = await loader.loadConfig('/config.json');
    
    // 验证配置正确加载
    expect(config).toEqual({ setting: 'value' });
    
    // 测试错误处理
    await expect(loader.loadConfig('/missing.json')).rejects.toThrow();
  });
  
  test('IT-CROSS-003: 各模块应协同工作', async () => {
    // 创建模拟对象
    const mockFs = createMockFileSystem({
      '/data/logs/app.log': ''
    });
    
    const mockHttp = createMockHttpClient();
    mockHttp.onGet('https://api.example.com/config').reply(200, {
      logLevel: 'DEBUG',
      enableRemoteLogging: true
    });
    
    // 模拟应用程序组件
    class AppComponent {
      private logger: any;
      private config: any = {};
      
      constructor(
        private fs: any,
        private http: any
      ) {
        this.logger = createLogger({
          name: 'app-component',
          level: LogLevel.INFO
        });
      }
      
      async initialize() {
        try {
          // 获取远程配置
          this.logger.info('正在获取远程配置...');
          const response = await this.http.get('https://api.example.com/config');
          this.config = response.data;
          
          // 更新日志级别
          if (this.config.logLevel) {
            this.logger.setLevel(LogLevel[this.config.logLevel as keyof typeof LogLevel]);
          }
          
          // 检查日志目录
          const logDir = '/data/logs';
          if (!await this.fs.exists(logDir)) {
            await this.fs.mkdir(logDir, { recursive: true });
          }
          
          this.logger.debug('初始化完成，调试信息'); // 只有在DEBUG模式才会记录
          
          return true;
        } catch (error) {
          this.logger.error(`初始化失败: ${utils.error.getErrorMessage(error)}`);
          return false;
        }
      }
      
      getConfig() {
        return utils.object.deepClone(this.config);
      }
    }
    
    // 测试组件
    const app = new AppComponent(mockFs, mockHttp);
    const result = await app.initialize();
    
    // 验证初始化成功
    expect(result).toBe(true);
    
    // 验证配置正确加载并可通过deepClone获取副本
    const config = app.getConfig();
    expect(config).toEqual({
      logLevel: 'DEBUG',
      enableRemoteLogging: true
    });
    
    // 验证API调用
    expect(mockHttp.history.get.length).toBe(1);
  });
}); 