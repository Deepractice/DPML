/**
 * 测试用的环境变量设置和清理工具
 */
export class EnvFixture {
  private originalEnv: NodeJS.ProcessEnv;
  private testEnv: Record<string, string> = {};

  /**
   * 创建环境变量测试夹具
   * @param env 要设置的环境变量
   */
  constructor(env?: Record<string, string>) {
    // 保存原始环境
    this.originalEnv = { ...process.env };

    // 设置测试环境变量
    if (env) {
      this.set(env);
    }
  }

  /**
   * 设置环境变量
   */
  set(env: Record<string, string>): void {
    this.testEnv = { ...this.testEnv, ...env };
    Object.entries(env).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  /**
   * 删除特定环境变量
   */
  unset(keys: string[]): void {
    keys.forEach(key => {
      delete process.env[key];
      delete this.testEnv[key];
    });
  }

  /**
   * 清理所有测试环境变量，恢复原始环境
   */
  cleanup(): void {
    // 删除所有测试变量
    Object.keys(this.testEnv).forEach(key => {
      delete process.env[key];
    });

    // 恢复原始环境（可选）
    // process.env = { ...this.originalEnv };

    this.testEnv = {};
  }
}

/**
 * 创建标准测试环境
 */
export function createTestEnv(): EnvFixture {
  return new EnvFixture({
    TEST_VAR: 'test-value',
    API_KEY: 'sk-1234567890',
    SERVER_URL: 'https://api.example.com',
    USERNAME: 'testuser',
    PASSWORD: 'testpass123',
    DEBUG: 'true'
  });
}
