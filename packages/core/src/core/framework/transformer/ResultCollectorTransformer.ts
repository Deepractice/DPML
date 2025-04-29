/**
 * 结果收集转换器
 * 执行组件，实现结果收集逻辑
 */

import type { Transformer, TransformContext } from '../../../types';

/**
 * 深度合并两个对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result: Record<string, unknown> = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof result[key] === 'object' &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        // 递归合并对象
        result[key] = deepMerge(
          result[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        );
      } else {
        // 直接覆盖或添加属性
        result[key] = source[key];
      }
    }
  }

  return result as T;
}

/**
 * 结果收集转换器
 * 收集管道中各转换器的结果
 */
export class ResultCollectorTransformer<TOutput = Record<string, unknown>> implements Transformer<unknown, TOutput> {
  /**
   * 转换器名称
   */
  public name: string = 'resultCollector';

  /**
   * 转换器描述
   */
  public description: string = '收集并合并所有转换器的结果';

  /**
   * 转换器类型
   */
  public type: string = 'collector';

  /**
   * 要收集的转换器名称数组
   */
  private transformerNames?: string[];

  /**
   * 是否执行深度合并
   */
  private shouldMerge: boolean;

  /**
   * 构造函数
   * @param transformerNames 要收集的转换器名称数组，如果未提供则收集所有
   * @param shouldMerge 是否执行深度合并，默认为false
   */
  constructor(transformerNames?: string[], shouldMerge: boolean = false) {
    this.transformerNames = transformerNames;
    this.shouldMerge = shouldMerge;
  }

  /**
   * 执行结果收集转换
   * @param input 输入数据（实际上不使用）
   * @param context 转换上下文
   * @returns 收集到的结果
   */
  transform(input: unknown, context: TransformContext): TOutput {
    // a. 获取上下文中所有转换器的结果
    const allResults = context.getAllResults();

    // 日志输出当前收集到的结果，用于调试
    console.log('ResultCollectorTransformer: 收集到的结果键:', Object.keys(allResults));

    // b. 如果未指定转换器名称，返回所有结果或合并后的结果
    if (!this.transformerNames || this.transformerNames.length === 0) {
      let result: Record<string, unknown>;

      if (this.shouldMerge) {
        // 深度合并所有结果
        let mergedResult: Record<string, unknown> = {};

        for (const key in allResults) {
          if (key !== this.name && // 避免自身结果
              Object.prototype.hasOwnProperty.call(allResults, key) &&
              typeof allResults[key] === 'object' &&
              allResults[key] !== null) {
            mergedResult = deepMerge(mergedResult, allResults[key] as Record<string, unknown>);
          }
        }

        result = mergedResult;
      } else {
        result = allResults;
      }

      // 修复：将所有转换器的结果集缓存到上下文中的「transformerResults」键下
      context.set('transformerResults', allResults);

      console.log('ResultCollectorTransformer: 已将结果设置到上下文中');

      return result as TOutput;
    }

    // c. 否则，只收集指定的转换器结果
    const filteredResults: Record<string, unknown> = {};
    const warnings: Array<{transformerName: string}> = [];

    for (const name of this.transformerNames) {
      if (name in allResults) {
        filteredResults[name] = allResults[name];
      } else {
        // 记录找不到的转换器结果
        warnings.push({ transformerName: name });
      }
    }

    // d. 如果请求了合并，将收集到的结果合并
    if (this.shouldMerge && Object.keys(filteredResults).length > 0) {
      let mergedResult: Record<string, unknown> = {};

      for (const key in filteredResults) {
        if (Object.prototype.hasOwnProperty.call(filteredResults, key) &&
            typeof filteredResults[key] === 'object' &&
            filteredResults[key] !== null) {
          mergedResult = deepMerge(mergedResult, filteredResults[key] as Record<string, unknown>);
        }
      }

      filteredResults.merged = mergedResult;
    }

    // e. 如果有找不到的转换器，添加警告
    if (warnings.length > 0) {
      const warningsArray = context.get<unknown[]>('warnings') || [];

      context.set('warnings', [
        ...warningsArray,
        {
          code: 'transformer_result_not_found',
          message: `找不到以下转换器的结果: ${warnings.map(w => w.transformerName).join(', ')}`,
          transformer: this.name,
          severity: 'low'
        }
      ]);
    }

    // 修复：将过滤后的转换器结果集缓存到上下文中的「transformerResults」键下
    context.set('transformerResults', filteredResults);

    console.log('ResultCollectorTransformer: 已将过滤结果设置到上下文中');

    // f. 返回过滤后的结果或合并后的结果
    return (this.shouldMerge && 'merged' in filteredResults ?
      filteredResults.merged : filteredResults) as TOutput;
  }
} 