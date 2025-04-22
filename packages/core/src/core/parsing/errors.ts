/**
 * 解析错误类型定义
 * 定义解析过程中可能出现的各种错误类型
 */
import { XMLPosition } from './types';
import { SourceLocation } from '../../types';

/**
 * 解析错误代码枚举
 */
export enum ParseErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'PARSE_UNKNOWN_ERROR',
  INVALID_CONTENT = 'PARSE_INVALID_CONTENT',

  // XML相关错误
  XML_SYNTAX_ERROR = 'PARSE_XML_SYNTAX_ERROR',
  XML_INVALID_TAG = 'PARSE_XML_INVALID_TAG',
  XML_MISSING_CLOSING_TAG = 'PARSE_XML_MISSING_CLOSING_TAG',
  XML_INVALID_ATTRIBUTE = 'PARSE_XML_INVALID_ATTRIBUTE',

  // DPML相关错误
  DPML_INVALID_STRUCTURE = 'PARSE_DPML_INVALID_STRUCTURE',
  DPML_INVALID_TAG = 'PARSE_DPML_INVALID_TAG',
  DPML_INVALID_ATTRIBUTE = 'PARSE_DPML_INVALID_ATTRIBUTE',
  DPML_MISSING_REQUIRED_TAG = 'PARSE_DPML_MISSING_REQUIRED_TAG',
  DPML_MISSING_REQUIRED_ATTRIBUTE = 'PARSE_DPML_MISSING_REQUIRED_ATTRIBUTE'
}

/**
 * 基础解析错误类
 * 所有解析错误的基类
 */
export class ParseError extends Error {
  /**
   * 错误代码
   */
  public readonly code: ParseErrorCode;

  /**
   * 错误位置信息
   */
  public readonly position?: SourceLocation;

  /**
   * 源代码片段
   */
  public readonly source?: string;

  /**
   * 原始错误
   */
  public readonly cause?: unknown;

  /**
   * 创建解析错误实例
   * @param message 错误消息
   * @param code 错误代码
   * @param position 位置信息
   * @param source 源代码片段
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ParseErrorCode = ParseErrorCode.UNKNOWN_ERROR,
    position?: SourceLocation,
    source?: string,
    cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.position = position;
    this.source = source;
    this.cause = cause;

    // 确保正确的原型链
    Object.setPrototypeOf(this, ParseError.prototype);
  }

  /**
   * 从XML位置信息创建源码位置信息
   * @param position XML位置信息
   * @param fileName 文件名
   * @returns 源码位置信息
   */
  static createSourceLocation(position: XMLPosition, fileName?: string): SourceLocation {
    return {
      startLine: position.start.line,
      startColumn: position.start.column,
      endLine: position.end.line,
      endColumn: position.end.column,
      fileName
    };
  }

  /**
   * 格式化错误信息，包含位置和上下文
   * @returns 格式化的错误信息
   */
  public formatMessage(): string {
    let formattedMessage = `[${this.code}] ${this.message}`;

    // 添加位置信息
    if (this.position) {
      const { startLine, startColumn, fileName } = this.position;
      const location = fileName
        ? `${fileName}:${startLine}:${startColumn}`
        : `行 ${startLine}, 列 ${startColumn}`;

      formattedMessage += `\n位置: ${location}`;
    }

    // 添加源代码片段
    if (this.source) {
      formattedMessage += `\n源码: "${this.source}"`;
    }

    // 添加原始错误信息
    if (this.cause instanceof Error) {
      formattedMessage += `\n原因: ${this.cause.message}`;
    }

    return formattedMessage;
  }

  /**
   * 重写toString方法，提供更详细的错误信息
   * @returns 格式化的错误字符串
   */
  public toString(): string {
    return this.formatMessage();
  }
}

/**
 * XML解析错误类
 * 处理XML解析过程中的错误
 */
export class XMLParseError extends ParseError {
  /**
   * 错误上下文片段
   * 包含错误位置附近的内容
   */
  public contextFragment?: string;

  /**
   * 创建XML解析错误实例
   * @param message 错误消息
   * @param code 错误代码
   * @param position 位置信息
   * @param source 源代码片段
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ParseErrorCode = ParseErrorCode.XML_SYNTAX_ERROR,
    position?: SourceLocation,
    source?: string,
    cause?: unknown
  ) {
    super(message, code, position, source, cause);

    // 确保正确的原型链
    Object.setPrototypeOf(this, XMLParseError.prototype);
  }

  /**
   * 从原始XML解析错误创建XMLParseError
   * @param error 原始错误
   * @param content XML内容
   * @param fileName 文件名
   * @returns XML解析错误
   */
  static fromError(error: unknown, content?: string, fileName?: string): XMLParseError {
    // 提取错误消息
    const message = error instanceof Error
      ? error.message
      : String(error);

    // 尝试从错误消息中提取位置信息
    const position = XMLParseError.extractPositionFromMessage(message, fileName);

    // 提取相关源代码片段
    const source = content
      ? (position
          ? XMLParseError.extractSourceSnippet(content, position.startLine, position.startColumn)
          : content.substring(0, Math.min(30, content.length)))
      : undefined;

    return new XMLParseError(
      message,
      ParseErrorCode.XML_SYNTAX_ERROR,
      position,
      source,
      error
    );
  }

