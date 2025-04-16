/**
 * ProtocolHandler接口
 *
 * 定义处理不同协议引用的处理器接口
 */

import type { Reference } from '../../types/node';

/**
 * 协议处理器接口
 * 用于处理特定协议的引用
 */
export interface ProtocolHandler {
  /**
   * 检查是否可以处理指定协议
   * @param protocol 协议名称
   * @returns 是否可以处理
   */
  canHandle(protocol: string): boolean;

  /**
   * 处理引用
   * @param reference 引用节点
   * @returns 解析后的结果
   */
  handle(reference: Reference): Promise<any>;
}
