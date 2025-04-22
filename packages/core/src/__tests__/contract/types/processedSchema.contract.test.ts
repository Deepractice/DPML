import { describe, it, expect } from 'vitest';

import type { ProcessedSchema } from '../../../types/ProcessedSchema';
// import type { SchemaError } from '../../../types/SchemaError'; // ProcessedSchema 依赖它，但测试文件本身可能不需要直接导入

describe('ProcessedSchema Contract Tests', () => {
  it('CT-Type-ProcSchema-01: ProcessedSchema<T> 类型应维持结构稳定性', () => {
    // 同样，主要通过编译时检查
    interface SampleSchema { prop: string }
    const validResult: ProcessedSchema<SampleSchema> = {
      schema: { prop: 'value' },
      isValid: true,
      // errors 属性在有效时是可选的
    };
    const invalidResult: ProcessedSchema<SampleSchema> = {
      schema: { prop: 'value' },
      isValid: false,
      errors: [
        { message: 'error1', code: 'ERR1', path: 'prop' },
        // 更多 SchemaError... (这里不需要 SchemaError 类型注解，因为 TS 会推断)
      ],
    };

    expect(validResult).toBeDefined();
    expect(typeof validResult.schema).toBe('object');
    expect(typeof validResult.isValid).toBe('boolean');
    expect(validResult.errors).toBeUndefined();

    expect(invalidResult).toBeDefined();
    expect(typeof invalidResult.schema).toBe('object');
    expect(typeof invalidResult.isValid).toBe('boolean');
    expect(Array.isArray(invalidResult.errors)).toBe(true);
  });

  it('CT-Type-ProcSchema-02: ProcessedSchema<T> 应支持不同的泛型类型 T', () => {
    interface TypeA { a: number }
    interface TypeB { b: string }

    const resultA: ProcessedSchema<TypeA> = {
      schema: { a: 1 },
      isValid: true,
    };
    const resultB: ProcessedSchema<TypeB> = {
      schema: { b: 'text' },
      isValid: true,
    };

    expect(typeof resultA.schema.a).toBe('number');
    expect(typeof resultB.schema.b).toBe('string');
  });
});
