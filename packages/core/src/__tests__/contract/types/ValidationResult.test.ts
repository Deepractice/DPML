/**
 * ValidationResult相关类型契约测试
 */
import { describe, test, expect } from 'vitest';

import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  DPMLNode
} from '../../../types';
import {
  ValidationErrorType
} from '../../../types';

// 创建模拟节点
function createMockNode(): DPMLNode {
  return {
    tagName: 'test',
    id: null,
    attributes: new Map(),
    children: [],
    content: '',
    parent: null,
    sourceLocation: {
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 12,
      getLineSnippet: () => ''
    },
    setId: () => {},
    getId: () => null,
    hasId: () => false,
    getAttributeValue: () => null,
    hasAttribute: () => false,
    setAttribute: () => {},
    appendChild: () => {},
    removeChild: () => {},
    hasChildren: () => false,
    hasContent: () => false
  };
}

describe('CT-ValidationResult-Structure', () => {
  test('should have ValidationErrorType enum with all required values', () => {
    // 验证所有错误类型枚举值
    expect(ValidationErrorType.INVALID_TAG).toBeDefined();
    expect(ValidationErrorType.MISSING_REQUIRED_ATTRIBUTE).toBeDefined();
    expect(ValidationErrorType.INVALID_ATTRIBUTE).toBeDefined();
    expect(ValidationErrorType.INVALID_CHILD_TAG).toBeDefined();
    expect(ValidationErrorType.INVALID_CONTENT).toBeDefined();
    expect(ValidationErrorType.DUPLICATE_ID).toBeDefined();
    expect(ValidationErrorType.CUSTOM).toBeDefined();

    // 验证错误类型枚举值的类型
    expect(typeof ValidationErrorType.INVALID_TAG).toBe('string');
    expect(typeof ValidationErrorType.MISSING_REQUIRED_ATTRIBUTE).toBe('string');
  });

  test('should have ValidationError interface with all required properties', () => {
    // 创建测试用验证错误
    const node = createMockNode();
    const error: ValidationError = {
      type: ValidationErrorType.INVALID_TAG,
      message: 'Invalid tag',
      node: node,
      location: node.sourceLocation,
      attributeName: 'id',
      suggestion: 'Use a valid tag name'
    };

    // 验证所有必要属性存在和类型
    expect(error).toHaveProperty('type');
    expect(error.type).toBe(ValidationErrorType.INVALID_TAG);

    expect(error).toHaveProperty('message');
    expect(typeof error.message).toBe('string');

    expect(error).toHaveProperty('node');
    expect(error.node).toBe(node);

    expect(error).toHaveProperty('location');
    expect(error.location).toBe(node.sourceLocation);

    // 验证可选属性
    expect(error).toHaveProperty('attributeName');
    expect(typeof error.attributeName).toBe('string');

    expect(error).toHaveProperty('suggestion');
    expect(typeof error.suggestion).toBe('string');
  });

  test('should have ValidationWarning interface with all required properties', () => {
    // 创建测试用验证警告
    const node = createMockNode();
    const warning: ValidationWarning = {
      message: 'Potential issue',
      node: node,
      location: node.sourceLocation,
      suggestion: 'Consider fixing this'
    };

    // 验证所有必要属性存在和类型
    expect(warning).toHaveProperty('message');
    expect(typeof warning.message).toBe('string');

    expect(warning).toHaveProperty('node');
    expect(warning.node).toBe(node);

    expect(warning).toHaveProperty('location');
    expect(warning.location).toBe(node.sourceLocation);

    // 验证可选属性
    expect(warning).toHaveProperty('suggestion');
    expect(typeof warning.suggestion).toBe('string');
  });

  test('should have ValidationResult interface with all required properties', () => {
    // 创建测试用验证结果
    const node = createMockNode();
    const error: ValidationError = {
      type: ValidationErrorType.INVALID_TAG,
      message: 'Invalid tag',
      node: node,
      location: node.sourceLocation
    };

    const warning: ValidationWarning = {
      message: 'Potential issue',
      node: node,
      location: node.sourceLocation
    };

    const result: ValidationResult = {
      valid: false,
      errors: [error],
      warnings: [warning]
    };

    // 验证所有必要属性存在和类型
    expect(result).toHaveProperty('valid');
    expect(typeof result.valid).toBe('boolean');

    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors[0]).toBe(error);

    expect(result).toHaveProperty('warnings');
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.warnings[0]).toBe(warning);
  });
});
