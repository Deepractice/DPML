/**
 * Transformer接口定义，所有转换器实现此接口
 * 支持泛型输入输出类型，确保类型安全
 * @template TInput 输入数据类型
 * @template TOutput 输出数据类型
 */
export interface Transformer<TInput, TOutput> {
  /**
   * 转换器名称，用于标识
   */
  name: string;

  /**
   * 转换器描述，说明功能（可选）
   */
  description?: string;

  /**
   * 执行转换的核心方法
   * @param input 输入数据，类型为TInput
   * @param context 转换上下文
   * @returns 转换后的输出，类型为TOutput
   */
  transform(input: TInput, context: TransformContext): TOutput;
}

/**
 * 从另一个文件导入，避免循环依赖
 */
import type { TransformContext } from './TransformContext';
