/**
 * 框架错误类型定义
 * 定义框架模块中可能出现的各种错误类型
 */

/**
 * 配置验证错误
 * 当提供的领域配置无效时抛出
 */
export class ConfigurationError extends Error {
  /**
   * 创建配置错误实例
   * @param message 错误消息
   */
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';

    // 确保正确的原型链
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * 编译错误
 * 当编译过程中发生错误时抛出
 */
export class CompilationError extends Error {
  /**
   * 创建编译错误实例
   * @param message 错误消息
   * @param cause 可选的原始错误
   */
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'CompilationError';

    // 确保正确的原型链
    Object.setPrototypeOf(this, CompilationError.prototype);
  }
}
