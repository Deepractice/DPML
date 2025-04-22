/**
 * 解析结果类型定义
 * 定义DPML解析结果的标准接口
 */
import type { ParseError } from './ParseError';

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
