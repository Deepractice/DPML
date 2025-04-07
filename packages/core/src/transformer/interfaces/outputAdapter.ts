import { TransformContext } from './transformContext';

/**
 * 输出适配器接口
 * 
 * 负责将转换结果适配为特定的输出格式
 */
export interface OutputAdapter {
  /**
   * 适配方法
   * 
   * 将转换结果适配为特定的输出格式
   * 
   * @param result 待适配的结果
   * @param context 转换上下文
   * @returns 适配后的结果
   */
  adapt(result: any, context: TransformContext): any;
} 