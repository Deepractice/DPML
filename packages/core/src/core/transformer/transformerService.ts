/**
 * Transformer Service
 * Module service layer for transformation logic
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

import { Pipeline } from './Pipeline';
import { transformerRegistryFactory } from './TransformerRegistry';

/**
 * Creates a result collector transformer
 */
function createResultCollector(name: string): Transformer<unknown, unknown> {
  return {
    name,
    transform: (input: unknown, context: TransformContext) => {
      const results = context.getAllResults();
      context.set('transformerResults', results);
      return input;
    }
  };
}

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
    pipeline.add(createResultCollector('resultCollector'));

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
 * Merge transformer results
 * @param results Transformer results object
 * @returns Merged result object
 */
function mergeResults(results: Record<string, unknown>): unknown {
  const merged: Record<string, unknown> = {};

  Object.keys(results).forEach(transformerName => {
    if (transformerName === 'warnings') return;

    const transformerResult = results[transformerName];

    if (transformerResult && typeof transformerResult === 'object') {
      deepMerge(merged, transformerResult);
    }
  });

  return merged;
}

/**
 * 实现深度合并，特别处理数组情况
 * @param target 目标对象
 * @param source 源对象
 */
function deepMerge(target: Record<string, unknown>, source: unknown): void {
  if (!source || typeof source !== 'object') return;

  const sourceObj = source as Record<string, unknown>;

  // 遍历源对象的所有属性
  Object.keys(sourceObj).forEach(key => {
    const sourceValue = sourceObj[key];

    // 如果目标对象没有此属性，直接赋值
    if (!(key in target)) {
      target[key] = sourceValue;

      return;
    }

    const targetValue = target[key];

    // 如果两者都是数组，则合并数组
    if (Array.isArray(sourceValue)) {
      // 确保目标也是数组
      if (!Array.isArray(targetValue)) {
        target[key] = Array.isArray(sourceValue) ? [...sourceValue] : [sourceValue];
      } else {
        // 合并数组
        if (sourceValue.length > 0) {
          (target[key] as unknown[]).push(...sourceValue);
        }
      }
    } else if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      // 如果两者都是对象且非数组，递归合并
      deepMerge(targetValue as Record<string, unknown>, sourceValue);
    } else {
      // 其他情况，源对象的值覆盖目标对象
      target[key] = sourceValue;
    }
  });
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
