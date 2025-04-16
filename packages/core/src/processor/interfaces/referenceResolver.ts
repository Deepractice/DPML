/**
 * ReferenceResolver接口
 *
 * 定义解析引用的解析器接口
 */

import type { Reference } from '@core/types/node';

import type { ProcessingContext } from './processingContext';
import type { ProtocolHandler } from './protocolHandler';

/**
 * 已解析的引用接口
 */
export interface ResolvedReference {
  /**
   * 原始引用
   */
  reference: Reference;

  /**
   * 解析后的值
   */
  value: any;

  /**
   * 解析内容（兼容旧接口）
   */
  content?: any;

  /**
   * 解析时间戳（兼容旧接口）
   */
  timestamp?: number;
}

/**
 * 引用解析器接口
 * 负责解析各种引用
 */
export interface ReferenceResolver {
  /**
   * 解析引用
   * @param reference 引用节点
   * @param context 处理上下文
   * @returns 解析后的引用
   */
  resolve(
    reference: Reference,
    context: ProcessingContext
  ): Promise<ResolvedReference>;

  /**
   * 获取指定协议的处理器
   * @param protocol 协议名称
   * @returns 协议处理器，未找到则返回undefined
   */
  getProtocolHandler(protocol: string): ProtocolHandler | undefined;

  /**
   * 注册协议处理器
   * @param handler 协议处理器
   */
  registerProtocolHandler(handler: ProtocolHandler): void;
}
