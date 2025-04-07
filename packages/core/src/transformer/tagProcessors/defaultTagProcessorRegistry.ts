import { TagProcessor, TagProcessorRegistry } from '../interfaces/tagProcessor';

/**
 * 默认标签处理器注册表实现
 * 
 * 管理特定标签的处理器集合，实现标签处理器的注册、查询功能
 */
export class DefaultTagProcessorRegistry implements TagProcessorRegistry {
  /**
   * 标签到处理器的映射
   * @private
   */
  private processorMap: Map<string, TagProcessor[]> = new Map();
  
  /**
   * 构造函数
   */
  constructor() {}
  
  /**
   * 注册标签处理器
   * @param tagName 标签名称
   * @param processor 处理器实例
   */
  registerProcessor(tagName: string, processor: TagProcessor): void {
    // 获取该标签的现有处理器列表，如果不存在则创建新列表
    const processors = this.processorMap.get(tagName) || [];
    
    // 添加新处理器
    processors.push(processor);
    
    // 更新映射
    this.processorMap.set(tagName, processors);
  }
  
  /**
   * 获取标签的所有处理器
   * @param tagName 标签名称
   * @returns 处理器数组
   */
  getProcessors(tagName: string): TagProcessor[] {
    return this.processorMap.get(tagName) || [];
  }
  
  /**
   * 检查是否有处理器可以处理指定标签
   * @param tagName 标签名称
   * @returns 如果有处理器返回true，否则返回false
   */
  hasProcessors(tagName: string): boolean {
    const processors = this.processorMap.get(tagName);
    return !!processors && processors.length > 0;
  }
  
  /**
   * 为多个标签注册同一个处理器
   * @param tagNames 标签名称数组
   * @param processor 处理器实例
   */
  registerProcessorForTags(tagNames: string[], processor: TagProcessor): void {
    for (const tagName of tagNames) {
      this.registerProcessor(tagName, processor);
    }
  }
  
  /**
   * 注册通配符处理器
   * 这种处理器会处理任何标签
   * @param processor 处理器实例
   */
  registerWildcardProcessor(processor: TagProcessor): void {
    this.registerProcessor('*', processor);
  }
  
  /**
   * 移除标签的所有处理器
   * @param tagName 标签名称
   */
  removeProcessors(tagName: string): void {
    this.processorMap.delete(tagName);
  }
  
  /**
   * 清空所有处理器
   */
  clear(): void {
    this.processorMap.clear();
  }
} 