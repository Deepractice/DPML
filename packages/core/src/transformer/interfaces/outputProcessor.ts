import { TransformContext } from './transformContext';

/**
 * 输出处理器接口
 * 负责在输出适配器处理之前对数据进行额外处理
 */
export interface OutputProcessor {
  /**
   * 处理数据
   * @param data 待处理的数据
   * @param context 转换上下文
   * @returns 处理后的数据
   */
  process(data: any, context: TransformContext): any;
} 