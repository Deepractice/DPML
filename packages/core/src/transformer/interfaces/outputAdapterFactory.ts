import { OutputAdapter } from './outputAdapter';

/**
 * 适配器工厂配置选项
 */
export interface OutputAdapterFactoryOptions {
  /**
   * 默认适配器名称
   */
  defaultAdapter?: string;
  
  /**
   * 是否严格匹配
   * 
   * 如果为true，则只返回完全匹配的适配器
   * 如果为false，则在没有找到完全匹配时尝试使用默认适配器
   */
  strictMatching?: boolean;
}

/**
 * 输出适配器工厂
 * 
 * 负责创建和管理适配器实例，根据格式选择合适的适配器
 */
export interface OutputAdapterFactory {
  /**
   * 注册适配器
   * 
   * @param name 适配器名称/类型
   * @param adapter 适配器实例或工厂函数
   */
  register(name: string, adapter: OutputAdapter | (() => OutputAdapter)): void;
  
  /**
   * 获取适配器
   * 
   * @param format 输出格式名称
   * @returns 对应的适配器，如果未找到则返回默认适配器或null
   */
  getAdapter(format: string): OutputAdapter | null;
  
  /**
   * 检查是否支持指定格式
   * 
   * @param format 输出格式名称
   * @returns 是否支持该格式
   */
  supportsFormat(format: string): boolean;
  
  /**
   * 获取所有已注册的适配器名称
   * 
   * @returns 适配器名称数组
   */
  getRegisteredFormats(): string[];
  
  /**
   * 设置默认适配器
   * 
   * @param name 适配器名称
   */
  setDefaultAdapter(name: string): void;
} 