/**
 * 解析错误处理模块
 * 提供错误创建和处理的工具函数
 */
import {
  ParseError,
  ParseErrorCode,
  XMLParseError,
  DPMLParseError,
} from '../../types';
import type { ParseResult } from '../../types';

import type { XMLPosition } from './types';

/**
 * 创建成功的解析结果
 * @param data 解析数据
 * @param warnings 警告信息
 * @returns 解析结果
 */
export function createSuccessResult<T>(
  data: T,
  warnings: ParseError[] = []
): ParseResult<T> {
  return {
    success: true,
    data,
    warnings: warnings.length > 0 ? warnings : undefined,
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
    error,
  };
}

/**
 * 从XML位置信息创建源码位置信息
 * 辅助工具方法
 * @param position XML位置信息
 * @param fileName 文件名
 * @returns 源码位置信息
 */
export function createSourceLocation(position: XMLPosition, fileName?: string) {
  return {
    startLine: position.start.line,
    startColumn: position.start.column,
    endLine: position.end.line,
    endColumn: position.end.column,
    fileName,
  };
}

// 重新导出核心错误类型，以保持向后兼容性
export { ParseError, ParseErrorCode, XMLParseError, DPMLParseError };
export type { ParseResult };
