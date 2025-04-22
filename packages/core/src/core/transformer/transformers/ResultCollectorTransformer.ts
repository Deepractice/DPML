/**
 * 结果收集转换器
 * 执行组件，实现结果收集逻辑
 */

import type { Transformer, TransformContext } from '../../../types';

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
   * 构造函数
   * @param transformerNames 要收集的转换器名称数组，如果未提供则收集所有
   */
  constructor(transformerNames?: string[]) {
    this.transformerNames = transformerNames;
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
    
    // b. 如果未指定转换器名称，返回所有结果
    if (!this.transformerNames || this.transformerNames.length === 0) {
      return allResults as TOutput;
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

    // d. 如果有找不到的转换器，添加警告
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

    // e. 返回过滤后的结果
    return filteredResults as TOutput;
  }
}
