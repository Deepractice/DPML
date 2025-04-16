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
 * @returns 带有spy的测试环境实例
 */
export function createTestEnvWithSpies(config: TestEnvironmentConfig): TestEnvironment {
  const env = createTestEnvironment(config);
  const originalSetup = env.setup;
  const originalTeardown = env.teardown;
  
  env.setup = async () => {
    return originalSetup.call(env);
  };
  
  env.teardown = async () => {
    return originalTeardown.call(env);
  };
  
  return env;
} 