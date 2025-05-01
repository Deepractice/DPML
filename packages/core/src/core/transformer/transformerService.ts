/**
 * 转换服务模块
 * 模块服务层，实现业务逻辑并协调组件
 */

import type {
  ProcessingResult,
  Transformer,
  TransformMetadata,
  TransformOptions,
  TransformResult,
  TransformWarning,
} from '../../types';
import { TransformContext } from '../../types/TransformContext';
import { createResultCollector } from '../framework/transformer/transformerFactory';

import { Pipeline } from './Pipeline';
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


  // 修复：优先从上下文中获取ResultCollectorTransformer已收集的结果
  let transformerResults: Record<string, unknown>;

  // 检查是否存在由ResultCollectorTransformer设置的结果集
  if (context.has('transformerResults')) {
    transformerResults = context.get<Record<string, unknown>>('transformerResults') || {};

  } else {
    // 如果没有，则回退到直接从上下文获取所有结果
    transformerResults = context.getAllResults();

  }






  // 合并结果
  const merged = mergeResults(transformerResults) as T;



  // 收集警告
  const warnings: TransformWarning[] = context.get<TransformWarning[]>('warnings') || [];



  // 根据结果模式创建返回值
  let result: TransformResult<T>;

  switch (mergedOptions.resultMode) {
    case 'raw':
      result = {
        transformers: {},
        merged: {} as T,
        raw: rawResult,
        warnings,
        metadata
      };
      break;
    case 'merged':
      result = {
        transformers: {},
        merged,
        warnings,
        metadata
      };
      break;
    case 'full':
    default:
      result = {
        transformers: transformerResults,
        merged,
        raw: rawResult,
        warnings,
        metadata
      };
  }




  return result;
}

/**
 * 合并转换器结果
 * @param results 转换器结果对象
 * @returns 合并后的结果对象
 */
function mergeResults(results: Record<string, unknown>): unknown {
  // 创建一个存储最终合并结果的对象
  const merged: Record<string, unknown> = {};

  // 遍历所有转换器名称
  Object.keys(results).forEach(transformerName => {
    // 跳过非转换器结果
    if (transformerName === 'warnings') return;

    // 获取当前转换器的结果
    const transformerResult = results[transformerName];

    // 如果结果是对象，则合并其属性
    if (transformerResult && typeof transformerResult === 'object') {
      Object.assign(merged, transformerResult);
    }
  });

  return merged;
}

/**
 * 深度合并转换器结果
 * 注意：此函数有问题，现在使用新的mergeResults函数代替
 * @param results 转换器结果对象
 * @returns 合并后的结果对象
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
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
      merged[key] = deepMergeResults({
        ...(merged[key] as Record<string, unknown>),
        ...(value as Record<string, unknown>),
      });
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

// 导出所有转换模块服务函数作为一个对象
export const transformerService = {
  transform,
  registerTransformer
};
