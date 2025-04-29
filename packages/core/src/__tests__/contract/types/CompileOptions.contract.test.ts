/**
 * CompileOptions接口契约测试
 * 验证CompileOptions接口的结构和类型约束
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { CompileOptions, TransformOptions } from '../../../types';

describe('CompileOptions Interface Contract', () => {
  // CT-TYPE-COPTS-01: CompileOptions接口应维持结构稳定性
  test('CT-TYPE-COPTS-01: CompileOptions接口应维持结构稳定性', () => {
    // 验证接口的属性存在
    expectTypeOf<CompileOptions>().toHaveProperty('strictMode');
    expectTypeOf<CompileOptions>().toHaveProperty('errorHandling');
    expectTypeOf<CompileOptions>().toHaveProperty('transformOptions');
    expectTypeOf<CompileOptions>().toHaveProperty('custom');

    // 验证属性的类型
    expectTypeOf<CompileOptions['strictMode']>().toMatchTypeOf<boolean | undefined>();
    expectTypeOf<CompileOptions['errorHandling']>().toMatchTypeOf<'throw' | 'warn' | 'silent' | undefined>();
    expectTypeOf<CompileOptions['transformOptions']>().toMatchTypeOf<TransformOptions | undefined>();
    expectTypeOf<CompileOptions['custom']>().toMatchTypeOf<Record<string, any> | undefined>();

    // 验证所有属性都是可选的
    const emptyOptions: CompileOptions = {};

    expectTypeOf(emptyOptions).toMatchTypeOf<CompileOptions>();

    // 验证可以使用部分属性
    const partialOptions: CompileOptions = {
      strictMode: true,
      errorHandling: 'throw'
    };

    expectTypeOf(partialOptions).toMatchTypeOf<CompileOptions>();

    // 验证可以使用所有属性
    const fullOptions: CompileOptions = {
      strictMode: true,
      errorHandling: 'warn',
      transformOptions: {
        resultMode: 'merged'
      },
      custom: {
        maxRetries: 3,
        timeout: 1000
      }
    };

    expectTypeOf(fullOptions).toMatchTypeOf<CompileOptions>();
  });

  // CT-TYPE-COPTS-02: CompileOptions.errorHandling应支持限定值
  test('CT-TYPE-COPTS-02: CompileOptions.errorHandling应支持限定值', () => {
    // 验证errorHandling支持'throw'
    const throwOptions: CompileOptions = {
      errorHandling: 'throw'
    };

    expectTypeOf(throwOptions.errorHandling).toMatchTypeOf<'throw' | 'warn' | 'silent' | undefined>();

    // 验证errorHandling支持'warn'
    const warnOptions: CompileOptions = {
      errorHandling: 'warn'
    };

    expectTypeOf(warnOptions.errorHandling).toMatchTypeOf<'throw' | 'warn' | 'silent' | undefined>();

    // 验证errorHandling支持'silent'
    const silentOptions: CompileOptions = {
      errorHandling: 'silent'
    };

    expectTypeOf(silentOptions.errorHandling).toMatchTypeOf<'throw' | 'warn' | 'silent' | undefined>();

    // 验证不接受其他值
    // 注：无法在测试中验证编译错误，这只能在编译时被捕获
    // 以下注释用于演示类型检查错误
    // const invalidOptions: CompileOptions = {
    //   errorHandling: 'invalid' // 类型错误：'invalid'不是有效的errorHandling值
    // };

    // 验证联合类型的完整性
    type ErrorHandling = NonNullable<CompileOptions['errorHandling']>;
    expectTypeOf<ErrorHandling>().toEqualTypeOf<'throw' | 'warn' | 'silent'>();
  });
});
