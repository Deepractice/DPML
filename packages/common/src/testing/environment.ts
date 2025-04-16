/**
 * 测试环境管理工具
 *
 * 提供测试环境的设置、隔离和清理功能
 */

/**
 * 测试环境配置接口
 */
export interface TestEnvironmentConfig {
  /**
   * 环境名称
   */
  name: string;

  /**
   * 是否启用模拟时间
   */
  mockTime?: boolean;

  /**
   * 是否隔离全局对象
   */
  isolateGlobals?: boolean;

  /**
   * 环境变量集合
   */
  env?: Record<string, string>;

  /**
   * 自定义临时目录路径
   */
  tempDirPath?: string;
}

/**
 * 测试环境接口
 */
export interface TestEnvironment {
  /**
   * 环境配置
   */
  config: TestEnvironmentConfig;

  /**
   * 设置环境
   */
  setup(): Promise<void>;

  /**
   * 清理环境
   */
  teardown(): Promise<void>;

  /**
   * 重置环境状态（不完全销毁，但重置为初始状态）
   */
  reset(): Promise<void>;

  /**
   * 获取环境变量
   */
  getEnv(key: string): string | undefined;

  /**
   * 设置环境变量
   */
  setEnv(key: string, value: string): void;

  /**
   * 获取当前模拟时间（如果启用）
   */
  getCurrentTime(): Date | null;

  /**
   * 设置当前模拟时间（如果启用）
   */
  setCurrentTime(date: Date): void;

  /**
   * 前进模拟时间（如果启用）
   */
  advanceTimeBy(milliseconds: number): void;

  /**
   * 临时目录路径
   */
  tempDir: string;

  /**
   * 清理环境（与 teardown 相同）
   */
  cleanup(): Promise<void>;

  /**
   * 前进时间（与 advanceTimeBy 相同）
   */
  advanceTime?(ms: number): void;
}

/**
 * 基础测试环境实现
 */
export class BaseTestEnvironment implements TestEnvironment {
  /**
   * 环境配置
   */
  public config: TestEnvironmentConfig;

  /**
   * 环境变量备份
   */
  private envBackup: Record<string, string | undefined> = {};

  /**
   * 当前模拟时间
   */
  private mockDate: Date | null = null;

  /**
   * 原始的Date构造函数
   */
  private originalDate: DateConstructor | null = null;

  /**
   * 临时目录路径
   */
  public tempDir: string;

