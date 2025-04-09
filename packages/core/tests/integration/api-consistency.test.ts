/**
 * API一致性测试
 * 
 * 验证API接口的一致性和正确定义
 */

import { expect, describe, it } from 'vitest';
import { 
  ValidationError, 
  ValidationErrorImpl,
  DefaultValidationError,
  ValidationResult,
  ValidationWarning,
  ErrorCode,
  ErrorLevel
} from '@core/errors/types';
import { TagDefinition } from '@core/parser/tag-definition';

describe('API一致性测试', () => {
  describe('ValidationError接口一致性', () => {
    it('应该能正确创建ValidationErrorImpl实例', () => {
      const error = new ValidationErrorImpl({
        code: ErrorCode.INVALID_ATTRIBUTE,
        message: '属性值无效',
        level: ErrorLevel.ERROR,
        position: { line: 1, column: 10, offset: 9 }
      });
      
      expect(error).toBeInstanceOf(ValidationErrorImpl);
      expect(error.code).toBe(ErrorCode.INVALID_ATTRIBUTE);
      expect(error.message).toBe('属性值无效');
    });
    
    it('DefaultValidationError应该是ValidationErrorImpl的别名', () => {
      const error = new DefaultValidationError({
        code: ErrorCode.INVALID_ATTRIBUTE,
        message: '属性值无效'
      });
      
      expect(error).toBeInstanceOf(ValidationErrorImpl);
    });
    
    it('ValidationError类应该是ValidationErrorImpl的别名', () => {
      // @ts-ignore - 我们知道ValidationError可以作为构造函数使用
      const error = new ValidationError({
        code: ErrorCode.INVALID_ATTRIBUTE,
        message: '属性值无效'
      });
      
      expect(error).toBeInstanceOf(ValidationErrorImpl);
    });
  });
  
  describe('ValidationResult接口一致性', () => {
    it('应该能创建有效的ValidationResult对象', () => {
      const result: ValidationResult = {
        valid: true
      };
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.warnings).toBeUndefined();
    });
    
    it('应该能使用错误和警告创建ValidationResult', () => {
      const error: ValidationError = {
        code: 'test-error',
        message: '测试错误'
      };
      
      const warning: ValidationWarning = {
        code: 'test-warning',
        message: '测试警告'
      };
      
      const result: ValidationResult = {
        valid: false,
        errors: [error],
        warnings: [warning]
      };
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe('test-error');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings![0].code).toBe('test-warning');
    });
  });
  
  describe('TagDefinition接口一致性', () => {
    it('应该支持对象形式的attributes', () => {
      const tagDef: TagDefinition = {
        name: 'test-tag',
        attributes: {
          id: { type: 'string', required: true },
          class: { type: 'string', required: false }
        },
        allowedChildren: ['child']
      };
      
      expect(tagDef.name).toBe('test-tag');
      expect(typeof tagDef.attributes).toBe('object');
      expect(Array.isArray(tagDef.attributes)).toBe(false);
      expect((tagDef.attributes as any).id.required).toBe(true);
    });
    
    it('应该支持数组形式的attributes（向后兼容）', () => {
      const tagDef: TagDefinition = {
        name: 'test-tag',
        attributes: ['id', 'class'],
        requiredAttributes: ['id'],
        allowedChildren: ['child']
      };
      
      expect(tagDef.name).toBe('test-tag');
      expect(Array.isArray(tagDef.attributes)).toBe(true);
      expect((tagDef.attributes as string[]).includes('id')).toBe(true);
      expect(tagDef.requiredAttributes).toContain('id');
    });
  });
}); 