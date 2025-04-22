import { describe, test, expect } from 'vitest';

import type { ValidationResult, ProcessingError, ProcessingWarning } from '../../../types';

/**
 * ValidationResult接口契约测试
 * 验证验证结果接口的结构稳定性和错误/警告集合类型
 */
describe('ValidationResult Interface Contract', () => {
  // CT-TYPE-VRES-01: ValidationResult 接口应维持结构稳定性
  test('ValidationResult 接口应维持结构稳定性', () => {
    // 创建符合接口的对象
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 验证基本结构
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');

    // 验证属性类型（仅在编译时有效，运行时不执行）

    const typedResult: {
      isValid: boolean;
      errors: ReadonlyArray<ProcessingError>;
      warnings: ReadonlyArray<ProcessingWarning>;
    } = result;
  });

  // CT-TYPE-VRES-02: ValidationResult 应包含 ReadonlyArray 错误和警告
  test('ValidationResult 应包含 ReadonlyArray 错误和警告', () => {
    // 创建示例错误和警告
    const mockError: ProcessingError = {
      code: 'ERR-001',
      message: '错误消息',
      path: '/root/element',
      source: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 10 },
      severity: 'error'
    };

    const mockWarning: ProcessingWarning = {
      code: 'WARN-001',
      message: '警告消息',
      path: '/root/element',
      source: { startLine: 2, startColumn: 2, endLine: 2, endColumn: 15 },
      severity: 'warning'
    };

    // 创建结果对象
    const result: ValidationResult = {
      isValid: false,
      errors: [mockError],
      warnings: [mockWarning]
    };

    // 验证数组是否为只读
    type ErrorsArrayType = ValidationResult['errors'];
    type WarningsArrayType = ValidationResult['warnings'];

    // 以下代码应在TypeScript编译时报错（仅为验证只读类型，不会执行）
    const testReadOnly = () => {
      // @ts-expect-error: ReadonlyArray不允许修改
      result.errors.push(mockError);
      // @ts-expect-error: ReadonlyArray不允许修改
      result.warnings.push(mockWarning);
    };

    // 运行时验证
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.errors.length).toBe(1);
    expect(result.warnings.length).toBe(1);
    expect(result.errors[0]).toBe(mockError);
    expect(result.warnings[0]).toBe(mockWarning);

    // 验证错误和警告的结构
    expect(result.errors[0]).toHaveProperty('code');
    expect(result.errors[0]).toHaveProperty('message');
    expect(result.errors[0]).toHaveProperty('path');
    expect(result.errors[0]).toHaveProperty('source');
    expect(result.errors[0]).toHaveProperty('severity');
    expect(result.errors[0].severity).toBe('error');

    expect(result.warnings[0]).toHaveProperty('code');
    expect(result.warnings[0]).toHaveProperty('message');
    expect(result.warnings[0]).toHaveProperty('path');
    expect(result.warnings[0]).toHaveProperty('source');
    expect(result.warnings[0]).toHaveProperty('severity');
    expect(result.warnings[0].severity).toBe('warning');
  });
});