  /**
   * 从错误消息中提取位置信息
   * @param message 错误消息
   * @param fileName 文件名
   * @returns 源码位置信息或undefined
   */
  private static extractPositionFromMessage(message: string, fileName?: string): SourceLocation | undefined {
    // 尝试匹配常见的位置信息格式，如"Line: 10, Column: 5"
    const lineColMatch = message.match(/[Ll]ine[:\s]+(\d+)[\s,]+[Cc]olumn[:\s]+(\d+)/);
    if (lineColMatch) {
      const startLine = parseInt(lineColMatch[1], 10);
      const startColumn = parseInt(lineColMatch[2], 10);
      return {
        startLine,
        startColumn,
        endLine: startLine,
        endColumn: startColumn + 1,
        fileName
      };
    }

    // 如果没有找到位置信息，返回undefined
    return undefined;
  }

  /**
   * 从内容中提取源代码片段
   * @param content 完整内容
   * @param line 行号
   * @param column 列号
   * @returns 源代码片段
   */
  private static extractSourceSnippet(content: string, line: number, column: number): string {
    // 将内容分割为行
    const lines = content.split('\n');

    // 确保行号在有效范围内
    if (line <= 0 || line > lines.length) {
      return '';
    }

    // 获取错误所在行 (行号从1开始，数组索引从0开始)
    const errorLine = lines[line - 1];

    // 提取上下文 (最多30个字符)
    const start = Math.max(0, column - 15);
    const end = Math.min(errorLine.length, column + 15);

    return errorLine.substring(start, end);
  }

  /**
   * 格式化错误信息，包含位置和上下文
   * @returns 格式化的错误信息
   */
  public formatMessage(): string {
    let formattedMessage = super.formatMessage();

    // 添加错误上下文片段
    if (this.contextFragment) {
      formattedMessage += `\n上下文: "${this.contextFragment}"`;
    }

    return formattedMessage;
  }
}

/**
 * DPML解析错误类
 * 处理DPML特定的解析错误
 */
export class DPMLParseError extends ParseError {
  /**
   * 创建DPML解析错误实例
   * @param message 错误消息
   * @param code 错误代码
   * @param position 位置信息
   * @param source 源代码片段
   * @param cause 原始错误
   */
  constructor(
    message: string,
    code: ParseErrorCode = ParseErrorCode.DPML_INVALID_STRUCTURE,
    position?: SourceLocation,
    source?: string,
    cause?: unknown
  ) {
    super(message, code, position, source, cause);

    // 确保正确的原型链
    Object.setPrototypeOf(this, DPMLParseError.prototype);
  }

  /**
   * 创建缺少必需标签的错误
   * @param tagName 标签名
   * @param position 位置信息
   * @returns DPML解析错误
   */
  static createMissingRequiredTagError(tagName: string, position?: SourceLocation): DPMLParseError {
    return new DPMLParseError(
      `缺少必需的标签: ${tagName}`,
      ParseErrorCode.DPML_MISSING_REQUIRED_TAG,
      position
    );
  }

  /**
   * 创建缺少必需属性的错误
   * @param attributeName 属性名
   * @param tagName 标签名
   * @param position 位置信息
   * @returns DPML解析错误
   */
  static createMissingRequiredAttributeError(
    attributeName: string,
    tagName: string,
    position?: SourceLocation
  ): DPMLParseError {
    return new DPMLParseError(
      `标签 <${tagName}> 缺少必需的属性: ${attributeName}`,
      ParseErrorCode.DPML_MISSING_REQUIRED_ATTRIBUTE,
      position
    );
  }

  /**
   * 创建无效标签错误
   * @param tagName 标签名
   * @param position 位置信息
   * @returns DPML解析错误
   */
  static createInvalidTagError(tagName: string, position?: SourceLocation): DPMLParseError {
    return new DPMLParseError(
      `无效的DPML标签: ${tagName}`,
      ParseErrorCode.DPML_INVALID_TAG,
      position
    );
  }

  /**
   * 创建无效属性错误
   * @param attributeName 属性名
   * @param tagName 标签名
   * @param position 位置信息
   * @returns DPML解析错误
   */
  static createInvalidAttributeError(
    attributeName: string,
    tagName: string,
    position?: SourceLocation
  ): DPMLParseError {
    return new DPMLParseError(
      `标签 <${tagName}> 包含无效的属性: ${attributeName}`,
      ParseErrorCode.DPML_INVALID_ATTRIBUTE,
      position
    );
  }
}

/**
 * 解析结果接口
 * 用于非抛出错误模式下的返回结构
 */
export interface ParseResult<T> {
  /**
   * 解析是否成功
   */
  success: boolean;

  /**
   * 解析结果数据
   * 仅在success为true时存在
   */
  data?: T;

  /**
   * 解析错误
   * 仅在success为false时存在
   */
  error?: ParseError;

  /**
   * 警告信息
   * 可能在success为true时也存在
   */
  warnings?: ParseError[];
}

/**
 * 创建成功的解析结果
 * @param data 解析数据
 * @param warnings 警告信息
 * @returns 解析结果
 */
export function createSuccessResult<T>(data: T, warnings: ParseError[] = []): ParseResult<T> {
  return {
    success: true,
    data,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * 创建失败的解析结果
 * @param error 解析错误
 * @returns 解析结果
 */
export function createErrorResult<T>(error: ParseError): ParseResult<T> {
  return {
    success: false,
    error
  };
}
