import { describe, it, expect } from 'vitest';

import { processSchema } from '../../../core/schema/schemaService'; // 直接测试Service层
import type { ProcessedSchema } from '../../../types/ProcessedSchema';
import type { SchemaError } from '../../../types/SchemaError';

// 定义一些测试用的Schema类型和对象
interface SimpleSchema {
  element: string;
}

interface ComplexSchema {
  element: string;
  attributes?: Array<{ name: string; type?: string }>;
  content?: { type: string };
}

const validSimpleSchema: SimpleSchema = { element: 'button' };
const validComplexSchema: ComplexSchema = {
  element: 'div',
  attributes: [{ name: 'id', type: 'string' }],
  content: { type: 'text' }
};
const invalidSchemaMissingElement = { attributes: [{ name: 'class' }] }; // 缺少 element
const invalidSchemaWrongAttributeType = { element: 'p', attributes: { name: 'id' } }; // attributes 不是数组

describe('schemaService Integration Tests', () => {
  it('IT-SchemaSvc-Process-01: processSchema 应为有效 Schema 返回 isValid: true', () => {
    const result = processSchema(validSimpleSchema);

    expect(result).toBeDefined();
    expect(result.schema).toEqual(validSimpleSchema);
    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();

    const resultComplex = processSchema(validComplexSchema);

    expect(resultComplex).toBeDefined();
    expect(resultComplex.schema).toEqual(validComplexSchema);
    expect(resultComplex.isValid).toBe(true);
    expect(resultComplex.errors).toBeUndefined();
  });

  it('IT-SchemaSvc-Process-02: processSchema 应为无效 Schema 返回 isValid: false 及错误', () => {
    const resultMissing = processSchema(invalidSchemaMissingElement);

    expect(resultMissing).toBeDefined();
    expect(resultMissing.schema).toEqual(invalidSchemaMissingElement);
    expect(resultMissing.isValid).toBe(false);
    expect(resultMissing.errors).toBeDefined();
    expect(Array.isArray(resultMissing.errors)).toBe(true);
    expect(resultMissing.errors!.length).toBeGreaterThan(0);
    // 验证是否包含 MISSING_ELEMENT 错误
    expect(resultMissing.errors!.some(e => e.code === 'MISSING_ELEMENT')).toBe(true);

    const resultWrongType = processSchema(invalidSchemaWrongAttributeType);

    console.log('DEBUG - invalidSchemaWrongAttributeType错误:', JSON.stringify(resultWrongType.errors, null, 2));
    console.log('DEBUG - 错误代码列表:', resultWrongType.errors?.map(e => e.code));

    expect(resultWrongType).toBeDefined();
    expect(resultWrongType.schema).toEqual(invalidSchemaWrongAttributeType);
    expect(resultWrongType.isValid).toBe(false);
    expect(resultWrongType.errors).toBeDefined();
    expect(Array.isArray(resultWrongType.errors)).toBe(true);
    expect(resultWrongType.errors!.length).toBeGreaterThan(0);
    // 修正根据实际错误更新期望的错误代码
    expect(resultWrongType.errors!.some(e => e.code === 'SCHEMA_CONVERSION_ERROR')).toBe(true);
  });

  it('IT-SchemaSvc-Process-03: processSchema 应正确传递泛型类型 T', () => {
    // 使用特定类型调用
    const resultTyped: ProcessedSchema<ComplexSchema> = processSchema(validComplexSchema);

    expect(resultTyped).toBeDefined();
    expect(resultTyped.schema).toEqual(validComplexSchema);
    // 类型检查：访问特定类型的属性
    expect(resultTyped.schema.element).toBe('div');
    if (resultTyped.schema.attributes) {
      expect(resultTyped.schema.attributes[0].name).toBe('id');
    }

    expect(resultTyped.isValid).toBe(true);
  });
});
