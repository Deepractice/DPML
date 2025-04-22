/**
 * 转换器工厂模块
 * 创建组件，负责创建转换器实例
 */

import type {
  MappingRule,
  CollectorConfig,
  RelationConfig,
  SemanticExtractor,
} from '../../types';

// 注意：这些导入是类型导入，实际实现在后续任务中完成
import { AggregatorTransformer } from './transformers/AggregatorTransformer';
import { RelationProcessorTransformer } from './transformers/RelationProcessorTransformer';
import { ResultCollectorTransformer } from './transformers/ResultCollectorTransformer';
import { SemanticExtractorTransformer } from './transformers/SemanticExtractorTransformer';
import { StructuralMapperTransformer } from './transformers/StructuralMapperTransformer';
import { TemplateTransformer } from './transformers/TemplateTransformer';

/**
 * 创建结构映射转换器
 * @param rules 映射规则数组
 * @returns 结构映射转换器实例
 */
export function createStructuralMapper<TInput, TOutput>(
  rules: Array<MappingRule<unknown, unknown>>
): StructuralMapperTransformer<TInput, TOutput> {
  return new StructuralMapperTransformer<TInput, TOutput>(rules);
}

/**
 * 创建聚合转换器
 * @param config 收集配置
 * @returns 聚合转换器实例
 */
export function createAggregator<TInput, TOutput>(
  config: CollectorConfig
): AggregatorTransformer<TInput, TOutput> {
  return new AggregatorTransformer<TInput, TOutput>(config);
}

/**
 * 创建模板转换器
 * @param template 模板字符串或函数
 * @param preprocessor 可选的数据预处理函数
 * @returns 模板转换器实例
 */
export function createTemplateTransformer<TInput>(
  template: string | ((data: unknown) => string),
  preprocessor?: (input: TInput) => unknown
): TemplateTransformer<TInput> {
  return new TemplateTransformer<TInput>(template, preprocessor);
}

/**
 * 创建关系处理转换器
 * @param nodeSelector 节点选择器
 * @param config 关系配置
 * @returns 关系处理转换器实例
 */
export function createRelationProcessor<TInput, TOutput>(
  nodeSelector: string,
  config: RelationConfig
): RelationProcessorTransformer<TInput, TOutput> {
  return new RelationProcessorTransformer<TInput, TOutput>(nodeSelector, config);
}

/**
 * 创建语义提取转换器
 * @param extractors 提取器数组
 * @returns 语义提取转换器实例
 */
export function createSemanticExtractor<TInput, TOutput>(
  extractors: Array<SemanticExtractor<unknown, unknown>>
): SemanticExtractorTransformer<TInput, TOutput> {
  return new SemanticExtractorTransformer<TInput, TOutput>(extractors);
}

/**
 * 创建结果收集转换器
 * @param transformerNames 可选的转换器名称数组，用于选择性收集
 * @returns 结果收集转换器实例
 */
export function createResultCollector<TOutput>(
  transformerNames?: string[]
): ResultCollectorTransformer<TOutput> {
  return new ResultCollectorTransformer<TOutput>(transformerNames);
}
