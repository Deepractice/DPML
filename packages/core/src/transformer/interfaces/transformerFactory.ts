import { Transformer } from './transformer';
import { TransformOptions } from './transformOptions';

/**
 * 转换器工厂接口
 * 
 * 负责创建转换器实例
 */
export interface TransformerFactory {
  /**
   * 创建转换器实例
   * 
   * @param options 可选的转换选项，用于配置创建的转换器
   * @returns 转换器实例
   */
  createTransformer(options?: TransformOptions): Transformer;
} 