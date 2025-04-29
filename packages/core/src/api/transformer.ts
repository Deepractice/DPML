/**
 * DPML转换模块API
 * 提供转换和转换器注册的入口点
 */

import { transformerService } from '../core/transformer/transformerService';
import type {
  ProcessingResult,
  Transformer,
  TransformOptions,
  TransformResult
} from '../types';

// 导入核心服务模块
// 注意：这是类型导入，实际实现在后面的任务中完成

/**
 * 执行转换过程，返回结果
 * @param processingResult 处理结果
 * @param options 转换选项
 * @returns 转换结果，类型由泛型参数T指定
 */
export function transform<T>(
  processingResult: ProcessingResult,
  options?: TransformOptions
): TransformResult<T> {
  return transformerService.transform<T>(processingResult, options);
}

/**
 * 注册自定义转换器
 * @param transformer 要注册的转换器
 */
export function registerTransformer<TInput, TOutput>(
  transformer: Transformer<TInput, TOutput>
): void {
  transformerService.registerTransformer(transformer);
}
