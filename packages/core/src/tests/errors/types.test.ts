import { describe, it, expect } from 'vitest';
import { 
  DPMLError, ParseError, ValidationError, ReferenceError,
  ErrorLevel, ErrorCode
} from '../../errors/types';

describe('错误类型系统', () => {
  describe('基础错误类', () => {
    it('应该具有正确的属性', () => {
      const error = new DPMLError({
        code: ErrorCode.UNKNOWN_ERROR,
        message: '测试错误',
        level: ErrorLevel.ERROR,
        position: { line: 1, column: 10, offset: 9 }
      });

      expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(error.message).toBe('测试错误');
      expect(error.level).toBe(ErrorLevel.ERROR);
      expect(error.position?.line).toBe(1);
      expect(error.position?.column).toBe(10);
      expect(error.position?.offset).toBe(9);
      expect(error.toString()).toContain('测试错误');
      expect(error.toString()).toContain('line 1');
    });

    it('应该支持可选的位置信息', () => {
      const error = new DPMLError({
        code: ErrorCode.UNKNOWN_ERROR,
        message: '测试错误',
        level: ErrorLevel.WARNING
      });

      expect(error.position).toBeUndefined();
      expect(error.toString()).toContain('测试错误');
      expect(error.toString()).not.toContain('line');
    });
  });

  describe('解析错误类', () => {
    it('应该继承自基础错误类', () => {
      const error = new ParseError({
        code: ErrorCode.SYNTAX_ERROR,
        message: '解析错误',
        position: { line: 2, column: 5, offset: 15 }
      });

      expect(error).toBeInstanceOf(DPMLError);
      expect(error.code).toBe(ErrorCode.SYNTAX_ERROR);
      expect(error.level).toBe(ErrorLevel.ERROR);
      expect(error.position?.line).toBe(2);
    });
  });

  describe('验证错误类', () => {
    it('应该继承自基础错误类', () => {
      const error = new ValidationError({
        code: ErrorCode.INVALID_ATTRIBUTE,
        message: '验证错误',
        position: { line: 3, column: 8, offset: 25 }
      });

      expect(error).toBeInstanceOf(DPMLError);
      expect(error.code).toBe(ErrorCode.INVALID_ATTRIBUTE);
      expect(error.level).toBe(ErrorLevel.ERROR);
      expect(error.position?.line).toBe(3);
    });
  });

  describe('引用错误类', () => {
    it('应该继承自基础错误类', () => {
      const error = new ReferenceError({
        code: ErrorCode.REFERENCE_NOT_FOUND,
        message: '引用错误',
        position: { line: 4, column: 12, offset: 35 },
        referenceUri: 'http://example.com'
      });

      expect(error).toBeInstanceOf(DPMLError);
      expect(error.code).toBe(ErrorCode.REFERENCE_NOT_FOUND);
      expect(error.level).toBe(ErrorLevel.ERROR);
      expect(error.position?.line).toBe(4);
      expect(error.referenceUri).toBe('http://example.com');
    });
  });

  describe('错误级别', () => {
    it('应该定义了所有必需的级别', () => {
      expect(ErrorLevel.FATAL).toBe('fatal');
      expect(ErrorLevel.ERROR).toBe('error');
      expect(ErrorLevel.WARNING).toBe('warning');
      expect(ErrorLevel.INFO).toBe('info');
    });
  });

  describe('错误代码', () => {
    it('应该定义了所有必需的错误代码', () => {
      // 通用错误
      expect(ErrorCode.UNKNOWN_ERROR).toBe('unknown-error');
      
      // 解析错误
      expect(ErrorCode.SYNTAX_ERROR).toBe('syntax-error');
      expect(ErrorCode.INVALID_XML).toBe('invalid-xml');
      expect(ErrorCode.UNCLOSED_TAG).toBe('unclosed-tag');
      
      // 验证错误
      expect(ErrorCode.INVALID_ATTRIBUTE).toBe('invalid-attribute');
      expect(ErrorCode.MISSING_REQUIRED_ATTRIBUTE).toBe('missing-required-attribute');
      expect(ErrorCode.INVALID_NESTING).toBe('invalid-nesting');
      
      // 引用错误
      expect(ErrorCode.REFERENCE_NOT_FOUND).toBe('reference-not-found');
      expect(ErrorCode.INVALID_REFERENCE).toBe('invalid-reference');
      expect(ErrorCode.CIRCULAR_REFERENCE).toBe('circular-reference');
    });
  });
}); 