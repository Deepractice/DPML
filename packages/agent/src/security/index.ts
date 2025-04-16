/**
 * 安全模块
 *
 * 提供各种安全功能，包括输入验证、路径安全、日志安全和敏感信息保护
 */

// 导出输入净化器
export * from './InputSanitizer';

// 导出安全日志记录器
export * from './SecureLogger';

// 导出路径安全工具
export * from './PathSanitizer';

/**
 * 安全相关常量
 */
export const SecurityConstants = {
  /**
   * 常见敏感环境变量名模式
   */
  SENSITIVE_ENV_PATTERNS: [
    /^API_?KEY/i,
    /^SECRET/i,
    /^TOKEN/i,
    /^PASSWORD/i,
    /^CREDENTIAL/i,
    /^PRIVATE_?KEY/i,
  ],

  /**
   * 常见安全文件扩展名
   */
  SAFE_FILE_EXTENSIONS: ['.txt', '.json', '.xml', '.csv', '.md', '.log'],

  /**
   * 默认日志敏感字段
   */
  SENSITIVE_LOG_FIELDS: [
    'password',
    'apiKey',
    'token',
    'secret',
    'authorization',
    'credential',
  ],
};

/**
 * 安全相关工具函数
 */
export const SecurityUtils = {
  /**
   * 检查环境变量名是否敏感
   *
   * @param envName 环境变量名
   * @returns 是否敏感
   */
  isSensitiveEnvName(envName: string): boolean {
    return SecurityConstants.SENSITIVE_ENV_PATTERNS.some(pattern =>
      pattern.test(envName)
    );
  },

  /**
   * 安全地获取环境变量值
   *
   * @param envName 环境变量名
   * @param defaultValue 默认值
   * @returns 环境变量值或默认值
   */
  safeGetEnv(envName: string, defaultValue: string = ''): string {
    const value = process.env[envName];

    return value || defaultValue;
  },

  /**
   * 检查环境变量是否存在但不获取实际值
   *
   * @param envName 环境变量名
   * @returns 是否存在
   */
  envExists(envName: string): boolean {
    return envName in process.env && !!process.env[envName];
  },

  /**
   * 安全地获取多个环境变量
   *
   * @param envNames 环境变量名数组
   * @returns 存在的环境变量名数组
   */
  getExistingEnvs(envNames: string[]): string[] {
    return envNames.filter(name => this.envExists(name));
  },

  /**
   * 检查文件扩展名是否安全
   *
   * @param filename 文件名
   * @param safeExtensions 安全扩展名数组
   * @returns 是否安全
   */
  isSafeFileExtension(
    filename: string,
    safeExtensions: string[] = SecurityConstants.SAFE_FILE_EXTENSIONS
  ): boolean {
    const ext = filename.toLowerCase().split('.').pop();

    if (!ext) return false;

    return safeExtensions.includes(`.${ext}`);
  },
};
