/**
 * Transformer API模拟
 * 用于单元测试和端到端测试
 */

import type {
  ProcessingResult,
  Transformer,
  TransformOptions,
  TransformResult,
  MappingRule,
  CollectorConfig,
  RelationConfig,
  SemanticExtractor
} from '../../types';

// 存储注册的转换器
const transformers: Record<string, any> = {
  structuralMapper: {},
  aggregator: {},
  templateTransformer: {},
  finalTransformer: {},
  relationProcessor: {},
  semanticExtractor: {}
};

// 模拟转换结果
const mockResult = {
  transformers: {},
  merged: {},
  warnings: []
};

/**
 * 模拟transform函数
 */
export function transform<T>(
  _processingResult: ProcessingResult,
  _options?: TransformOptions
): TransformResult<T> {
  return {
    transformers: transformers,
    merged: {} as T,
    warnings: [],
    metadata: {
      transformers: Object.keys(transformers),
      options: _options || {},
      timestamp: Date.now(),
      executionTime: 0
    }
  };
}

/**
 * 模拟注册转换器函数
 */
export function registerTransformer<TInput, TOutput>(
  transformer: Transformer<TInput, TOutput>
): void {
  if (transformer.name) {
    transformers[transformer.name] = transformer;
  }
}

/**
 * 模拟注册结构映射转换器函数
 */
export function registerStructuralMapper<TInput, TOutput>(
  rules: Array<MappingRule<unknown, unknown>>
): void {
  transformers.structuralMapper = rules;
}

/**
 * 模拟注册聚合转换器函数
 */
export function registerAggregator<TInput, TOutput>(
  config: CollectorConfig
): void {
  transformers.aggregator = config;
}

/**
 * 模拟注册模板转换器函数
 */
export function registerTemplateTransformer<TInput>(
  template: string | ((data: unknown) => string),
  _preprocessor?: (input: TInput) => unknown
): void {
  transformers.templateTransformer = template;
}

/**
 * 模拟注册关系处理转换器函数
 */
export function registerRelationProcessor<TInput, TOutput>(
  nodeSelector: string,
  config: RelationConfig
): void {
  transformers.relationProcessor = { nodeSelector, config };
}

/**
 * 模拟注册语义提取转换器函数
 */
export function registerSemanticExtractor<TInput, TOutput>(
  extractors: Array<SemanticExtractor<unknown, unknown>>
): void {
  transformers.semanticExtractor = extractors;
}
