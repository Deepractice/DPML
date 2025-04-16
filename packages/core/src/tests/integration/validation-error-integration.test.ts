/**
 * ValidationError集成测试
 * 
 * 验证ValidationError接口和DefaultValidationError类的一致性
 */

import { expect, describe, it } from 'vitest';
import { 
  DefaultValidationError, 
  ValidationError, 
  ErrorLevel, 
  ErrorCode 
} from '@core/errors/types';
import { ValidationResult, ValidationWarning } from '@core/parser/tag-definition';

describe('ValidationError集成测试', () => {
  describe('DefaultValidationError类和ValidationError接口', () => {
    it('应该能正确创建DefaultValidationError实例', () => {
      const error = new DefaultValidationError({
        code: ErrorCode.INVALID_ATTRIBUTE,
        message: '属性值无效',
        level: ErrorLevel.ERROR,
        position: { line: 1, column: 10, offset: 9 }
      });
      
      expect(error).toBeInstanceOf(DefaultValidationError);
      expect(error.code).toBe(ErrorCode.INVALID_ATTRIBUTE);
      expect(error.message).toBe('属性值无效');
      expect(error.level).toBe(ErrorLevel.ERROR);
      expect(error.position).toEqual({ line: 1, column: 10, offset: 9 });
    });
    
    it('应该能将DefaultValidationError转换为ValidationError格式', () => {
      const error = new DefaultValidationError({
        code: ErrorCode.INVALID_ATTRIBUTE,
        message: '属性值无效',
        level: ErrorLevel.ERROR,
        position: { line: 1, column: 10, offset: 9 }
      });
      
      const errorData = error.toValidationData();
      
      expect(errorData).toEqual({
        code: ErrorCode.INVALID_ATTRIBUTE,
        message: '属性值无效',
        position: { line: 1, column: 10, offset: 9 }
      });
    });
    
    it('应该能从ValidationError创建DefaultValidationError', () => {
      const errorData: ValidationError = {
        code: ErrorCode.MISSING_REQUIRED_ATTRIBUTE,
        message: '缺少必需的属性',
        position: { line: 2, column: 5, offset: 15 }
      };
      
      const error = DefaultValidationError.fromValidationData(errorData);
      
      expect(error).toBeInstanceOf(DefaultValidationError);
      expect(error.code).toBe(ErrorCode.MISSING_REQUIRED_ATTRIBUTE);
      expect(error.message).toBe('缺少必需的属性');
      expect(error.level).toBe(ErrorLevel.ERROR); // 默认级别
      expect(error.position).toEqual({ line: 2, column: 5, offset: 15 });
    });
    
    it('应该能使用指定错误级别创建DefaultValidationError', () => {
      const errorData: ValidationError = {
        code: ErrorCode.INVALID_NESTING,
        message: '标签嵌套无效',
        position: { line: 3, column: 7, offset: 25 }
      };
      
      const error = DefaultValidationError.fromValidationData(errorData, ErrorLevel.WARNING);
      
      expect(error).toBeInstanceOf(DefaultValidationError);
      expect(error.code).toBe(ErrorCode.INVALID_NESTING);
      expect(error.message).toBe('标签嵌套无效');
      expect(error.level).toBe(ErrorLevel.WARNING); // 指定级别
      expect(error.position).toEqual({ line: 3, column: 7, offset: 25 });
    });
  });
  
  describe('ValidationResult类型', () => {
    it('应该支持包含ValidationError的ValidationResult', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: ErrorCode.MISSING_REQUIRED_ATTRIBUTE,
            message: '缺少必需的属性: id',
            position: { line: 5, column: 3, offset: 50 }
          }
        ]
      };
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe(ErrorCode.MISSING_REQUIRED_ATTRIBUTE);
    });
    
    it('应该能使用DefaultValidationError.toValidationData()创建ValidationResult', () => {
      const error = new DefaultValidationError({
        code: ErrorCode.INVALID_ATTRIBUTE,
        message: '属性值无效',
        level: ErrorLevel.ERROR,
        position: { line: 1, column: 10, offset: 9 }
      });
      
      const result: ValidationResult = {
        valid: false,
        errors: [error.toValidationData()]
      };
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe(ErrorCode.INVALID_ATTRIBUTE);
      expect(result.errors![0].message).toBe('属性值无效');
    });
    
    it('应该支持同时包含错误和警告', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: ErrorCode.MISSING_REQUIRED_ATTRIBUTE,
            message: '缺少必需的属性: id',
            position: { line: 5, column: 3, offset: 50 }
          }
        ],
        warnings: [
          {
            code: 'deprecated-attribute',
            message: '属性已过时: style',
            position: { line: 6, column: 5, offset: 60 }
          }
        ]
      };
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.errors![0].code).toBe(ErrorCode.MISSING_REQUIRED_ATTRIBUTE);
      expect(result.warnings![0].code).toBe('deprecated-attribute');
    });
  });
  
  describe('ValidationWarning接口', () => {
    it('应该支持基本的警告信息', () => {
      const warning: ValidationWarning = {
        code: 'unknown-attribute',
        message: '未知属性: xyz',
        position: { line: 10, column: 8, offset: 100 }
      };
      
      expect(warning.code).toBe('unknown-attribute');
      expect(warning.message).toBe('未知属性: xyz');
      expect(warning.position).toEqual({ line: 10, column: 8, offset: 100 });
    });
    
    it('应该支持没有位置信息的警告', () => {
      const warning: ValidationWarning = {
        code: 'deprecated-tag',
        message: '标签已废弃: marquee'
      };
      
      expect(warning.code).toBe('deprecated-tag');
      expect(warning.message).toBe('标签已废弃: marquee');
      expect(warning.position).toBeUndefined();
    });
  });
}); 