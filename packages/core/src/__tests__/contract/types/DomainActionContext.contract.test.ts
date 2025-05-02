/**
 * DomainActionContext接口契约测试
 * 验证DomainActionContext接口的结构和类型约束
 */

import { describe, test, expectTypeOf } from 'vitest';

import type { CompileOptions } from '../../../types/CompileOptions';
import type { DomainActionContext } from '../../../types/DomainAction';
import type { DomainCompiler } from '../../../types/DomainCompiler';

describe('DomainActionContext Interface Contract', () => {
  // CT-TYPE-DACTX-01: DomainActionContext接口应维持结构稳定性
  test('CT-TYPE-DACTX-01: DomainActionContext接口应维持结构稳定性', () => {
    // 验证接口的必要方法存在
    expectTypeOf<DomainActionContext>().toHaveProperty('getCompiler');
    expectTypeOf<DomainActionContext>().toHaveProperty('getDomain');
    expectTypeOf<DomainActionContext>().toHaveProperty('getDescription');
    expectTypeOf<DomainActionContext>().toHaveProperty('getOptions');

    // 验证方法的类型
    expectTypeOf<DomainActionContext['getCompiler']>().toMatchTypeOf<
      <T = unknown>() => DomainCompiler<T>
    >();
    expectTypeOf<DomainActionContext['getDomain']>().toMatchTypeOf<() => string>();
    expectTypeOf<DomainActionContext['getDescription']>().toMatchTypeOf<() => string>();
    expectTypeOf<DomainActionContext['getOptions']>().toMatchTypeOf<() => Required<CompileOptions>>();
  });

  // CT-TYPE-DACTX-02: DomainActionContext应实现所有必要方法
  test('CT-TYPE-DACTX-02: DomainActionContext应实现所有必要方法', () => {
    // 创建测试实现以验证接口兼容性
    const mockContext: DomainActionContext = {
      getCompiler<T>() {
        return {} as DomainCompiler<T>;
      },
      getDomain() {
        return 'test-domain';
      },
      getDescription() {
        return 'Test domain description';
      },
      getOptions() {
        return {
          strictMode: true,
          validateOnCompile: true,
          errorHandling: 'throw',
          transformOptions: {
            keepOriginalData: false
          },
          custom: {}
        } as Required<CompileOptions>;
      }
    };

    // 验证实现的类型兼容性
    expectTypeOf(mockContext).toMatchTypeOf<DomainActionContext>();
    expectTypeOf(mockContext.getCompiler).toBeFunction();
    expectTypeOf(mockContext.getDomain).toBeFunction();
    expectTypeOf(mockContext.getDescription).toBeFunction();
    expectTypeOf(mockContext.getOptions).toBeFunction();
  });
});
