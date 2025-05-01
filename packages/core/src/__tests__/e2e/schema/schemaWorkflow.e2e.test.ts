import { describe, it, expect } from 'vitest';

import { processSchema } from '../../../api/schema'; // 导入 API 层

// 定义一些测试用的Schema类型和对象 (可以复用或单独定义)
interface SimpleSchema {
  element: string;
}

interface ComplexSchema {
  element: string;
  attributes?: Array<{ name: string; required?: boolean }>;
}

const validSchema: SimpleSchema = { element: 'input' };
const invalidSchema: ComplexSchema = {
  element: 'form',
  attributes: [{ name: '', required: true }] // 修复：添加 name 属性，即使是空字符串，以满足类型要求，但逻辑上仍会导致验证失败
};

describe('Schema Workflow E2E Tests', () => {
  it('E2E-Schema-Valid-01: 完整流程应正确处理有效的 Schema', () => {
    const result = processSchema(validSchema);

    expect(result).toBeDefined();
    expect(result.schema).toEqual(validSchema);
    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('E2E-Schema-Invalid-01: 完整流程应正确处理无效的 Schema 并返回错误', () => {
    const result = processSchema(invalidSchema);

    expect(result).toBeDefined();
    expect(result.schema).toEqual(invalidSchema);
    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors!.length).toBeGreaterThan(0);
    // 验证是否包含 MISSING_ATTRIBUTE_NAME 错误
    expect(result.errors!.some(e => e.code === 'MISSING_ATTRIBUTE_NAME')).toBe(true);
    // 可以检查错误的路径
    expect(result.errors!.some(e => e.path === 'attributes[0]')).toBe(true);
  });
});
