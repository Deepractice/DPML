/**
 * DPML错误类型
 * 定义所有DPML处理过程中可能发生的错误
 */

/**
 * 命令重复错误
 * 当检测到重复的命令定义时抛出
 */
export class DuplicateCommandError extends Error {
  /**
   * 创建命令重复错误实例
   * @param commandPath 重复命令的路径
   */
  constructor(public readonly commandPath: string) {
    super(`Duplicate command definition: ${commandPath}`);
    this.name = 'DuplicateCommandError';

    // 确保正确的原型链
    Object.setPrototypeOf(this, DuplicateCommandError.prototype);
  }
}

/**
 * 无效命令错误
 * 当命令定义不符合要求时抛出
 */
export class InvalidCommandError extends Error {
  /**
   * 创建无效命令错误实例
   * @param message 错误消息
   * @param commandName 命令名称
   */
  constructor(message: string, public readonly commandName?: string) {
    super(commandName ? `Invalid command "${commandName}": ${message}` : message);
    this.name = 'InvalidCommandError';

    // 确保正确的原型链
    Object.setPrototypeOf(this, InvalidCommandError.prototype);
  }
}

/**
 * 命令执行错误
 * 当命令执行过程中发生错误时抛出
 */
export class CommandExecutionError extends Error {
  /**
   * 创建命令执行错误实例
   * @param message 错误消息
   * @param commandPath 命令路径
   * @param cause 原始错误
   */
  constructor(
    message: string,
    public readonly commandPath: string,
    public readonly cause?: unknown
  ) {
    super(`Error executing command "${commandPath}": ${message}`);
    this.name = 'CommandExecutionError';

    // 确保正确的原型链
    Object.setPrototypeOf(this, CommandExecutionError.prototype);
  }
}
