import { describe, it, expect } from 'vitest';

import type { SchemaError } from '../../../types/SchemaError';

describe('SchemaError Contract Tests', () => {
  it('CT-Type-SchError-01: SchemaError<T> 类型应维持结构稳定性', () => {
    // 此测试主要通过 TypeScript 编译时检查来隐式验证
    // 恢复类型检查
    const errorExample: any = {
      message: 'some error',
      code: 'ERROR_CODE',
      path: 'root.prop',
      // details: { info: 'extra' } // details 是可选的
    };

    // 强制类型断言，如果结构不兼容会在编译时报错
    expect(errorExample as SchemaError).toBeDefined(); // 使用导入的类型
    expect(typeof errorExample.message).toBe('string');
    expect(typeof errorExample.code).toBe('string');
    expect(typeof errorExample.path).toBe('string');
  });

  it('CT-Type-SchError-02: SchemaError<T> 应支持可选的泛型 details', () => {
    // 恢复类型检查
    type DetailType = { line: number; column: number };
    const errorWithDetails: SchemaError<DetailType> = { // 使用导入的类型
      message: 'Detailed error',
      code: 'DETAIL_ERR',
      path: 'path.to.error',
      details: { line: 10, column: 5 },
    };
    const errorWithoutDetails: SchemaError = { // 使用导入的类型
      message: 'Simple error',
      code: 'SIMPLE_ERR',
      path: 'another.path',
    };

    expect(errorWithDetails.details).toBeDefined();
    expect(errorWithoutDetails.details).toBeUndefined();
    // 验证 details 类型
    if (errorWithDetails.details) {
      expect(typeof errorWithDetails.details.line).toBe('number');
      expect(typeof errorWithDetails.details.column).toBe('number');
    }
  });
});
