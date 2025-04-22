/**
 * 转换管道类
 * 协调组件，管理转换器执行顺序
 */

import { Transformer } from '../../types/Transformer';
import { TransformContext } from '../../types/TransformContext';

/**
 * Pipeline是一个协调组件，负责管理转换器链、顺序执行转换器、
 * 在转换器之间传递数据和上下文，并支持类型安全的转换流程。
 */
export class Pipeline {
  /**
   * 转换器数组
   */
  private transformers: Array<Transformer<unknown, unknown>> = [];
  
  /**
   * 添加转换器到管道
   * @param transformer 要添加的转换器
   * @returns Pipeline实例，支持链式调用
   */
  public add<TInput, TOutput>(transformer: Transformer<TInput, TOutput>): Pipeline {
    this.transformers.push(transformer);
    return this;
  }
  
  /**
   * 按顺序执行所有转换器
   * @param input 初始输入数据
   * @param context 转换上下文
   * @returns 最后一个转换器的输出
   */
  public execute<TInput, TOutput>(input: TInput, context: TransformContext): TOutput {
    if (this.transformers.length === 0) {
      return input as unknown as TOutput;
    }

    let result: unknown = input;

    try {
      // 按顺序执行每个转换器
      for (const transformer of this.transformers) {
        // 前一个转换器的输出作为下一个的输入
        result = transformer.transform(result, context);
        
        // 如果转换器有名称，将结果存储到上下文
        if (transformer.name) {
          context.set(transformer.name, result);
        }
      }

      return result as TOutput;
    } catch (error) {
      // 捕获并重新抛出异常，可在此处添加日志或处理逻辑
      console.error('Pipeline execution error:', error);
      throw error;
    }
  }
} 