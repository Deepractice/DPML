/**
 * 转换管道类
 * 协调组件，管理转换器执行顺序
 */

import type { Transformer } from '../../types/Transformer';

import type { TransformContext } from './TransformContext';

/**
 * 转换管道类
 * 管理转换器执行流程和顺序
 */
export class Pipeline {
  /**
   * 转换器数组
   */
  private transformers: Array<Transformer<unknown, unknown>> = [];

  /**
   * 添加转换器到管道
   * @param transformer 要添加的转换器
   * @returns 管道实例，支持链式调用
   */
  add<TInput, TOutput>(transformer: Transformer<TInput, TOutput>): Pipeline {
    this.transformers.push(transformer as Transformer<unknown, unknown>);

    return this;
  }

  /**
   * 顺序执行转换器
   * @param input 初始输入
   * @param context 转换上下文
   * @returns 最终转换结果
   */
  execute<TInput, TOutput>(input: TInput, context: TransformContext): TOutput {
    let result: unknown = input;

    for (const transformer of this.transformers) {
      result = transformer.transform(result, context);

      // 如果转换器有名称，将结果存储到上下文
      if (transformer.name) {
        context.set(transformer.name, result);
      }
    }

    return result as TOutput;
  }
}
