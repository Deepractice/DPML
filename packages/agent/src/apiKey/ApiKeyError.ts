/**
 * API密钥错误类
 * 
 * 用于处理API密钥相关错误，包括环境变量不存在、密钥格式无效等
 */

// 错误代码枚举
export enum ApiKeyErrorCode {
  MISSING_ENV_VARIABLE = 'MISSING_ENV_VARIABLE',
  INVALID_KEY_FORMAT = 'INVALID_KEY_FORMAT',
  NO_VALID_KEY_FOUND = 'NO_VALID_KEY_FOUND',
  CONFIG_FILE_ERROR = 'CONFIG_FILE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * API密钥错误类
 */
export class ApiKeyError extends Error {
  /**
   * 错误代码
   */
  readonly code: ApiKeyErrorCode;

  /**
   * 构造函数
   * 
   * @param code 错误代码
   * @param message 错误消息
   */
  constructor(code: ApiKeyErrorCode, message: string) {
    super(message);
    this.name = 'ApiKeyError';
    this.code = code;
    
    // 为了使 instanceof 正常工作
    Object.setPrototypeOf(this, ApiKeyError.prototype);
  }
} 