  /**
   * 创建基础测试环境
   *
   * @param config 环境配置
   */
  constructor(config: TestEnvironmentConfig) {
    this.config = {
      ...config,
      mockTime: config.mockTime ?? false,
      isolateGlobals: config.isolateGlobals ?? false,
      env: config.env ?? {},
    };

    // 创建临时目录
    const os = require('os');
    const path = require('path');
    const fs = require('fs');

    this.tempDir = config.tempDirPath || path.join(os.tmpdir(), `dpml-test-${config.name}-${Date.now()}`);
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 设置环境
   */
  public async setup(): Promise<void> {
    // 备份并设置环境变量
    if (this.config.env && Object.keys(this.config.env).length > 0) {
      for (const [key, value] of Object.entries(this.config.env)) {
        this.envBackup[key] = process.env[key];
        process.env[key] = value;
      }
    }

    // 设置模拟时间
    if (this.config.mockTime) {
      this.setupMockTime();
    }

    // 模拟浏览器环境，如果测试名称包含"browser"或"浏览器"
    if (this.config.name.toLowerCase().includes('browser') || 
        this.config.name.toLowerCase().includes('浏览器')) {
      // 导入环境模块并设置为浏览器环境
      try {
        const { _setEnvironmentOverrides } = require('../logger/core/environment');
        _setEnvironmentOverrides(false, true);
      } catch (error) {
        console.warn('Failed to set browser environment:', error);
      }
    }
  }

  /**
   * 清理环境
   */
  public async teardown(): Promise<void> {
    // 恢复环境变量
    for (const [key, value] of Object.entries(this.envBackup)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    this.envBackup = {};

    // 清理模拟时间
    if (this.config.mockTime) {
      this.teardownMockTime();
    }

    // 重置环境覆盖
    try {
      const { _resetEnvironmentOverrides } = require('../logger/core/environment');
      _resetEnvironmentOverrides();
    } catch (error) {
      // 忽略错误
    }

    // 清理临时目录
    await this.cleanupTempDir();
  }

  /**
   * 清理环境（与 teardown 相同）
   */
  public async cleanup(): Promise<void> {
    return this.teardown();
  }

  /**
   * 清理临时目录
   */
  private async cleanupTempDir(): Promise<void> {
    const fs = require('fs');
    const path = require('path');

    if (fs.existsSync(this.tempDir)) {
      // 递归删除目录
      const deleteFolderRecursive = (folderPath: string) => {
        if (fs.existsSync(folderPath)) {
          fs.readdirSync(folderPath).forEach((file: string) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              // 递归删除子目录
              deleteFolderRecursive(curPath);
            } else {
              // 删除文件
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(folderPath);
        }
      };

      try {
        deleteFolderRecursive(this.tempDir);
      } catch (error) {
        console.warn(`Failed to clean up temp directory ${this.tempDir}:`, error);
      }
    }
  }

  /**
   * 重置环境状态
   */
  public async reset(): Promise<void> {
    // 在不完全销毁的情况下重置环境状态
    if (this.config.mockTime && this.mockDate) {
      // 重置模拟时间为当前真实时间
      this.mockDate = new Date();
    }
  }

  /**
   * 获取环境变量
   */
  public getEnv(key: string): string | undefined {
    return process.env[key];
  }

  /**
   * 设置环境变量
   */
  public setEnv(key: string, value: string): void {
    this.envBackup[key] = this.envBackup[key] ?? process.env[key];
    process.env[key] = value;
  }

  /**
   * 获取当前模拟时间
   */
  public getCurrentTime(): Date | null {
    return this.mockDate ? new Date(this.mockDate) : null;
  }

  /**
   * 设置当前模拟时间
   */
  public setCurrentTime(date: Date): void {
    if (!this.config.mockTime) {
      throw new Error("模拟时间未启用");
    }
    this.mockDate = new Date(date);
  }

  /**
   * 前进模拟时间
   */
  public advanceTimeBy(milliseconds: number): void {
    if (!this.config.mockTime || !this.mockDate) {
      throw new Error("模拟时间未启用");
    }
    this.mockDate = new Date(this.mockDate.getTime() + milliseconds);
  }

  /**
   * 前进时间（与 advanceTimeBy 相同）
   */
  public advanceTime(ms: number): void {
    this.advanceTimeBy(ms);
  }

  /**
   * 设置模拟时间
   */
  private setupMockTime(): void {
    this.mockDate = new Date();
    this.originalDate = global.Date;

    const mockDateInstance = this.mockDate;
    const that = this;

    // @ts-ignore 重写全局Date
    global.Date = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(that.mockDate!.getTime());
        } else {
          // 明确类型转换以修复linter错误
          super(args[0] as number | string | Date);
        }
      }

      static now() {
        return that.mockDate!.getTime();
      }
    };
  }

  /**
   * 清理模拟时间
   */
  private teardownMockTime(): void {
    if (this.originalDate) {
      global.Date = this.originalDate;
      this.originalDate = null;
    }
    this.mockDate = null;
  }
}

/**
 * 创建测试环境
 *
 * @param config 环境配置
 * @returns 测试环境实例
 */
export function createTestEnvironment(config: TestEnvironmentConfig): TestEnvironment {
  return new BaseTestEnvironment(config);
}

/**
 * 使用测试环境运行函数
 *
 * @param config 环境配置
 * @param fn 要运行的函数
 * @returns 函数返回值的Promise
 */
export async function withTestEnvironment<T>(
  config: TestEnvironmentConfig,
  fn: (env: TestEnvironment) => Promise<T>
): Promise<T> {
  const env = createTestEnvironment(config);

  try {
    await env.setup();
    return await fn(env);
  } finally {
    await env.teardown();
  }
}

/**
 * 创建带有spy的测试环境
 *
 * @param config 环境配置
 * @returns 带有spy的测试环境实例和spy对象
 */
export async function createTestEnvWithSpies(config: TestEnvironmentConfig): Promise<{
  env: TestEnvironment;
  spies: {
    console: {
      log: any;
      info: any;
      warn: any;
      error: any;
      debug: any;
    };
    process: {
      exit: any;
    };
  };
}> {
  const env = createTestEnvironment(config);
  await env.setup();

  // 创建console spies
  const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    debug: jest.spyOn(console, 'debug').mockImplementation()
  };

  // 创建process spies
  const processSpy = {
    exit: jest.spyOn(process, 'exit').mockImplementation((() => {}) as any)
  };

  return {
    env,
    spies: {
      console: consoleSpy,
      process: processSpy
    }
  };
}