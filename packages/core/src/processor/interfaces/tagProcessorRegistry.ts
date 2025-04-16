/**
 * 标签处理器注册表接口
 *
 * 用于管理和注册标签处理器
 */

import type { TagProcessor } from './tagProcessor';

/**
 * 标签处理器注册表接口
 *
 * 负责管理不同标签的处理器，支持一个标签注册多个处理器
 * 提供按标签名获取处理器的能力
 */
export interface TagProcessorRegistry {
  /**
   * 注册一个标签处理器
   *
   * @param tagName 标签名
   * @param processor 标签处理器
   */
  registerProcessor(tagName: string, processor: TagProcessor): void;

  /**
   * 获取指定标签的所有处理器
   *
   * @param tagName 标签名
   * @returns 处理器数组，如果没有找到相应处理器，返回空数组
   */
  getProcessors(tagName: string): TagProcessor[];
}
