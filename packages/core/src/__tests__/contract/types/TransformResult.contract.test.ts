/**
 * TransformResult接口契约测试
 * 验证TransformResult接口的结构和泛型支持
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { TransformResult, TransformOptions, TransformWarning } from '../../../types';

describe('TransformResult Interface Contract', () => {
  // CT-TYPE-RES-01
  test('TransformResult interface should maintain structural stability', () => {
    // 验证接口基础属性存在
    expectTypeOf<TransformResult<unknown>>().toHaveProperty('transformers');
    expectTypeOf<TransformResult<unknown>>().toHaveProperty('merged');
    expectTypeOf<TransformResult<unknown>>().toHaveProperty('raw');
    expectTypeOf<TransformResult<unknown>>().toHaveProperty('warnings');
    expectTypeOf<TransformResult<unknown>>().toHaveProperty('metadata');

    // 验证warnings字段的类型
    expectTypeOf<TransformResult<unknown>['warnings']>().toEqualTypeOf<TransformWarning[] | undefined>();

    // 验证metadata字段的结构
    expectTypeOf<TransformResult<unknown>['metadata']>().toHaveProperty('transformers');
    expectTypeOf<TransformResult<unknown>['metadata']>().toHaveProperty('options');
    expectTypeOf<TransformResult<unknown>['metadata']>().toHaveProperty('timestamp');
    expectTypeOf<TransformResult<unknown>['metadata']>().toHaveProperty('executionTime');

    // 验证metadata内部字段类型
    expectTypeOf<TransformResult<unknown>['metadata']['transformers']>().toEqualTypeOf<string[]>();
    expectTypeOf<TransformResult<unknown>['metadata']['options']>().toEqualTypeOf<TransformOptions>();
    expectTypeOf<TransformResult<unknown>['metadata']['timestamp']>().toBeNumber();
    expectTypeOf<TransformResult<unknown>['metadata']['executionTime']>().toEqualTypeOf<number | undefined>();
  });

  // CT-TYPE-RES-02
  test('TransformResult should support generic type T', () => {
    // 测试字符串类型
    expectTypeOf<TransformResult<string>['merged']>().toBeString();

    // 测试数字类型
    expectTypeOf<TransformResult<number>['merged']>().toBeNumber();

    // 测试布尔类型
    expectTypeOf<TransformResult<boolean>['merged']>().toBeBoolean();

    // 测试对象类型
    interface TestObject {
      id: string;
      count: number;
      isActive: boolean;
    }
    expectTypeOf<TransformResult<TestObject>['merged']>().toMatchTypeOf<TestObject>();

    // 测试数组类型
    expectTypeOf<TransformResult<number[]>['merged']>().toMatchTypeOf<number[]>();

    // 测试复杂嵌套类型
    interface ComplexType {
      users: Array<{
        id: string;
        profile: {
          age: number;
          preferences: string[];
        };
      }>;
    }
    expectTypeOf<TransformResult<ComplexType>['merged']>().toMatchTypeOf<ComplexType>();
  });

  // CT-TYPE-RES-03
  test('TransformResult.transformers should be Record type', () => {
    // 验证transformers的类型
    expectTypeOf<TransformResult<unknown>['transformers']>().toEqualTypeOf<Record<string, unknown>>();

    // 通过类型检查示例验证
    const checkTypeUsage = <T>(result: TransformResult<T>) => {
      // 验证可以通过字符串键访问
      const value = result.transformers['someTransformer'];

      // 验证键值是未知类型
      expectTypeOf(value).toEqualTypeOf<unknown>();

      // 验证可以用键值索引
      const keys = Object.keys(result.transformers);
      const values = Object.values(result.transformers);

      // 验证可以通过类型推导访问
      return {
        keys,
        values,
        // 可以通过类型转换访问具体类型
        typedValue: result.transformers['someTransformer'] as string
      };
    };

    // 确认函数的返回类型
    expectTypeOf(checkTypeUsage).returns.toHaveProperty('keys');
    expectTypeOf(checkTypeUsage).returns.toHaveProperty('values');
    expectTypeOf(checkTypeUsage).returns.toHaveProperty('typedValue');
  });
});
