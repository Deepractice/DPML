import type { ValidationResult } from '../../errors/types';
import type { Document } from '../node';

/**
 * 解析选项接口
 */
export interface ParseOptions {
  /**
   * 是否允许未知标签
   * @default true
   */
  allowUnknownTags?: boolean;

  /**
   * 是否忽略验证错误继续解析
   * @default false
   */
  tolerant?: boolean;

  /**
   * 是否保留注释
   * @default false
   */
  preserveComments?: boolean;

  /**
   * 是否启用验证
   * @default false
   */
  validate?: boolean;

  /**
   * 解析模式，对应DPML的mode属性
   * @default "loose"
   */
  mode?: 'strict' | 'loose';
}

/**
 * 解析错误类型
 * @deprecated 使用errors模块中的ParseError类代替
 */
export interface ParserError {
  /**
   * 错误码
   */
  code: string;

  /**
   * 错误消息
   */
  message: string;

  /**
   * 错误位置
   */
  position?: {
    line: number;
    column: number;
    offset: number;
  };
}

/**
 * 解析警告类型
 */
export interface ParseWarning {
  /**
   * 警告码
   */
  code: string;

  /**
   * 警告消息
   */
  message: string;

  /**
   * 警告位置
   */
  position?: {
    line: number;
    column: number;
    offset: number;
  };
}

/**
 * 解析结果接口
 */
export interface ParseResult {
  /**
   * 解析生成的AST
   */
  ast: Document;

  /**
   * 解析过程中的错误
   */
  errors: Array<ParserError>; // 替换为ParserError类型

  /**
   * 解析过程中的警告
   */
  warnings: ParseWarning[];
}

/**
 * DPML解析器接口
 */
export interface DPMLParser {
  /**
   * 解析DPML文本并返回AST
   * @param input DPML文本
   * @param options 解析选项
   * @returns 解析结果
   */
  parse(input: string, options?: ParseOptions): Promise<ParseResult>;

  /**
   * 验证DPML AST是否有效
   * @param ast DPML AST
   * @returns 验证结果
   */
  validate(ast: Document): ValidationResult;
}
