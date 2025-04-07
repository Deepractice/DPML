import { TagProcessor } from './tagProcessor';

/**
 * 标签处理器注册表接口
 * 
 * 负责注册和管理标签处理器
 */
export interface TagProcessorRegistry {
  /**
   * 处理器存储
   */
  processors: Map<string, TagProcessor>;
  
  /**
   * 注册处理器
   * 
   * @param tagName 标签名
   * @param processor 标签处理器
   */
  registerProcessor(tagName: string, processor: TagProcessor): void;
  
  /**
   * 获取处理器
   * 
   * @param tagName 标签名
   * @returns 标签处理器，如果不存在则返回undefined
   */
  getProcessor(tagName: string): TagProcessor | undefined;
  
  /**
   * 检查处理器是否存在
   * 
   * @param tagName 标签名
   * @returns 是否存在处理器
   */
  hasProcessor?(tagName: string): boolean;
} 