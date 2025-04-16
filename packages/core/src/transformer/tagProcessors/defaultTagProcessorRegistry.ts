import type { TagProcessor } from '../interfaces/tagProcessor';
import type { TagProcessorRegistry } from '../interfaces/tagProcessorRegistry';

/**
 * 标签处理器注册表的默认实现，用于管理和检索标签处理器
 */
export class DefaultTagProcessorRegistry implements TagProcessorRegistry {
  /**
   * 存储标签名称到处理器列表的映射
   * 特殊键 '*' 用于存储通配符处理器
   */
  private processorMap: Map<string, TagProcessor[]> = new Map();

  /**
   * 处理器映射 - 符合接口要求
   */
  get processors(): Map<string, TagProcessor> {
    // 创建一个新的Map，每个标签只保留优先级最高的处理器
    const result = new Map<string, TagProcessor>();

    for (const [tagName, processors] of this.processorMap.entries()) {
      if (processors.length > 0) {
        // 取优先级最高的处理器
        result.set(tagName, processors[0]);
      }
    }

    return result;
  }

  /**
   * 创建一个新的标签处理器注册表
   */
  constructor() {
    this.clear();
  }

  /**
   * 为指定的标签注册一个处理器
   * @param tagName 标签名称
   * @param processor 要注册的处理器
   */
  registerProcessor(tagName: string, processor: TagProcessor): void {
    const processors = this.processorMap.get(tagName) || [];

    // 添加处理器并按优先级排序（优先级高的排在前面）
    processors.push(processor);
    processors.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    this.processorMap.set(tagName, processors);
  }

  /**
   * 获取指定标签的处理器
   * @param tagName 标签名称
   * @returns 优先级最高的处理器，如果不存在则返回undefined
   */
  getProcessor(tagName: string): TagProcessor | undefined {
    const processors = this.processorMap.get(tagName) || [];

    return processors.length > 0 ? processors[0] : undefined;
  }

  /**
   * 获取指定标签的所有处理器
   * @param tagName 标签名称
   * @returns 处理器数组，按优先级排序
   */
  getProcessors(tagName: string): TagProcessor[] {
    // 获取特定标签的处理器
    const specificProcessors = this.processorMap.get(tagName) || [];

    // 获取通配符处理器
    const wildcardProcessors = this.processorMap.get('*') || [];

    // 合并并按优先级排序
    return [...specificProcessors, ...wildcardProcessors].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );
  }

  /**
   * 检查是否存在指定标签的处理器
   * @param tagName 标签名称
   * @returns 如果存在处理器则返回true，否则返回false
   */
  hasProcessors(tagName: string): boolean {
    // 检查特定标签处理器
    const hasSpecific =
      this.processorMap.has(tagName) &&
      (this.processorMap.get(tagName)?.length || 0) > 0;

    // 检查通配符处理器
    const hasWildcard =
      this.processorMap.has('*') &&
      (this.processorMap.get('*')?.length || 0) > 0;

    return hasSpecific || hasWildcard;
  }

  /**
   * 检查是否存在指定标签的处理器
   * @param tagName 标签名称
   * @returns 如果存在处理器则返回true，否则返回false
   */
  hasProcessor(tagName: string): boolean {
    return this.getProcessor(tagName) !== undefined;
  }

  /**
   * 为多个标签注册同一个处理器
   * @param tagNames 标签名称数组
   * @param processor 要注册的处理器
   */
  registerProcessorForTags(tagNames: string[], processor: TagProcessor): void {
    for (const tagName of tagNames) {
      this.registerProcessor(tagName, processor);
    }
  }

  /**
   * 注册一个通配符处理器，适用于所有标签
   * @param processor 要注册的处理器
   */
  registerWildcardProcessor(processor: TagProcessor): void {
    this.registerProcessor('*', processor);
  }

  /**
   * 移除指定标签的所有处理器
   * @param tagName 标签名称
   */
  removeProcessors(tagName: string): void {
    this.processorMap.delete(tagName);
  }

  /**
   * 清空注册表中的所有处理器
   */
  clear(): void {
    this.processorMap.clear();
    // 初始化通配符处理器数组
    this.processorMap.set('*', []);
  }
}
