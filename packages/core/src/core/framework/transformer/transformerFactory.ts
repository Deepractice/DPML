/**
 * 转换器工厂模块
 * 创建组件，负责创建转换器实例
 */

import type {
  MappingRule,
  CollectorConfig,
  RelationConfig,
  SemanticExtractor,
} from '../../../types';

// 导入本地的转换器实现
import { AggregatorTransformer } from './AggregatorTransformer';
import { RelationProcessorTransformer } from './RelationProcessorTransformer';
import { ResultCollectorTransformer } from './ResultCollectorTransformer';
import { SemanticExtractorTransformer } from './SemanticExtractorTransformer';
import { StructuralMapperTransformer } from './StructuralMapperTransformer';
import { TemplateTransformer } from './TemplateTransformer';

/**
 * 创建结构映射转换器
 * @param name 转换器名称
 * @param rules 映射规则数组
 * @returns 结构映射转换器实例
 */
export function createStructuralMapper<TInput, TOutput>(
  name: string,
  rules: Array<MappingRule<unknown, unknown>>
): StructuralMapperTransformer<TInput, TOutput> {
  const transformer = new StructuralMapperTransformer<TInput, TOutput>(rules);

  transformer.name = name;

  return transformer;
}

/**
 * 创建聚合转换器
 * @param name 转换器名称
 * @param config 收集配置
 * @returns 聚合转换器实例
 */
export function createAggregator<TInput, TOutput>(
  name: string,
  config: CollectorConfig
): AggregatorTransformer<TInput, TOutput> {
  const transformer = new AggregatorTransformer<TInput, TOutput>(config);

  transformer.name = name;

  return transformer;
}

/**
 * 创建模板转换器
 * @param name 转换器名称
 * @param template 模板字符串或函数
 * @param preprocessor 可选的数据预处理函数
 * @returns 模板转换器实例
 */
export function createTemplateTransformer<TInput>(
  name: string,
  template: string | ((data: unknown) => string),
  preprocessor?: (input: TInput) => unknown
): TemplateTransformer<TInput> {
  const transformer = new TemplateTransformer<TInput>(template, preprocessor);

  transformer.name = name;

  return transformer;
}

/**
 * 创建关系处理转换器
 * @param name 转换器名称
 * @param nodeSelector 节点选择器
 * @param config 关系配置
 * @returns 关系处理转换器实例
 */
export function createRelationProcessor<TInput, TOutput>(
  name: string,
  nodeSelector: string,
  config: RelationConfig
): RelationProcessorTransformer<TInput, TOutput> {
  const transformer = new RelationProcessorTransformer<TInput, TOutput>(nodeSelector, config);

  transformer.name = name;

  return transformer;
}

/**
 * 创建语义提取转换器
 * @param name 转换器名称
 * @param extractors 提取器数组
 * @returns 语义提取转换器实例
 */
export function createSemanticExtractor<TInput, TOutput>(
  name: string,
  extractors: Array<SemanticExtractor<unknown, unknown>>
): SemanticExtractorTransformer<TInput, TOutput> {
  const transformer = new SemanticExtractorTransformer<TInput, TOutput>(extractors);

  transformer.name = name;

  return transformer;
}

/**
 * 创建结果收集转换器
 * @param name 转换器名称
 * @param transformerNames 可选的转换器名称数组，用于选择性收集
 * @returns 结果收集转换器实例
 */
export function createResultCollector<TOutput>(
  name: string,
  transformerNames?: string[]
): ResultCollectorTransformer<TOutput> {
  const transformer = new ResultCollectorTransformer<TOutput>(transformerNames);

  transformer.name = name;

  return transformer;
}
