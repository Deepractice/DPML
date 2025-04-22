/**
 * TransformOptions接口契约测试
 * 验证TransformOptions接口的结构和类型约束
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { TransformOptions } from '../../../types';

describe('TransformOptions Interface Contract', () => {
  // CT-TYPE-OPT-01
  test('TransformOptions interface should maintain structural stability', () => {
    // 验证接口的可选属性存在
    expectTypeOf<TransformOptions>().toHaveProperty('context');
    expectTypeOf<TransformOptions>().toHaveProperty('resultMode');
    expectTypeOf<TransformOptions>().toHaveProperty('include');
    expectTypeOf<TransformOptions>().toHaveProperty('exclude');

    // 验证属性的类型
    expectTypeOf<TransformOptions['context']>().toEqualTypeOf<Record<string, unknown> | undefined>();
    expectTypeOf<TransformOptions['include']>().toEqualTypeOf<string[] | undefined>();
    expectTypeOf<TransformOptions['exclude']>().toEqualTypeOf<string[] | undefined>();

    // 验证属性的可选性
    const options: TransformOptions = {};

    expectTypeOf(options).toMatchTypeOf<TransformOptions>();

    // 验证可以使用部分属性
    const partialOptions: TransformOptions = {
      context: { key: 'value' }
    };

    expectTypeOf(partialOptions).toMatchTypeOf<TransformOptions>();

    // 验证可以使用所有属性
    const fullOptions: TransformOptions = {
      context: { key: 'value' },
      resultMode: 'full',
      include: ['transformer1'],
      exclude: ['transformer2']
    };

    expectTypeOf(fullOptions).toMatchTypeOf<TransformOptions>();
  });

  // CT-TYPE-OPT-02
  test('TransformOptions.resultMode should support limited values', () => {
    // 验证resultMode的类型
    expectTypeOf<TransformOptions['resultMode']>().toEqualTypeOf<'full' | 'merged' | 'raw' | undefined>();

    // 验证只能使用指定的字面量值
    const withFull: TransformOptions = { resultMode: 'full' };
    const withMerged: TransformOptions = { resultMode: 'merged' };
    const withRaw: TransformOptions = { resultMode: 'raw' };

    expectTypeOf(withFull.resultMode).toEqualTypeOf<'full' | 'merged' | 'raw' | undefined>();
    expectTypeOf(withMerged.resultMode).toEqualTypeOf<'full' | 'merged' | 'raw' | undefined>();
    expectTypeOf(withRaw.resultMode).toEqualTypeOf<'full' | 'merged' | 'raw' | undefined>();

    // 通过示例函数验证类型约束
    function processOptions(options: TransformOptions) {
      if (options.resultMode) {
        // 这里的类型收窄应该正确工作
        switch (options.resultMode) {
          case 'full':
            return 'Processing full result';
          case 'merged':
            return 'Processing merged result';
          case 'raw':
            return 'Processing raw result';
          default: {
            // 这里应该无法到达，因为resultMode只能是上述三个值
            const exhaustiveCheck: never = options.resultMode;

            return exhaustiveCheck;
          }
        }
      }

      return 'Using default result mode';
    }

    // 确认函数的参数类型
    expectTypeOf(processOptions).parameter(0).toEqualTypeOf<TransformOptions>();

    // 验证函数处理不同模式的正确性
    const result1 = processOptions({ resultMode: 'full' });
    const result2 = processOptions({ resultMode: 'merged' });
    const result3 = processOptions({ resultMode: 'raw' });

    expectTypeOf(result1).toBeString();
    expectTypeOf(result2).toBeString();
    expectTypeOf(result3).toBeString();
  });
});
