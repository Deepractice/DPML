/**
 * @dpml/prompt 错误处理测试
 * 
 * 测试ID:
 * - UT-ERR-001: 基本错误类 - 测试错误类的基本功能
 * - UT-ERR-002: 解析错误 - 测试解析阶段错误处理
 * - UT-ERR-003: 验证错误 - 测试验证阶段错误处理
 * - UT-ERR-004: 处理错误 - 测试处理阶段错误处理
 * - UT-ERR-005: 转换错误 - 测试转换阶段错误处理
 * - UT-ERR-006: 位置信息 - 测试错误位置信息准确性
 * - UT-ERR-007: 错误分类 - 测试不同类型的错误分类
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DPMLError, ErrorLevel, ErrorCode } from '@dpml/core';
import { 
  PromptError, 
  PromptErrorCode,
  ParseError,
  ValidationError,
  ProcessingError,
  TransformError
} from '../../errors';

describe('错误处理功能测试', () => {
  /**
   * UT-ERR-001: 基本错误类测试
   * 
   * 测试错误类的基本功能
   */
  it('基本错误类 (UT-ERR-001)', () => {
    // 创建基本错误
    const error = new PromptError({
      code: PromptErrorCode.UNKNOWN_ERROR,
      message: '测试错误消息',
      level: ErrorLevel.ERROR
    });
    
    // 测试基本属性
    expect(error.code).toBe(PromptErrorCode.UNKNOWN_ERROR);
    expect(error.message).toBe('测试错误消息');
    expect(error.level).toBe(ErrorLevel.ERROR);
    expect(error).toBeInstanceOf(DPMLError);
    
    // 测试toString方法
    expect(error.toString()).toContain(PromptErrorCode.UNKNOWN_ERROR);
    expect(error.toString()).toContain('测试错误消息');
    
    // 测试toJSON方法
    const jsonError = error.toJSON();
    expect(jsonError.code).toBe(PromptErrorCode.UNKNOWN_ERROR);
    expect(jsonError.message).toBe('测试错误消息');
    expect(jsonError.level).toBe(ErrorLevel.ERROR);
  });

  /**
   * UT-ERR-002: 解析错误测试
   * 
   * 测试解析阶段错误处理
   */
  it('解析错误 (UT-ERR-002)', () => {
    // 直接测试ParseError类的功能
    const parseError = new Error('解析错误');
    const error = ParseError.fromSyntaxError(parseError, {
      line: 3,
      column: 5,
      offset: 30
    });
    
    expect(error).toBeInstanceOf(ParseError);
    expect(error.code).toBe(PromptErrorCode.PARSE_ERROR);
    expect(error.message).toBe('解析错误');
    expect(error.position).toBeDefined();
    if (error.position) {
      expect(error.position.line).toBe(3);
      expect(error.position.column).toBe(5);
    }
    
    // 测试标签错误
    const tagError = ParseError.createInvalidTagError('invalid-tag', {
      line: 2,
      column: 3,
      offset: 10
    });
    
    expect(tagError).toBeInstanceOf(ParseError);
    expect(tagError.code).toBe(PromptErrorCode.INVALID_TAG);
    expect(tagError.message).toContain('invalid-tag');
  });

  /**
   * UT-ERR-003: 验证错误测试
   * 
   * 测试验证阶段错误处理
   */
  it('验证错误 (UT-ERR-003)', () => {
    // 直接测试ValidationError类的功能
    const attributeError = ValidationError.createInvalidAttributeError(
      'invalid-attr',
      'prompt',
      {
        line: 2,
        column: 10,
        offset: 15
      }
    );
    
    expect(attributeError).toBeInstanceOf(ValidationError);
    expect(attributeError.code).toBe(PromptErrorCode.INVALID_ATTRIBUTE);
    expect(attributeError.message).toContain('invalid-attr');
    expect(attributeError.message).toContain('prompt');
    expect(attributeError.tagName).toBe('prompt');
    expect(attributeError.attributeName).toBe('invalid-attr');
    
    // 测试嵌套错误
    const nestingError = ValidationError.createInvalidNestingError(
      'context',
      'role',
      {
        line: 3,
        column: 7,
        offset: 25
      }
    );
    
    expect(nestingError).toBeInstanceOf(ValidationError);
    expect(nestingError.code).toBe(PromptErrorCode.INVALID_NESTING);
    expect(nestingError.message).toContain('context');
    expect(nestingError.message).toContain('role');
    expect(nestingError.tagName).toBe('context');
  });

  /**
   * UT-ERR-004: 处理错误测试
   * 
   * 测试处理阶段错误处理
   */
  it('处理错误 (UT-ERR-004)', () => {
    // 直接测试ProcessingError类的功能
    const referenceError = ProcessingError.createReferenceError(
      'non-existent-prompt',
      '无法找到引用的提示',
      {
        line: 1,
        column: 20,
        offset: 20
      }
    );
    
    expect(referenceError).toBeInstanceOf(ProcessingError);
    expect(referenceError.code).toBe(PromptErrorCode.REFERENCE_ERROR);
    expect(referenceError.message).toContain('无法找到引用的提示');
    expect(referenceError.referencePath).toBe('non-existent-prompt');
    
    // 测试继承错误
    const inheritanceError = ProcessingError.createInheritanceError(
      '循环继承不允许',
      'circular/path',
      {
        line: 1,
        column: 15,
        offset: 15
      }
    );
    
    expect(inheritanceError).toBeInstanceOf(ProcessingError);
    expect(inheritanceError.code).toBe(PromptErrorCode.INHERITANCE_ERROR);
    expect(inheritanceError.message).toBe('循环继承不允许');
    expect(inheritanceError.referencePath).toBe('circular/path');
  });

  /**
   * UT-ERR-005: 转换错误测试
   * 
   * 测试转换阶段错误处理
   */
  it('转换错误 (UT-ERR-005)', () => {
    // 直接测试TransformError类的功能
    const inputError = TransformError.createInvalidInputError('无效的转换输入');
    
    expect(inputError).toBeInstanceOf(TransformError);
    expect(inputError.code).toBe(PromptErrorCode.TRANSFORM_ERROR);
    expect(inputError.message).toBe('无效的转换输入');
    
    // 测试格式化器错误
    const formatterError = TransformError.createFormatterError(
      'CustomFormatter',
      new Error('格式化失败'),
      {
        line: 1,
        column: 1,
        offset: 0
      }
    );
    
    expect(formatterError).toBeInstanceOf(TransformError);
    expect(formatterError.code).toBe(PromptErrorCode.FORMATTER_ERROR);
    expect(formatterError.message).toContain('CustomFormatter');
    expect(formatterError.message).toContain('格式化失败');
    expect(formatterError.formatter).toBe('CustomFormatter');
  });

  /**
   * UT-ERR-006: 位置信息测试
   * 
   * 测试错误位置信息准确性
   */
  it('位置信息 (UT-ERR-006)', () => {
    // 创建携带位置信息的错误
    const error = new PromptError({
      code: PromptErrorCode.VALIDATION_ERROR,
      message: '验证错误',
      level: ErrorLevel.ERROR,
      position: {
        line: 4,
        column: 10,
        offset: 50
      }
    });
    
    // 验证位置信息
    expect(error.position).toBeDefined();
    if (error.position) {
      expect(error.position.line).toBe(4);
      expect(error.position.column).toBe(10);
      expect(error.position.offset).toBe(50);
    }
    
    // 验证toString包含位置信息
    const errorString = error.toString();
    expect(errorString).toContain('line 4');
    expect(errorString).toContain('column 10');
  });

  /**
   * UT-ERR-007: 错误分类测试
   * 
   * 测试不同类型的错误分类
   */
  it('错误分类 (UT-ERR-007)', () => {
    // 测试未知错误转换
    const originalError = new Error('未处理的错误');
    const convertedError = PromptError.fromError(originalError);
    
    expect(convertedError).toBeInstanceOf(PromptError);
    expect(convertedError.code).toBe(PromptErrorCode.UNKNOWN_ERROR);
    expect(convertedError.message).toBe('未处理的错误');
    expect(convertedError.cause).toBe(originalError);
    
    // 测试从DPMLError转换
    const dpmlError = new DPMLError({
      code: ErrorCode.INVALID_NESTING,
      message: 'DPML嵌套错误',
      level: ErrorLevel.ERROR,
      position: {
        line: 3,
        column: 5,
        offset: 30
      }
    });
    
    const fromDpmlError = PromptError.fromError(dpmlError);
    expect(fromDpmlError).toBeInstanceOf(PromptError);
    expect(fromDpmlError.code).toBe(ErrorCode.INVALID_NESTING);
    expect(fromDpmlError.message).toBe('DPML嵌套错误');
    expect(fromDpmlError.level).toBe(ErrorLevel.ERROR);
    expect(fromDpmlError.position).toEqual(dpmlError.position);
  });
});