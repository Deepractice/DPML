/**
 * 转换服务模块
 * 模块服务层，实现业务逻辑并协调组件
 */

import type {
  ProcessingResult,
  Transformer,
  TransformOptions,
  TransformResult,
  TransformWarning,
  TransformMetadata,
  MappingRule,
  CollectorConfig,
  RelationConfig,
  SemanticExtractor
} from '../../types';
import {
  TransformContext
} from '../../types';

import { Pipeline } from './Pipeline';
import { createStructuralMapper, createAggregator, createTemplateTransformer, createRelationProcessor, createSemanticExtractor, createResultCollector } from './transformerFactory';
import { transformerRegistryFactory } from './TransformerRegistry';

/**
 * 默认转换选项
 */
const DEFAULT_OPTIONS: TransformOptions = {
  resultMode: 'full',
  context: {}
};

/**
 * 执行转换
 * @param processingResult 处理结果
 * @param options 转换选项
 * @returns 转换结果
 */
export function transform<T>(
  processingResult: ProcessingResult,
  options?: TransformOptions
): TransformResult<T> {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // 创建上下文
  const context = new TransformContext(processingResult, mergedOptions.context);

  // 获取管道
  const pipeline = getPipeline();

  // 获取转换器并过滤
  const transformers = transformerRegistryFactory().getTransformers();

  // 应用过滤器
  const filteredTransformers = applyTransformerFilters(
    transformers,
    mergedOptions.include,
    mergedOptions.exclude
  );

  // 将过滤后的转换器添加到管道
  filteredTransformers.forEach(transformer => {
    pipeline.add(transformer);
  });

  // 添加结果收集器（如果使用full或merged模式）
  if (mergedOptions.resultMode !== 'raw') {
    // 添加ResultCollectorTransformer以收集所有转换器结果
    pipeline.add(createResultCollector());
  }

  // 执行管道
  const rawResult = pipeline.execute<ProcessingResult, unknown>(processingResult, context);

  // 创建转换元数据
  const metadata: TransformMetadata = {
    transformers: filteredTransformers.map(t => t.name),
    options: mergedOptions,
    timestamp: Date.now(),
    executionTime: Date.now() - startTime
  };

  // 收集所有转换器的结果
  const transformerResults = context.getAllResults();

  // 合并结果
  const merged = deepMergeResults(transformerResults) as T;

  // 收集警告
  const warnings: TransformWarning[] = context.get<TransformWarning[]>('warnings') || [];

  // 根据结果模式创建返回值
  switch (mergedOptions.resultMode) {
    case 'raw':
      return {
        transformers: {},
        merged: {} as T,
        raw: rawResult,
        warnings,
        metadata
      };
    case 'merged':
      return {
        transformers: {},
        merged,
        warnings,
        metadata
      };
    case 'full':
    default:
      return {
        transformers: transformerResults,
        merged,
        raw: rawResult,
        warnings,
        metadata
      };
  }
}

/**
 * 深度合并转换器结果
 * @param results 转换器结果对象
 * @returns 合并后的结果对象
 */
function deepMergeResults(results: Record<string, unknown>): unknown {
  // 合并所有转换器的结果到一个对象
  const merged: Record<string, unknown> = {};

  // 遍历所有转换器结果
  for (const [key, value] of Object.entries(results)) {
    // 跳过警告和其他元数据
    if (key === 'warnings') continue;

    // 处理对象类型的值，进行深度合并
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!merged[key] || typeof merged[key] !== 'object') {
        merged[key] = {};
      }

      // 递归合并子对象
      const mergedValue = deepMergeResults({
        ...merged[key] as Record<string, unknown>,
        ...value as Record<string, unknown>
      });

      merged[key] = mergedValue;
    } else {
      // 非对象类型直接覆盖
      merged[key] = value;
    }
  }

  return merged;
}

/**
 * 注册转换器
 * @param transformer 要注册的转换器
 */
export function registerTransformer<TInput, TOutput>(
  transformer: Transformer<TInput, TOutput>
): void {
  transformerRegistryFactory().register(transformer);
}

/**
 * 注册结构映射转换器
 * @param rules 映射规则数组
 */
export function registerStructuralMapper<TInput, TOutput>(
  rules: Array<MappingRule<unknown, unknown>>
): void {
  const transformer = createStructuralMapper<TInput, TOutput>(rules);

  registerTransformer(transformer);
}

/**
 * 注册聚合转换器
 * @param config 收集配置
 */
export function registerAggregator<TInput, TOutput>(
  config: CollectorConfig
): void {
  const transformer = createAggregator<TInput, TOutput>(config);

  registerTransformer(transformer);
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
  const transformer = createTemplateTransformer<TInput>(template, preprocessor);

  registerTransformer(transformer);
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
  const transformer = createRelationProcessor<TInput, TOutput>(nodeSelector, config);

  registerTransformer(transformer);
}

/**
 * 注册语义提取转换器
 * @param extractors 提取器数组
 */
export function registerSemanticExtractor<TInput, TOutput>(
  extractors: Array<SemanticExtractor<unknown, unknown>>
): void {
  const transformer = createSemanticExtractor<TInput, TOutput>(extractors);

  registerTransformer(transformer);
}

/**
 * 获取或创建转换管道
 * @returns Pipeline实例
 */
function getPipeline(): Pipeline {
  return new Pipeline();
}

/**
 * 应用转换器过滤
 * @param transformers 所有转换器
 * @param include 包含的转换器名称
 * @param exclude 排除的转换器名称
 * @returns 过滤后的转换器数组
 */
function applyTransformerFilters(
  transformers: Array<Transformer<unknown, unknown>>,
  include?: string[],
  exclude?: string[]
): Array<Transformer<unknown, unknown>> {
  if (include && include.length > 0) {
    return transformers.filter(t => t.name && include.includes(t.name));
  }

  if (exclude && exclude.length > 0) {
    return transformers.filter(t => !t.name || !exclude.includes(t.name));
  }

  return transformers;
}
