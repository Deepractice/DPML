import type { SourceLocation } from './SourceLocation';

/**
 * 解析错误类
 * 表示DPML解析过程中发生的错误
 */
export class ParseError extends Error {
  /**
   * 错误发生的源代码位置
   */
  readonly location: SourceLocation;

  /**
   * 额外的错误上下文信息
   */
  readonly context?: Record<string, unknown>;

  /**
   * 修复建议
   */
  readonly suggestion?: string;

  /**
   * 创建解析错误实例
   * @param message 错误消息
   * @param location 错误位置
   * @param options 额外选项
   */
  constructor(
    message: string,
    location: SourceLocation,
    options?: {
      context?: Record<string, unknown>;
      suggestion?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'ParseError';
    this.location = location;
    this.context = options?.context;
    this.suggestion = options?.suggestion;

    // 设置错误原因（Node.js v16.9.0+）
    if (options?.cause) {
      // 使用类型断言，这里不能避免使用any，因为Error类型没有cause属性
      // 但我们可以通过在类型声明中添加类型来避免这个问题
      (this as unknown as { cause: Error }).cause = options.cause;
    }

    // 确保正确的原型链，适用于TypeScript中的类继承
    Object.setPrototypeOf(this, ParseError.prototype);
  }

  /**
   * 获取格式化的错误消息，包含位置信息
   */
  getFormattedMessage(): string {
    const { startLine, startColumn, fileName } = this.location;
    const fileInfo = fileName ? `${fileName}:` : '';
    const locationInfo = `${fileInfo}${startLine}:${startColumn}`;

    let message = `${this.name}: ${this.message} at ${locationInfo}`;

    // 添加代码片段（如果有）
    const snippet = this.location.getLineSnippet();

    if (snippet) {
      message += `\n${snippet}`;
    }

    // 添加修复建议（如果有）
    if (this.suggestion) {
      message += `\n提示: ${this.suggestion}`;
    }

    return message;
  }
}
