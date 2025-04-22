/**
 * DPML转换模块API
 * 提供转换和转换器注册的入口点
 */

import { transformerService } from '../core/transformer/transformerService';
import type {
  ProcessingResult,
  Transformer,
  TransformOptions,
  TransformResult,
  MappingRule,
  CollectorConfig,
  RelationConfig,
  SemanticExtractor
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

/**
 * 注册结构映射转换器
 * @param rules 映射规则数组
 */
export function registerStructuralMapper<TInput, TOutput>(
  rules: Array<MappingRule<unknown, unknown>>
): void {
  transformerService.registerStructuralMapper<TInput, TOutput>(rules);
}

/**
 * 注册聚合转换器
 * @param config 收集配置
 */
export function registerAggregator<TInput, TOutput>(
  config: CollectorConfig
): void {
  transformerService.registerAggregator<TInput, TOutput>(config);
}

/**
 * 注册模板转换器
 * @param template 模板字符串或函数
 * @param preprocessor 可选的数据预处理函数
 */
export function registerTemplateTransformer<TInput>(
  template: string | ((data: unknown) => string),
  preprocessor?: (input: TInput) => unknown
): void {
  transformerService.registerTemplateTransformer<TInput>(template, preprocessor);
}

/**
 * 注册关系处理转换器
 * @param nodeSelector 节点选择器
 * @param config 关系配置
 */
export function registerRelationProcessor<TInput, TOutput>(
  nodeSelector: string,
  config: RelationConfig
): void {
  transformerService.registerRelationProcessor<TInput, TOutput>(nodeSelector, config);
}

/**
 * 注册语义提取转换器
 * @param extractors 提取器数组
 */
export function registerSemanticExtractor<TInput, TOutput>(
  extractors: Array<SemanticExtractor<unknown, unknown>>
): void {
  transformerService.registerSemanticExtractor<TInput, TOutput>(extractors);
}
