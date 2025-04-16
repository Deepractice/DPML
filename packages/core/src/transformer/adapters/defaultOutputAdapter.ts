import type { OutputAdapter } from '../interfaces/outputAdapter';
import type { TransformContext } from '../interfaces/transformContext';

/**
 * 默认输出适配器
 * 直接返回输入数据，不做任何转换
 */
export class DefaultOutputAdapter implements OutputAdapter {
  /**
   * 适配输出数据
   * @param data 输入数据
   * @param context 转换上下文
   * @returns 适配后的结果
   */
  adapt(data: any, context: TransformContext): any {
    // 默认实现只是直接返回数据
    return data;
  }
}
